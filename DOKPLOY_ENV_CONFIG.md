# 🚀 Variáveis para Configurar no Dokploy

Cole essas variáveis de ambiente na aplicação "Under Sports 3" no Dokploy:

## SafeFyPay (Pagamento PIX)

```
SAFEPAY_PUBLIC_KEY = pk_production_1acc62c9b381e723cd1fb250d3423c5cefd20c1f1bb73188
SAFEPAY_SECRET_KEY = sk_production_0ad4a7eb84effc71fc08de5820452a1eae1aa51419664bcc55fbf2f42d379f56
```

## Checkify (Validação de CPF)

```
CHECKIFY_API_KEY = ck_4e5edf84e6b93778bb5f524c0337ffe42245890377c95aed1d79b67797e0a392
```

## Facebook CAPI (Conversions API)

```
FB_PIXEL_ID = 781406367686573
FB_ACCESS_TOKEN = EAAXQPCnz93UBQrr4qf9I4YALGkthtfG9QMSwZBAZC5Jqk8ZCEFHJTDLjFNuM2ZAuzQWtKTwv1FcffrOfnCel0eh2oSbB740ti7zsp4ezXz4obqsNI3AiW1F3CcuafzypZCtQhOR325xjEF2pUf3UekFAhv3q6gyLnTGqOcl544rylaSiDJ5KHWs6B2Yf2mAZDZD
```

## UTMify (Rastreamento de UTM)

```
UTMIFY_KEY = Arygdy7yP3itUoi7ElFN8T0Am99Oog7N408u
```

## Servidor

```
PORT = 3001
NODE_ENV = production
```

---

## Como Adicionar no Dokploy

1. Acesse: **https://dokploy.recarga8.shop/**
2. Login: `nontonbokepmantap@gmail.com` / `NontonOrangeMantap122k03`
3. Projeto: **Under Sports 3**
4. Selecione a aplicação do **backend**
5. Vá em **Environment** ou **Variables**
6. Clique em **+ Add Variable**
7. Preencha cada par (Key | Value)
8. Clique em **Save**
9. **Redeploy** a aplicação

---

## ✅ Verificação

Após configurar e fazer redeploy, teste:

```bash
# Verifique se o backend está respondendo
curl https://dokploy.recarga8.shop/api/health
```

Deve retornar: `{"status":"OK","timestamp":"..."}`
