# 📊 Facebook CAPI (Conversions API) - Guia Completo

## O que é CAPI?

**CAPI** = **Conversions API** do Facebook/Meta

É uma forma de enviar eventos de conversão **direto do seu servidor** para o Facebook, sem depender apenas do pixel no navegador.

### Por que usar CAPI?

1. **Mais preciso**: Dados chegam diretamente do servidor
2. **Não é bloqueado**: Ad blockers não conseguem bloquear dados do servidor
3. **Melhor rastreamento**: Funciona mesmo sem cookies
4. **Otimização de anúncios**: Facebook consegue otimizar melhor as campanhas

---

## Como Funciona o CAPI

```
Cliente (navegador)
       ↓
   Compra produto
       ↓
  Backend (seu servidor)
       ↓
  Envia evento HTTP para Meta (CAPI)
       ↓
Facebook recebe a conversão
```

---

## Eventos Rastreados no Seu Projeto

### 1️⃣ **InitiateCheckout**

Disparado quando o usuário abre o modal de pagamento PIX

```typescript
await sendCAPIEvent(
  "InitiateCheckout",
  origin,
  { email: customer.email, phone: customer.phone },
  { currency: "BRL", value: amount / 100 },
);
```

**Quando ocorre**: Clique no botão "Checkout"

---

### 2️⃣ **Purchase** (Mais Importante!)

Disparado quando o pagamento é confirmado

```typescript
await sendCAPIEvent(
  "Purchase",
  origin,
  { email: customer.email, phone: customer.phone },
  { currency: "BRL", value: amount / 100 },
);
```

**Quando ocorre**: PIX pago e confirmado

---

## Dados Enviados para Meta

Cada evento enviado contém:

```json
{
  "event_name": "Purchase",
  "event_time": 1712851200,
  "action_source": "website",
  "event_source_url": "https://undersports.shop/checkout",
  "user_data": {
    "em": ["a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"], // hash email
    "ph": ["5511999887766"], // telefone
    "client_ip_address": "192.168.1.1",
    "client_user_agent": "Mozilla/5.0..."
  },
  "custom_data": {
    "currency": "BRL",
    "value": 199.9 // valor em reais
  }
}
```

**Nota**: Email e telefone são enviados com **hash SHA256** (não são enviados em texto plano)

---

## Status Atual do Seu Projeto

✅ **Implementado no backend** (`ecommerce/backend/src/capi.ts`):

- Meta Pixel ID: `781406367686573`
- Access Token configurado como variável de ambiente

✅ **Eventos rastreados**:

- `InitiateCheckout` → quando abre pagamento
- `Purchase` → quando paga com PIX

✅ **No frontend**:

- Meta Pixel está carregado no `index.html`
- Rastreia automaticamente `PageView`

---

## O que Fazer Agora

### 1. Verifique no Painel do Meta

1. Acesse: https://business.facebook.com/
2. Vá em **Business Tools** → **Events Manager**
3. Testeador do Pixel/CAPI
4. Faça um pagamento de teste
5. Verifique se os eventos aparecem em "Test Events"

### 2. Confirme que Está Funcionando

**Logs que você verá (no Dokploy):**

```
📡 CAPI Event Purchase sent: { success: true, event_received_time: ... }
✉️ Payment approved email sent to email@example.com
```

### 3. Otimize no Meta Ads Manager

Após confirmar que os eventos estão chegando:

1. Vá em **Ads Manager**
2. Crie campanhas visando evento "Purchase"
3. Meta vai otimizar para quem mais compra

---

## Troubleshooting

### ❌ Eventos não aparecem no Meta

**Causas:**

1. **Access Token inválido**
   - Verifique em: https://business.facebook.com/
   - Regenere o token se necessário

2. **Pixel ID errado**
   - Confirme: `781406367686573`
   - Você criou o Pixel no Meta? (https://business.facebook.com/pixels)

3. **Credenciais não carregadas**
   - Execute: `bash diagnose-safepay.sh`
   - Verifique `FB_PIXEL_ID` e `FB_ACCESS_TOKEN`

### ✅ Verificação Rápida

```bash
# 1. Logs localmente
cd ecommerce/backend
npm run dev

# 2. Faça uma compra de teste
# Você verá logs como:
# 📡 CAPI Event Purchase sent
```

---

## Próximos Passos

1. **Teste um pagamento** com suas credenciais reais
2. **Verifique no Meta** se o evento foi recebido
3. **Otimize** suas campanhas usando os dados de conversão

---

## Referências

- Meta CAPI Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
- Events Manager: https://business.facebook.com/events-manager
- Credentials: https://business.facebook.com/settings/apps-and-websites
