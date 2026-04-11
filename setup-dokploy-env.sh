#!/bin/bash

# ================================================================
# Script para configurar variáveis de ambiente no Dokploy
# Uso: ./setup-dokploy-env.sh
# ================================================================

set -e

echo "🔧 Configurador de Variáveis de Ambiente - Dokploy"
echo "================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to read vars
read_var() {
  local prompt="$1"
  local default="$2"
  local var_value

  if [ -z "$default" ]; then
    read -p "$(echo -e ${BLUE}${prompt}${NC}): " var_value
  else
    read -p "$(echo -e ${BLUE}${prompt}${NC}) [${default}]: " var_value
    var_value=${var_value:-$default}
  fi

  echo "$var_value"
}

# Collect variables
echo -e "${YELLOW}SafeFyPay - Pagamento PIX${NC}"
SAFEPAY_PUBLIC_KEY=$(read_var "Public Key (pk_...)")
SAFEPAY_SECRET_KEY=$(read_var "Secret Key (sk_...)")

echo ""
echo -e "${YELLOW}Checkify - Consulta de CPF${NC}"
CHECKIFY_API_KEY=$(read_var "API Key (ck_...)" "")

echo ""
echo -e "${YELLOW}Resend - Envio de Emails${NC}"
RESEND_API_KEY=$(read_var "API Key (re_...)" "")

echo ""
echo -e "${YELLOW}Facebook CAPI - Rastreamento de Eventos${NC}"
FB_PIXEL_ID=$(read_var "Pixel ID" "")
FB_ACCESS_TOKEN=$(read_var "Access Token" "")

echo ""
echo -e "${YELLOW}Configuração do Servidor${NC}"
PORT=$(read_var "Porta" "3001")
NODE_ENV=$(read_var "Ambiente (production/development)" "production")

# Create .env file
echo ""
echo -e "${BLUE}Criando arquivo .env...${NC}"

cat > ecommerce/backend/.env << EOF
# SafeFyPay - Pagamento PIX
SAFEPAY_PUBLIC_KEY=${SAFEPAY_PUBLIC_KEY}
SAFEPAY_SECRET_KEY=${SAFEPAY_SECRET_KEY}

# Checkify - Consulta de CPF
CHECKIFY_API_KEY=${CHECKIFY_API_KEY}

# Resend - Envio de Emails
RESEND_API_KEY=${RESEND_API_KEY}

# Facebook CAPI - Rastreamento
FB_PIXEL_ID=${FB_PIXEL_ID}
FB_ACCESS_TOKEN=${FB_ACCESS_TOKEN}

# Servidor
PORT=${PORT}
NODE_ENV=${NODE_ENV}
EOF

echo -e "${GREEN}✅ Arquivo .env criado com sucesso!${NC}"
echo ""
echo -e "${BLUE}Conteúdo do .env:${NC}"
cat ecommerce/backend/.env
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "1. Copie o arquivo .env para as variáveis de ambiente do Dokploy:"
echo "   - Acesse: https://dokploy.recarga8.shop/"
echo "   - Projeto: Under Sports 3"
echo "   - Abra a aplicação"
echo "   - Vá em 'Environment'"
echo "   - Adicione cada variável"
echo ""
echo "2. NUNCA comite o arquivo .env no Git!"
echo "   Adicione à .gitignore:"
echo "   echo '.env' >> ecommerce/backend/.gitignore"
echo ""
echo -e "${GREEN}Configuração concluída!${NC}"
