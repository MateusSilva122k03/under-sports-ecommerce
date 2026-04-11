#!/bin/bash

# Script para testar credenciais SafeFyPay
# Uso: ./test-safepay-credentials.sh [public_key] [secret_key]

echo "🔐 SafeFyPay Credential Tester"
echo "================================"
echo ""

# Se as chaves forem passadas como argumentos, usar elas
if [ ! -z "$1" ] && [ ! -z "$2" ]; then
  PK="$1"
  SK="$2"
  echo "✅ Usando chaves fornecidas como argumentos"
else
  # Caso contrário, tentar obter das variáveis de ambiente
  PK="${SAFEPAY_PUBLIC_KEY}"
  SK="${SAFEPAY_SECRET_KEY}"
  echo "✅ Usando chaves das variáveis de ambiente"
fi

echo ""
echo "📋 Credenciais:"
echo "   PUBLIC_KEY:  ${PK:0:25}..."
echo "   SECRET_KEY:  ${SK:0:25}..."
echo ""

# Verificações básicas
echo "🔍 Validações:"

if [ -z "$PK" ]; then
  echo "   ❌ PUBLIC_KEY está vazia!"
  exit 1
else
  echo "   ✅ PUBLIC_KEY carregada (${#PK} caracteres)"
  if [[ "$PK" == pk_* ]]; then
    echo "   ✅ PUBLIC_KEY tem formato correto (pk_)"
  else
    echo "   ❌ PUBLIC_KEY não começa com 'pk_'"
  fi
fi

if [ -z "$SK" ]; then
  echo "   ❌ SECRET_KEY está vazia!"
  exit 1
else
  echo "   ✅ SECRET_KEY carregada (${#SK} caracteres)"
  if [[ "$SK" == sk_* ]]; then
    echo "   ✅ SECRET_KEY tem formato correto (sk_)"
  else
    echo "   ❌ SECRET_KEY não começa com 'sk_'"
  fi
fi

echo ""
echo "🌐 Testando conexão com SafeFyPay API..."
echo ""

# Fazer requisição POST para obter token
RESPONSE=$(curl -s -X POST \
  https://api-payment.safefypay.com.br/v1/auth/token \
  -H 'Content-Type: application/json' \
  -d "{
    \"publicKey\": \"$PK\",
    \"secretKey\": \"$SK\",
    \"grantType\": \"client_credentials\"
  }")

echo "📤 Resposta da API SafeFyPay:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Análise da resposta
if echo "$RESPONSE" | grep -q '"accessToken"'; then
  echo "✅ ✅ ✅ SUCESSO! As credenciais estão funcionando!"
  echo ""
  echo "Seu token de acesso foi gerado com sucesso."
  exit 0
elif echo "$RESPONSE" | grep -q 'inativa\|revogada\|inactive\|revoked'; then
  echo "❌ Erro: Credenciais estão INATIVAS ou REVOGADAS"
  echo ""
  echo "Você precisa:"
  echo "1. Acessar https://dashboard.safefypay.com.br/"
  echo "2. Verificar se as chaves estão ativas"
  echo "3. Gerar novas chaves se necessário"
  exit 1
elif echo "$RESPONSE" | grep -q 'error\|Error\|Unauthorized'; then
  echo "❌ Erro na autenticação"
  echo ""
  echo "Possíveis causas:"
  echo "- Chaves inválidas ou expiradas"
  echo "- Espaços em branco nas chaves"
  echo "- Chaves copiadas incorretamente"
  exit 1
else
  echo "⚠️  Resposta inesperada da API"
  exit 1
fi
