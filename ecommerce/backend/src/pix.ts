// PIX Payment Integration via SafeFyPay
import fetch from 'node-fetch';

// Cache for access token
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

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

// Get credentials from environment or use fallback
function getCredentials() {
  const PUBLIC_KEY = process.env.SAFEPAY_PUBLIC_KEY || 'pk_production_2dd5d41e4f3c44b50c32ed2ecd459a68f0bc1628b3276834';
  const SECRET_KEY = process.env.SAFEPAY_SECRET_KEY || 'sk_production_c4739b936e5341ce4f205dc1acdcc508453602a635f03d9f67ff7595222435af';
  return { PUBLIC_KEY, SECRET_KEY };
}

// Generate access token using OAuth2 Client Credentials flow
async function generateAccessToken(): Promise<string> {
  const { PUBLIC_KEY, SECRET_KEY } = getCredentials();
  const SAFEPAY_API_URL = 'https://api-payment.safefypay.com.br';

  // Check if we have a valid cached token
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    console.log('♻️ Using cached access token');
    return cachedToken.accessToken;
  }

  console.log('🔐 Generating new access token from SafeFyPay...');
  console.log('📝 Public Key:', PUBLIC_KEY.substring(0, 20) + '...');

  const payload = {
    publicKey: PUBLIC_KEY,
    secretKey: SECRET_KEY,
    grantType: 'client_credentials'
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(`${SAFEPAY_API_URL}/v1/auth/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();
    console.log('📥 Auth response:', rawText);

    let responseJson: any = {};
    if (rawText) {
      responseJson = JSON.parse(rawText);
    }

    if (!response.ok || responseJson.error) {
      throw new Error(responseJson.error?.message || responseJson.message || `Auth failed (Status ${response.status}): ${rawText}`);
    }

    const data = responseJson.data;
    if (!data || !data.accessToken) {
      throw new Error('No access token returned');
    }

    // Cache the token, subtract 60 seconds to be safe
    cachedToken = {
      accessToken: data.accessToken,
      expiresAt: Date.now() + (data.expiresIn - 60) * 1000
    };

    console.log('✅ Access token generated successfully');
    return data.accessToken;
  } catch (error) {
    console.error('❌ Error generating access token:', error);
    throw error;
  }
}

export async function createPixPayment(request: PaymentRequest): Promise<PixPaymentResponse> {
  const { amount, description, externalId, customer } = request;
  const SAFEPAY_API_URL = 'https://api-payment.safefypay.com.br';

  try {
    // Get access token first
    const accessToken = await generateAccessToken();

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
      'Authorization': `Bearer ${accessToken}`,
    };

    console.log('📤 Enviando requisição para SafeFyPay...');
    console.log('🔑 Access Token (primeiros 20 chars):', accessToken.substring(0, 20));
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
      
      // If token expired, clear cache and retry once
      if (responseJson.error?.code === 'unauthorized' || responseJson.error?.code === 'invalid_token') {
        console.log('🔄 Token may have expired, clearing cache and retrying...');
        cachedToken = null;
        
        // Retry with new token
        const newAccessToken = await generateAccessToken();
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        const retryResponse = await fetch(`${SAFEPAY_API_URL}/v1/transactions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        
        const retryText = await retryResponse.text();
        console.log('📥 Retry response:', retryText);
        
        if (!retryResponse.ok) {
          throw new Error(`Erro do Gateway após retry (Status ${retryResponse.status}): ${retryText}`);
        }
        
        responseJson = JSON.parse(retryText);
      } else {
        throw new Error(responseJson.error?.message || responseJson.message || `Erro do Gateway (Status ${apiResponse.status}): ${rawText}`);
      }
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
  
  try {
    const accessToken = await generateAccessToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
    
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
