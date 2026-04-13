# 🚀 INSTRUÇÕES SIMPLES PARA FAZER DEPLOY

**Leia isto antes de fazer anything no Dokploy!**

---

## ✅ O Que Já Foi Feito

Identifiquei 100% do problema e resolvi:

1. ✅ SafeFyPay SDK estava inicializando ANTES das variáveis serem carregadas
2. ✅ Transformei em "lazy loading" - só inicializa quando realmente precisa
3. ✅ Criei ambiente variable loader robusto com múltiplas fallbacks
4. ✅ Testei tudo localmente - **FUNCIONA PERFEITO** ✅
5. ✅ Docker build passou, container iniciou com sucesso

**Commits:** ff2d721, 667ddbb, 37c26cc, 71bb4bd

---

## 🎯 3 PASSOS PARA VOCÊ FAZER DEPLOY

### PASSO 1: Acessar Dokploy
```
URL: https://dokploy.recarga8.shop/
Email: nontonbokepmantap@gmail.com
Senha: NontonOrangeMantap122k03
```

### PASSO 2: Adicionar Variáveis (5 minutos)
1. Clique no Projeto: **Under Sports 3**
2. Selecione a app: **backend**
3. Vá em: **Environment** ou **Variables**
4. Clique: **+ Add Variable**
5. **Copie e cole estas 8 variáveis** (uma por uma):

```
SAFEPAY_PUBLIC_KEY
pk_production_1acc62c9b381e723cd1fb250d3423c5cefd20c1f1bb73188

SAFEPAY_SECRET_KEY
sk_production_0ad4a7eb84effc71fc08de5820452a1eae1aa51419664bcc55fbf2f42d379f56

CHECKIFY_API_KEY
ck_4e5edf84e6b93778bb5f524c0337ffe42245890377c95aed1d79b67797e0a392

FB_PIXEL_ID  
781406367686573

FB_ACCESS_TOKEN
EAAXQPCnz93UBQrr4qf9I4YALGkthtfG9QMSwZBAZC5Jqk8ZCEFHJTDLjFNuM2ZAuzQWtKTwv1FcffrOfnCel0eh2oSbB740ti7zsp4ezXz4obqsNI3AiW1F3CcuafzypZCtQhOR325xjEF2pUf3UekFAhv3q6gyLnTGqOcl544rylaSiDJ5KHWs6B2Yf2mAZDZD

UTMIFY_KEY
Arygdy7yP3itUoi7ElFN8T0Am99Oog7N408u

NODE_ENV  
production

PORT
3001
```

**Cada variável = Nome (KEY) + Valor (VALUE)**

### PASSO 3: Fazer Redeploy e Testar (10 minutos)
1. Clique **Redeploy** ou **Deploy**
2. Espere ~2-3 minutos o build compilar
3. **Acompanhe os logs!** Procure por:

```
✅ SAFEPAY_PUBLIC_KEY carregada
✅ SAFEPAY_SECRET_KEY carregada  
✅ Backend API running on port 3001
```

4. **Teste na app:** `https://undersports.shop`
   - Adicionar produto ao carrinho
   - Checkout
   - Selecionar PIX
   - **Deve aparecer QR Code** = ✅ SUCESSO!

---

## ❌ Se DER ERRADO

**Erro: "Credencial inativa ou revogada"**
- Solução: Verifique se as variáveis foram adicionadas NO DASHBOARD (não se relaciona com arquivo .env)
- Redeploy após adicionar

**Erro: Variáveis não aparecem nos logs**
- Solução: Você adicionou sem clicar em "Save"?
- Redeploy manual

**Qualquer outro erro:**
- Screenshot dos logs e me manda!

---

## 📞 RESUMO

| Tarefa | Tempo | Status |
|--------|-------|--------|
| Acessar Dokploy | 1 min | 👉 VOCÊ |
| Adicionar 8 variáveis | 5 min | 👉 VOCÊ |
| Redeploy | 3 min | Automático |
| Teste PIX | 2 min | 👉 VOCÊ |
| **Total** | **~15 min** | ✅ |

---

**Está tudo pronto. Agora é só configurar as variáveis no dashboard e fazer redeploy!** 🎉
