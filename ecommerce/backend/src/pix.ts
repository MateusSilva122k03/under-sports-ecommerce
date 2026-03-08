// PIX Payment Integration via SafeFyPay
import fetch from 'node-fetch';

interface PaymentRequest {
  amount: number; // in cents
  description: string;
  externalId?: string;
  customer?: {
    name?: string;
    email?: string;
    document?: string;
    phone?: string;
  };
}

interface PixPaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  method: string;
  description: string;
  pixKey?: string;
  pixCode?: string;
  qrCode?: string;
  qrCodeImage?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export async function createPixPayment(request: PaymentRequest): Promise<PixPaymentResponse> {
  const { amount, description, externalId, customer } = request;

  const SAFEPAY_API_URL = 'https://api-payment.safefypay.com.br';
  const SECRET_KEY = process.env.SAFEPAY_SECRET_KEY || 'sk_production_e36cc2ffba6f8d9ec825eaaca0ad0227205ba26da5a03ab2981ef5527e53060a';

  // Payload structure based on SafeFyPay documentation
  const payload: any = {
    method: 'Pix',
    amount,
    currency: 'BRL',
    description,
  };

  if (externalId) payload.externalId = externalId;
  
  if (customer) {
    if (customer.name) payload.customerName = customer.name;
    if (customer.document) payload.customerDocument = customer.document.replace(/\D/g, ''); // Ensure only numbers
    if (customer.email) payload.customerEmail = customer.email;
    if (customer.phone) payload.customerPhone = customer.phone.replace(/\D/g, ''); // Ensure only numbers
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SECRET_KEY}`,
  };

  try {
    console.log('📤 Enviando requisição para SafeFyPay...');
    console.log('🔑 Secret Key (primeiros 20 chars):', SECRET_KEY.substring(0, 20));
    console.log('📦 Payload:', JSON.stringify(payload));
    
    const apiResponse = await fetch(`${SAFEPAY_API_URL}/v1/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const rawText = await apiResponse.text();
    console.log('📥 Resposta brute:', rawText);
    
    let responseJson: any = {};

    try {
      if (rawText) {
        responseJson = JSON.parse(rawText);
      }
    } catch (parseError) {
      console.error('Failed to parse SafeFyPay response. Raw body:', rawText);
      throw new Error(`Resposta inválida do gateway (Status ${apiResponse.status}): ${rawText}`);
    }

    if (!apiResponse.ok || responseJson.error) {
      console.error('SafeFyPay Error Response:', rawText);
      throw new Error(responseJson.error?.message || responseJson.message || `Erro do Gateway (Status ${apiResponse.status}): ${rawText}`);
    }

    const data = responseJson.data;

    if (!data) {
       throw new Error(`Estrutura de resposta inesperada do Gateway. Body: ${rawText}`);
    }

    const pixCopyPaste = data.pix?.copyAndPaste;
    const qrCodeImageUrl = pixCopyPaste 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCopyPaste)}` 
      : undefined;

    return {
      id: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      description: data.description || description,
      pixCode: pixCopyPaste,
      qrCode: pixCopyPaste,
      qrCodeImage: qrCodeImageUrl, 
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
      updatedAt: data.completedAt,
    };
  } catch (error) {
    console.error('Erro na integração com SafeFyPay:', error);
    throw error;
  }
}

export async function getPaymentStatus(paymentId: string): Promise<PixPaymentResponse> {
  const SAFEPAY_API_URL = 'https://api-payment.safefypay.com.br';
  const SECRET_KEY = process.env.SAFEPAY_SECRET_KEY || 'sk_production_e36cc2ffba6f8d9ec825eaaca0ad0227205ba26da5a03ab2981ef5527e53060a';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SECRET_KEY}`,
  };
  
  try {
    const apiResponse = await fetch(`${SAFEPAY_API_URL}/v1/transactions/${paymentId}`, {
      method: 'GET',
      headers,
    });
    
    const rawText = await apiResponse.text();
    let responseJson: any = {};

    try {
      if (rawText) {
        responseJson = JSON.parse(rawText);
      }
    } catch (parseError) {
      console.error('Failed to parse SafeFyPay status response. Raw body:', rawText);
      throw new Error(`Resposta de status inválida (Status ${apiResponse.status}).`);
    }

    if (!apiResponse.ok || responseJson.error) {
      throw new Error(responseJson.error?.message || responseJson.message || 'Falha ao checar status no SafeFyPay');
    }
    
    const data = responseJson.data;

    return {
      id: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.completedAt,
    };
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
}
