# 🔒 Configuração de Variáveis de Ambiente - Under Sports Ecommerce

## 📋 Variáveis Necessárias

### SafeFyPay (Pagamento PIX)

```
SAFEPAY_PUBLIC_KEY=pk_production_...
SAFEPAY_SECRET_KEY=sk_production_...
```

Obtenha em: https://dashboard.safefypay.com/

### Checkify (Validação de CPF)

```
CHECKIFY_API_KEY=ck_...
```

Obtenha em: https://checkify.space/

### Resend (Envio de Emails)

```
RESEND_API_KEY=re_...
```

Obtenha em: https://resend.com/

### Facebook CAPI (Conversions API)

```
FB_PIXEL_ID=...
FB_ACCESS_TOKEN=...
```

Obtenha em: https://business.facebook.com/

### Servidor

```
PORT=3001
NODE_ENV=production
```

---

## 🚀 Como Configurar no Dokploy

### Opção 1: Usar o Script (Recomendado)

```bash
# 1. Execute o script
bash setup-dokploy-env.sh

# 2. Copie as variáveis do arquivo gerado
cat ecommerce/backend/.env
```

### Opção 2: Configurar Manualmente

1. Acesse: **https://dokploy.recarga8.shop/**
2. Faça login com suas credenciais
3. Selecione o projeto **"Under Sports 3"**
4. Clique em **"Applications"**
5. Selecione a aplicação do backend
6. Vá em **"Environment"** ou **"Variables"**
7. Adicione cada variável:
   - Clique em **"+ Add Variable"**
   - Preencha `Key` (ex: `SAFEPAY_PUBLIC_KEY`)
   - Preencha `Value` (ex: `pk_production_...`)
   - Repita para todas as variáveis

---

## ⚙️ Variáveis do Frontend

O frontend pode precisar de uma variável:

```
VITE_API_URL=/api
```

Isso já está configurado no `vite.config.ts`, mas você pode sobrescrever no Dokploy se necessário.

---

## 🔐 Segurança

⚠️ **NUNCA** comite o arquivo `.env` ou suas chaves no Git!

- ✅ `.gitignore` já está configurado
- ✅ Cada arquivo tem seu próprio `.gitignore`
- ✅ As chaves devem ficar apenas no Dokploy

---

## ✅ Verificação

Após configurar, teste a aplicação:

```bash
# Local (desenvolvimento)
cd ecommerce/backend
npm install
npm run dev

# Verifique que as chaves são carregadas
curl http://localhost:3001/api/health
```

---

## 🆘 Erros Comuns

### `Unauthorized` na SafeFyPay

- Verifique se `SAFEPAY_PUBLIC_KEY` e `SAFEPAY_SECRET_KEY` estão corretos
- Confirme que as chaves não têm espaços em branco extras

### `Email send failed`

- Verifique se `RESEND_API_KEY` está configurada
- Confira se o domínio está verificado no Resend

### `CPF validation failed`

- Verifique se `CHECKIFY_API_KEY` está configurada
- Teste a API diretamente no dashboard do Checkify

---

## 📝 Notas

- As chaves são sensíveis – use HTTPS em produção
- Revogue chaves comprometidas imediatamente
- Mantenha backups das chaves em local seguro
- Use variáveis de ambiente diferentes para dev/staging/production
