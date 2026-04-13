// Load environment variables FIRST from file system, then from system env vars
import { loadEnvFile, validateEnvVars } from './env-loader';

// Attempt to load .env file from multiple locations
loadEnvFile();

// Validate that required variables are set
validateEnvVars();

// Use dotenv as fallback (in case some vars weren't loaded from file)
require('dotenv').config();

import express from 'express';
import cors from 'cors';
import { createPixPayment, getPaymentStatus, warmupSDK } from './pix';
import { consultCpf } from './checkify';
import { initDb, saveOrder, updateOrderStatus, getOrderByExternalId } from './db';
import { sendCAPIEvent } from './capi';
import { sendPixEmail, sendPaymentApprovedEmail } from './mailer';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Database
initDb();

// Warmup SDK during startup (ensures credentials are ready)
warmupSDK().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Helper to handle payment success (update DB, send CAPI, send email)
async function handlePaymentSuccess(paymentId: string, order: any, origin?: string) {
  if (order && order.status !== 'Paid') {
    console.log(`✅ Pagamento ${paymentId} confirmado. Atualizando banco e disparando ações.`);
    await updateOrderStatus(paymentId, 'Paid');

    // Send CAPI Purchase Event
    await sendCAPIEvent(
      'Purchase',
      origin || 'https://undersports.shop',
      {
        email: order.email,
        phone: order.phone,
      },
      { currency: 'BRL', value: order.amount / 100 }
    );

    // Send Success Email
    if (order.email) {
      await sendPaymentApprovedEmail({
        email: order.email,
        name: order.name,
        orderId: paymentId.substring(0, 8),
        amount: (order.amount / 100).toFixed(2).replace('.', ',')
      });
    }
    return true;
  }
  return false;
}

// PIX Payment routes
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, description, customer, externalId, shippingMethod } = req.body;

    if (!amount || !description) {
      return res.status(400).json({
        error: { message: 'Amount and description are required' }
      });
    }

    const extId = externalId || `order_${Date.now()}`;

    const payment = await createPixPayment({
      amount,
      description,
      externalId: extId,
      customer
    });

    // Save Lead & Order to DB
    if (customer) {
      await saveOrder({
        external_id: payment.id, // Save transaction ID to query later
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        document: customer.document || '',
        amount: amount,
        status: 'Pending',
        pix_code: payment.pixCode || '',
        shipping_method: shippingMethod || 'normal'
      });

      // Send CAPI InitiateCheckout Event
      await sendCAPIEvent(
        'InitiateCheckout',
        req.headers.origin || 'https://undersports.shop',
        {
          email: customer.email,
          phone: customer.phone,
          clientIpAddress: req.ip || req.socket.remoteAddress,
          clientUserAgent: req.headers['user-agent'],
        },
        { currency: 'BRL', value: amount / 100 }
      );

      // Send PIX Email
      if (customer.email && payment.pixCode) {
        await sendPixEmail({
          email: customer.email,
          name: customer.name || 'Cliente',
          orderId: payment.id.substring(0, 8),
          amount: (amount / 100).toFixed(2).replace('.', ','),
          pixCode: payment.pixCode
        });
      }
    }

    res.json(payment);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      error: { message: error instanceof Error ? error.message : 'Erro ao criar pagamento' }
    });
  }
});

// Webhook route for SafeFyPay
app.post('/api/webhook/safefypay', async (req, res) => {
  try {
    const payload = req.body;
    console.log('📬 Webhook recebido da SafeFyPay:', JSON.stringify(payload, null, 2));

    const { id, status } = payload;

    if (!id || !status) {
      console.warn('⚠️ Webhook recebido sem ID ou Status');
      return res.status(400).send('Invalid payload');
    }

    const statusLower = status.toLowerCase();
    const isApproved = ['paid', 'completed', 'approved', 'sucesso', 'success'].includes(statusLower);

    if (isApproved) {
      const order = await getOrderByExternalId(id);
      if (order) {
        await handlePaymentSuccess(id, order);
      } else {
        console.warn(`⚠️ Pedido ${id} não encontrado no banco de dados para atualização via Webhook.`);
      }
    } else {
      console.log(`ℹ️ Webhook recebido com status: ${status}. Nenhuma ação necessária.`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentStatus(id);

    // Check if status changed to Paid
    const statusLower = payment.status.toLowerCase();
    const isApproved = ['paid', 'completed', 'approved', 'sucesso', 'success'].includes(statusLower);

    if (isApproved) {
      const order = await getOrderByExternalId(id);
      if (order) {
        await handlePaymentSuccess(id, order, req.headers.origin);
      }
    }

    res.json(payment);
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      error: { message: error instanceof Error ? error.message : 'Erro ao buscar pagamento' }
    });
  }
});

// Checkify Route
app.get('/api/consult-cpf/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;

    if (!cpf) {
      return res.status(400).json({ error: { message: 'CPF é obrigatório' } });
    }

    // Validate CPF format (must be 11 digits)
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      return res.status(400).json({ error: { message: 'CPF deve conter 11 dígitos' } });
    }

    console.log('🔎 Consultando CPF no endpoint:', cleanCpf);
    const data = await consultCpf(cpf);

    res.json({ data });
  } catch (error) {
    console.error('Checkify API route error:', error);
    res.status(500).json({
      error: { message: error instanceof Error ? error.message : 'Erro ao consultar CPF' }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on port ${PORT}`);
});

export default app;
