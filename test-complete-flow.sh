#!/bin/bash

####################################################################
# COMPLETE SAFEFYPAY TESTING FLOW
# Tests everything before Dokploy deployment
####################################################################

set -e

echo "
╔════════════════════════════════════════════════════════════════╗
║          SafeFyPay Complete Integration Test                   ║
║          Testing: Credentials → SDK → API Calls                ║
╚════════════════════════════════════════════════════════════════╝
"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
echo -e "${BLUE}[1/5] Checking for .env file...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"

    # Check required variables
    echo -e "\n${BLUE}Checking required variables...${NC}"
    source .env

    if [ -z "$SAFEPAY_PUBLIC_KEY" ]; then
        echo -e "${RED}❌ SAFEPAY_PUBLIC_KEY not set in .env${NC}"
        exit 1
    fi
    if [ -z "$SAFEPAY_SECRET_KEY" ]; then
        echo -e "${RED}❌ SAFEPAY_SECRET_KEY not set in .env${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ SAFEPAY_PUBLIC_KEY: ${SAFEPAY_PUBLIC_KEY:0:20}...${NC}"
    echo -e "${GREEN}✅ SAFEPAY_SECRET_KEY: ${SAFEPAY_SECRET_KEY:0:20}...${NC}"
else
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file in the root directory with SafeFyPay credentials."
    exit 1
fi

# Test API endpoint directly
echo -e "\n${BLUE}[2/5] Testing SafeFyPay API Token Generation...${NC}"
echo "Making POST request to https://api-payment.safefypay.com.br/v1/auth/token"

TOKEN_RESPONSE=$(curl -s -X POST \
  "https://api-payment.safefypay.com.br/v1/auth/token" \
  -H "Content-Type: application/json" \
  -d "{
    \"publicKey\": \"$SAFEPAY_PUBLIC_KEY\",
    \"secretKey\": \"$SAFEPAY_SECRET_KEY\"
  }")

echo "Response: $TOKEN_RESPONSE"

# Check if error
if echo "$TOKEN_RESPONSE" | grep -q '"error"'; then
    ERROR_CODE=$(echo "$TOKEN_RESPONSE" | grep -o '"code":"[^"]*' | cut -d'"' -f4)
    ERROR_MESSAGE=$(echo "$TOKEN_RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    echo -e "${RED}❌ API Error: $ERROR_CODE - $ERROR_MESSAGE${NC}"
    exit 1
fi

# Extract access token
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ No access token in response!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token generated successfully!${NC}"
echo "Token: ${ACCESS_TOKEN:0:50}..."

# Install Node dependencies if needed
echo -e "\n${BLUE}[3/5] Checking Node environment...${NC}"
if [ ! -d "ecommerce/backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd ecommerce/backend
    npm install
    cd ../..
fi
echo -e "${GREEN}✅ Node dependencies ready${NC}"

# Build TypeScript
echo -e "\n${BLUE}[4/5] Building TypeScript...${NC}"
cd ecommerce/backend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript compiled successfully${NC}"
else
    echo -e "${RED}❌ TypeScript compilation failed!${NC}"
    exit 1
fi
cd ../..

# Test SDK initialization
echo -e "\n${BLUE}[5/5] Testing SDK Initialization...${NC}"
cat > /tmp/test-sdk.js << 'EOF'
const { SafefyPaymentSDK } = require('@safefypay/safefy-sdk-node');

const publicKey = process.env.SAFEPAY_PUBLIC_KEY;
const secretKey = process.env.SAFEPAY_SECRET_KEY;

console.log('Creating SDK instance...');
console.log(`Public Key: ${publicKey.substring(0, 20)}...`);
console.log(`Secret Key: ${secretKey.substring(0, 20)}...`);

try {
  const sdk = new SafefyPaymentSDK({
    publicKey: publicKey,
    secretKey: secretKey,
    log: {
      enabled: true,
      colors: true,
      level: 'debug',
    },
  });

  console.log('✅ SDK initialized successfully!');

  // Test creating a transaction (we'll use sandbox mode)
  console.log('\nAttempting test transaction creation...');
  sdk.transactions.create({
    method: 'Pix',
    amount: 100, // R$ 1.00
    currency: 'BRL',
    description: 'Test PIX Payment',
    externalId: 'test-' + Date.now(),
  }).then(transaction => {
    console.log('✅ Transaction created successfully!');
    console.log('Transaction ID:', transaction.id);
    console.log('Status:', transaction.status);
    console.log('PIX Code:', transaction.pix?.copyAndPaste?.substring(0, 50) + '...');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error creating transaction:', error.message);
    console.error('Code:', error.code);
    if (error.details) {
      console.error('Details:', error.details);
    }
    process.exit(1);
  });
} catch (error) {
  console.error('❌ SDK Initialization Error:', error.message);
  process.exit(1);
}
EOF

cd ecommerce/backend
node /tmp/test-sdk.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ SafeFyPay Integration is Ready for Deployment!             ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║  Next Step: Push to GitHub and deploy on Dokploy              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}❌ Tests failed!${NC}"
    exit 1
fi
