import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPixPayment, getPaymentStatus } from './pix';
import { consultCpf } from './checkify';
import { initDb, saveOrder, updateOrderStatus, getOrderByExternalId } from './db';
import { sendCAPIEvent } from './capi';
import { sendPixEmail, sendPaymentApprovedEmail } from './mailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Database
initDb();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// PIX Payment routes
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, description, customer, externalId } = req.body;
    
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
        pix_code: payment.pixCode || ''
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

app.get('/api/payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentStatus(id);

    // Check if status changed to Paid
    const statusLower = payment.status.toLowerCase();
    if (statusLower === 'paid' || statusLower === 'completed' || statusLower === 'approved') {
      const order = await getOrderByExternalId(id);
      
      // If it was not marked as Paid in our DB yet
      if (order && order.status !== 'Paid') {
        await updateOrderStatus(id, 'Paid');

        // Send CAPI Purchase Event
        await sendCAPIEvent(
          'Purchase',
          req.headers.origin || 'https://undersports.shop',
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
            orderId: id.substring(0, 8),
            amount: (order.amount / 100).toFixed(2).replace('.', ',')
          });
        }
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
      return res.status(400).json({ error: { message: 'CPF is required' } });
    }
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
