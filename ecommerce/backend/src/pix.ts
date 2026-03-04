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
  // Pega a variável injetada pelo Dokploy. Caso não encontre, usamos o fallback apenas para dev/teste local temporário.
  const SECRET_KEY = process.env.SAFEPAY_SECRET_KEY || 'sk_production_3f5bfb46f5eb9a0595d729da4042f3d6c709ee24a49da32a81eb08d3cb8c2221';

  // O payload de acordo com a documentação da SafeFyPay
  const payload: any = {
    method: 'Pix',
    amount,
    currency: 'BRL',
    description,
  };

  if (externalId) payload.externalId = externalId;
  
  if (customer) {
    if (customer.name) payload.customerName = customer.name;
    if (customer.document) payload.customerDocument = customer.document;
    if (customer.email) payload.customerEmail = customer.email;
    if (customer.phone) payload.customerPhone = customer.phone;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SECRET_KEY}`,
  };

  try {
    const apiResponse = await fetch(`${SAFEPAY_API_URL}/v1/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseJson: any = await apiResponse.json();

    if (!apiResponse.ok || responseJson.error) {
      throw new Error(responseJson.error?.message || responseJson.message || 'Falha ao comunicar com SafeFyPay');
    }

    // A resposta fica dentro de `data`
    const data = responseJson.data;

    // A SafeFyPay não retorna imagem do QR code, apenas o "copia e cola".
    // Vamos gerar a imagem do QR Code usando a api do Google Chart / api.qrserver para o frontend não se preocupar com libs extras se possível.
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
      qrCode: pixCopyPaste, // Fallback para compatibilidade do frontend
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
  const SECRET_KEY = process.env.SAFEPAY_SECRET_KEY || 'sk_production_3f5bfb46f5eb9a0595d729da4042f3d6c709ee24a49da32a81eb08d3cb8c2221';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SECRET_KEY}`,
  };
  
  try {
    const apiResponse = await fetch(`${SAFEPAY_API_URL}/v1/transactions/${paymentId}`, {
      method: 'GET',
      headers,
    });
    
    const responseJson: any = await apiResponse.json();
    
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
