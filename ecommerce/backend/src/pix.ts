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

/**
 * LAZY LOAD SDK - Only initialize when first needed
 * This ensures environment variables are loaded before SDK instantiation
 */
let sdkInstance: SafefyPaymentSDK | null = null;

function initializeSDK(): SafefyPaymentSDK {
  if (sdkInstance) {
    return sdkInstance;
  }

  const PUBLIC_KEY = process.env.SAFEPAY_PUBLIC_KEY || '';
  const SECRET_KEY = process.env.SAFEPAY_SECRET_KEY || '';

  // Debug: log credential status with detailed validation
  console.log('\n🔐 SafeFyPay SDK Initialization:');
  console.log(`   PUBLIC_KEY loaded: ${PUBLIC_KEY ? '✅ Yes' : '❌ No (empty)'}`);
  console.log(`   SECRET_KEY loaded: ${SECRET_KEY ? '✅ Yes' : '❌ No (empty)'}`);

  if (!PUBLIC_KEY || !SECRET_KEY) {
    throw new Error('❌ FATAL: SafeFyPay credentials not loaded! Cannot initialize SDK.');
  }

  if (PUBLIC_KEY) {
    console.log(`   PUBLIC_KEY length: ${PUBLIC_KEY.length} chars`);
    console.log(`   PUBLIC_KEY starts with: ${PUBLIC_KEY.substring(0, 15)}...`);
    console.log(`   PUBLIC_KEY format valid: ${PUBLIC_KEY.startsWith('pk_') ? '✅ Yes (pk_)' : '❌ No (expected pk_)'}`);
  }
  if (SECRET_KEY) {
    console.log(`   SECRET_KEY length: ${SECRET_KEY.length} chars`);
    console.log(`   SECRET_KEY starts with: ${SECRET_KEY.substring(0, 15)}...`);
    console.log(`   SECRET_KEY format valid: ${SECRET_KEY.startsWith('sk_') ? '✅ Yes (sk_)' : '❌ No (expected sk_)'}`);
  }

  // Check for whitespace issues
  if (/\s/.test(PUBLIC_KEY)) {
    throw new Error('❌ FATAL: PUBLIC_KEY contains whitespace! This will cause auth errors.');
  }
  if (/\s/.test(SECRET_KEY)) {
    throw new Error('❌ FATAL: SECRET_KEY contains whitespace! This will cause auth errors.');
  }

  console.log('   ✅ Enabling detailed SDK logging...\n');

  sdkInstance = new SafefyPaymentSDK({
    publicKey: PUBLIC_KEY,
    secretKey: SECRET_KEY,
    log: {
      enabled: true,
      colors: true,
      level: 'debug',
      includeHeaders: true,
      includeBody: true,
    },
  });

  console.log('   ✅ SDK initialized successfully!\n');
  return sdkInstance;
}

function getSDK(): SafefyPaymentSDK {
  return initializeSDK();
}

export async function createPixPayment(request: PaymentRequest): Promise<PixPaymentResponse> {
  const { amount, description, externalId, customer } = request;

  try {
    // Initialize SDK on first use (lazy loading)
    const sdk = getSDK();

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
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));
    const transaction = await sdk.transactions.create(payload);

    console.log('✅ Resposta da SafeFyPay:', JSON.stringify(transaction, null, 2));

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
    console.error('❌ Erro na integração com SafeFyPay:', error);
    if (error instanceof Error) {
      console.error('   Mensagem:', error.message);
      console.error('   Stack:', error.stack);
    }
    throw error;
  }
}

export async function getPaymentStatus(paymentId: string): Promise<PixPaymentResponse> {
  try {
    const sdk = getSDK();
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

/**
 * Warmup the SDK during server startup
 * Ensures credentials are loaded and validated before any user requests
 */
export async function warmupSDK(): Promise<void> {
  try {
    console.log('\n🔥 Warming up SafeFyPay SDK...');
    const sdk = getSDK();
    console.log('✅ SafeFyPay SDK is ready!\n');
  } catch (error) {
    console.error('⚠️  SDK warmup failed (will retry on first request):', error);
  }
}
