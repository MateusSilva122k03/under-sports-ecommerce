#!/bin/bash

# ================================================================
# Script de Diagnóstico - SafeFyPay
# ================================================================

echo "🔍 Diagnóstico de Credenciais da SafeFyPay"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env exists
if [ ! -f "ecommerce/backend/.env" ]; then
  echo -e "${RED}❌ Arquivo .env não encontrado em ecommerce/backend/.env${NC}"
  exit 1
fi

echo -e "${BLUE}📋 Variáveis carregadas do .env:${NC}"
echo ""

# Extract and display (partially) the keys
PUB_KEY=$(grep "SAFEPAY_PUBLIC_KEY=" ecommerce/backend/.env | cut -d'=' -f2)
SEC_KEY=$(grep "SAFEPAY_SECRET_KEY=" ecommerce/backend/.env | cut -d'=' -f2)
CHK_KEY=$(grep "CHECKIFY_API_KEY=" ecommerce/backend/.env | cut -d'=' -f2)

if [ -z "$PUB_KEY" ]; then
  echo -e "${RED}❌ SAFEPAY_PUBLIC_KEY não configurada${NC}"
else
  echo -e "${GREEN}✅ SAFEPAY_PUBLIC_KEY:${NC} ${PUB_KEY:0:20}...${PUB_KEY: -10}"
fi

if [ -z "$SEC_KEY" ]; then
  echo -e "${RED}❌ SAFEPAY_SECRET_KEY não configurada${NC}"
else
  echo -e "${GREEN}✅ SAFEPAY_SECRET_KEY:${NC} ${SEC_KEY:0:20}...${SEC_KEY: -10}"
fi

if [ -z "$CHK_KEY" ]; then
  echo -e "${YELLOW}⚠️  CHECKIFY_API_KEY não configurada${NC}"
else
  echo -e "${GREEN}✅ CHECKIFY_API_KEY:${NC} ${CHK_KEY:0:20}...${CHK_KEY: -10}"
fi

echo ""
echo -e "${BLUE}🔧 Checklist de Verificação:${NC}"
echo ""

# Check if keys have spaces
if [[ "$PUB_KEY" =~ " " ]]; then
  echo -e "${RED}❌ PUBLIC_KEY contém espaços (remova)${NC}"
else
  echo -e "${GREEN}✅ PUBLIC_KEY sem espaços${NC}"
fi

if [[ "$SEC_KEY" =~ " " ]]; then
  echo -e "${RED}❌ SECRET_KEY contém espaços (remova)${NC}"
else
  echo -e "${GREEN}✅ SECRET_KEY sem espaços${NC}"
fi

# Check if keys start with correct prefix
if [[ "$PUB_KEY" =~ ^pk_production ]]; then
  echo -e "${GREEN}✅ PUBLIC_KEY começa com 'pk_production'${NC}"
else
  echo -e "${RED}❌ PUBLIC_KEY não começa com 'pk_production'${NC}"
fi

if [[ "$SEC_KEY" =~ ^sk_production ]]; then
  echo -e "${GREEN}✅ SECRET_KEY começa com 'sk_production'${NC}"
else
  echo -e "${RED}❌ SECRET_KEY não começa com 'sk_production'${NC}"
fi

echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "1. Se as chaves estão corretas aqui, mas dão erro no Dokploy:"
echo "   → Verifique se as variáveis foram adicionadas no Dokploy"
echo "   → Certifique-se de NÃO ter espaços ao adicionar"
echo "   → Faça REDEPLOY do backend após adicionar"
echo ""
echo "2. Se ainda funcionar, as chaves podem estar inativas:"
echo "   → Acesse: https://dashboard.safefypay.com/"
echo "   → Verifique o status das chaves"
echo "   → Gere novas chaves se necessário"
echo ""
echo "3. Para testar localmente:"
echo "   cd ecommerce/backend"
echo "   npm install"
echo "   npm run dev"
echo "   → Os logs aparecerão no console"
