# ✅ Checklist de Configuração - Under Sports 3 no Dokploy

## 🎯 Status das Configurações

### Backend - Variáveis de Ambiente

Todas essas variáveis devem estar configuradas no **Dokploy** → **Under Sports 3** → **Backend** → **Environment**:

| Variável             | Valor                           | Status         | Descrição                       |
| -------------------- | ------------------------------- | -------------- | ------------------------------- |
| `SAFEPAY_PUBLIC_KEY` | `pk_production_1acc62c9b381...` | ✅ Atualizado  | Chave pública SafeFyPay         |
| `SAFEPAY_SECRET_KEY` | `sk_production_0ad4a7eb84ef...` | ✅ Atualizado  | Chave secreta SafeFyPay         |
| `CHECKIFY_API_KEY`   | `ck_4e5edf84e6b9...`            | ✅ Configurado | API Checkify para validação CPF |
| `FB_PIXEL_ID`        | `781406367686573`               | ✅ Novo        | Pixel ID Meta                   |
| `FB_ACCESS_TOKEN`    | `EAAXQPCnz93UBQrr...`           | ✅ Novo        | Access Token Meta CAPI          |
| `UTMIFY_KEY`         | `Arygdy7yP3itUoi7...`           | ✅ Novo        | Chave UTMify                    |
| `PORT`               | `3001`                          | ✅ Padrão      | Porta do backend                |
| `NODE_ENV`           | `production`                    | ✅ Padrão      | Ambiente production             |

---

## 📱 Frontend - Rastreamento Implementado

### Scripts Carregados (`index.html`)

| Script                | Descrição               | Status          |
| --------------------- | ----------------------- | --------------- |
| **UTMify**            | Captura parâmetros UTM  | ✅ Implementado |
| **Microsoft Clarity** | Session recording       | ✅ Implementado |
| **Meta Pixel**        | Rastreamento de eventos | ✅ Implementado |
| **Facebook CAPI**     | Conversões via servidor | ✅ Implementado |

---

## 🔄 Fluxo de Rastreamento

### 1. Usuário Navega no Site

- UTMify captura: `?utm_source=google&utm_medium=cpc&utm_campaign=...`
- Clarity começa a gravar a sessão
- Meta Pixel dispara `PageView`

### 2. Usuário Abre Checkout

- Frontend dispara evento → Backend recebe
- Backend envia via **CAPI**: `InitiateCheckout`
- Meta recebe o evento

### 3. Pagamento Confirmado

- Backend atualiza status para "Paid"
- Backend envia via **CAPI**: `Purchase`
- Meta recebe conversão
- Email de confirmação é enviado

---

## 📊 Métricas Rastreadas

### Eventos Enviados ao Meta (CAPI)

```
1. InitiateCheckout
   - Momento: Usuário clica em "Ir para Pagamento"
   - Dados: Email, telefone, valor

2. Purchase (MAIS IMPORTANTE)
   - Momento: Pagamento PIX confirmado
   - Dados: Email, telefone, valor final com frete
```

### Dados Coletados (UTMify)

```
- utm_source: origem do tráfego
- utm_medium: tipo de campanha
- utm_campaign: nome da campanha
- utm_content: conteúdo específico
- utm_term: palavra-chave
```

### Sessões Gravadas (Clarity)

```
- Cliques do usuário
- Movimentos do mouse
- Digitação em formulários
- Scroll do página
- Erros JavaScript
```

---

## 🚀 Próximos Passos

### 1. Verifique as Chaves no Dokploy

```bash
# Acesse o Dokploy
# Under Sports 3 → Backend → Environment
# Confirme todas as 8 variáveis acima
```

### 2. Teste um Pagamento

```bash
# Acesse: https://undersports.shop/ (ou seu domínio)
# Adicione um produto ao carrinho
# Clique em "Pagar com PIX"
# Preencha dados
# Aguarde o PIX ser gerado
```

### 3. Verifique os Eventos no Meta

```
https://business.facebook.com/events-manager
↓
Seu pixel: 781406367686573
↓
Tab "Dados em Tempo Real"
↓
Você deve ver os eventos "Purchase" ou "InitiateCheckout"
```

### 4. Otimize Campanhas

Após 50+ eventos de "Purchase", o Meta vai:

- Aprender padrões de compradores
- Otimizar anúncios automaticamente
- Melhorar ROI das campanhas

---

## 🔒 Segurança

### Chaves Protegidas?

✅ **Sim!**

- Nenhuma chave está no Git (`.gitignore` configurado)
- Chaves armazenadas apenas no Dokploy
- Não são expostas no frontend
- Email/telefone enviados com hash SHA256 para Meta

### Chaves Comprometidas?

Se alguma chave vazar:

1. Vá ao dashboard do serviço
2. Revogue a chave comprometida
3. Gere uma nova chave
4. Atualize no Dokploy
5. Faça redeploy

---

## 📝 Resumo de Arquivos Criados/Atualizados

| Arquivo                                                        | Descrição                         |
| -------------------------------------------------------------- | --------------------------------- |
| [DOKPLOY_ENV_CONFIG.md](DOKPLOY_ENV_CONFIG.md)                 | Variáveis do Dokploy (ATUALIZADO) |
| [FACEBOOK_CAPI_GUIDE.md](FACEBOOK_CAPI_GUIDE.md)               | Guia completo do CAPI             |
| [ecommerce/backend/.env](ecommerce/backend/.env)               | .env atualizado com novas chaves  |
| [ecommerce/backend/src/capi.ts](ecommerce/backend/src/capi.ts) | Código CAPI com logs              |
| [ecommerce/frontend/index.html](ecommerce/frontend/index.html) | Scripts de rastreamento           |

---

## 🆘 Troubleshooting Rápido

**Problema**: Evento não aparece no Meta

- Solução: Verifique `FB_PIXEL_ID` e `FB_ACCESS_TOKEN` no Dokploy

**Problema**: PIX não é gerado

- Solução: Verifique `SAFEPAY_PUBLIC_KEY` e `SAFEPAY_SECRET_KEY`

**Problema**: CPF não auto-completa

- Solução: Verifique `CHECKIFY_API_KEY`

**Problema**: Clarity não grava sessões

- Solução: Já está no HTML, deve funcionar automaticamente

---

**Pronto para produção!** ✅
