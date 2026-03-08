import { SafefyPaymentSDK } from '@safefypay/safefy-sdk-node';

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

// Get credentials from environment or use fallback provided by user
const PUBLIC_KEY = process.env.SAFEPAY_PUBLIC_KEY || 'pk_production_2dd5d41e4f3c44b50c32ed2ecd459a68f0bc1628b3276834';
const SECRET_KEY = process.env.SAFEPAY_SECRET_KEY || 'sk_production_c4739b936e5341ce4f205dc1acdcc508453602a635f03d9f67ff7595222435af';

const sdk = new SafefyPaymentSDK({
  publicKey: PUBLIC_KEY,
  secretKey: SECRET_KEY,
});

export async function createPixPayment(request: PaymentRequest): Promise<PixPaymentResponse> {
  const { amount, description, externalId, customer } = request;

  try {
    const payload: any = {
      method: 'Pix',
      amount,
      currency: 'BRL',
      description,
    };

    if (externalId) payload.externalId = externalId;

    if (customer) {
      if (customer.name) payload.customerName = customer.name;
      if (customer.document) payload.customerDocument = customer.document.replace(/\D/g, '');
      if (customer.email) payload.customerEmail = customer.email;
      if (customer.phone) payload.customerPhone = customer.phone.replace(/\D/g, '');
    }

    console.log('📤 Enviando requisição para SafeFyPay usando o SDK...');
    const transaction = await sdk.transactions.create(payload);

    const pixCopyPaste = transaction.pix?.copyAndPaste;
    const qrCodeImageUrl = pixCopyPaste 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCopyPaste)}` 
      : undefined;

    return {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      method: transaction.method,
      description: transaction.description || description,
      pixCode: pixCopyPaste,
      qrCode: pixCopyPaste,
      qrCodeImage: qrCodeImageUrl, 
      expiresAt: transaction.expiresAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.completedAt,
    };
  } catch (error) {
    console.error('Erro na integração com SafeFyPay:', error);
    throw error;
  }
}

export async function getPaymentStatus(paymentId: string): Promise<PixPaymentResponse> {
  try {
    const transaction = await sdk.transactions.get(paymentId);
    return {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      method: transaction.method,
      description: transaction.description || '',
      createdAt: transaction.createdAt,
      updatedAt: transaction.completedAt,
    };
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw error;
  }
}
