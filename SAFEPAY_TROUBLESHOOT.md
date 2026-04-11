# 🚨 Erro: "Credencial inativa ou revogada"

Esse erro significa que a SafeFyPay não reconheceu suas credenciais. Aqui está o guia de resolução:

---

## ✅ Checklist de Diagnóstico

### 1️⃣ Verifique as Chaves Localmente

```bash
# Execute o script de diagnóstico
bash diagnose-safepay.sh
```

Procure por:

- ✅ `PUBLIC_KEY sem espaços`
- ✅ `SECRET_KEY sem espaços`
- ✅ PUBLIC_KEY começa com `pk_production`
- ✅ SECRET_KEY começa com `sk_production`

---

### 2️⃣ Verifique a Configuração no Dokploy

**Abra**: https://dokploy.recarga8.shop/

1. Login: `nontonbokepmantap@gmail.com`
2. Projeto: **Under Sports 3**
3. Aplicação: **Backend**
4. Vá em **Environment** ou **Variables**

**Verifique:**

- ✅ `SAFEPAY_PUBLIC_KEY` está lá?
- ✅ `SAFEPAY_SECRET_KEY` está lá?
- ✅ **SEM espaços extras** no valor?
- ✅ Valores estão **corretos e completos**?

**Se não estão:**

- Adicione as variáveis
- Clique **Save**
- Faça **Redeploy**

---

### 3️⃣ Verifique os Logs do Dokploy

Após redeploy, acesse:

**Caminho**: Projetos → Under Sports 3 → Backend → **Logs**

Procure por linhas como:

```
🔐 SafeFyPay Credentials Check:
   PUBLIC_KEY loaded: ✅ Yes
   SECRET_KEY loaded: ✅ Yes
```

**Se vir "❌ No (empty)":**

- As variáveis NÃO foram carregadas do Dokploy
- Repita o passo 2️⃣

**Se vir o erro:**

```
❌ Erro na integração com SafeFyPay:
   Mensagem: Credencial inativa ou revogada.
```

→ Suas chaves estão **inativas ou revogadas** na SafeFyPay

---

## 🔧 Se as Chaves Estão Inativas

### Opção A: Gerar Novas Chaves

1. Acesse: https://dashboard.safefypay.com/
2. Login com sua conta
3. Vá em **API Keys** ou **Credenciais**
4. Crie **novas chaves de produção**
5. Copie as chaves `pk_production_...` e `sk_production_...`
6. Envie para mim para atualizar

### Opção B: Ativar Chaves Existentes

1. Se já usou essas chaves antes e estão inativas:
2. Acesse o dashboard da SafeFyPay
3. Procure por **API Keys** e veja o status
4. Ative as chaves se tiverem sido desativadas

---

## 📝 Resumo das Chaves Atuais

As chaves que você forneceu são:

```
SAFEPAY_PUBLIC_KEY: pk_production_66c46cd76144032e2b3204b16a2187dda5b9b776beff0b64
SAFEPAY_SECRET_KEY: sk_production_ce80b3c68bb45813386b7655a97b05bf63a14802f9049817c7bf97e441e89813
```

Se o erro persiste, **provavelmente essas chaves estão inativas no painel da SafeFyPay**.

---

## 🎯 Próximas Ações

1. **Execute**: `bash diagnose-safepay.sh`
2. **Compartilhe os logs** do Dokploy comigo
3. **Ou forneça novas chaves** se as atuais estiverem inativas

---

**Precisa de ajuda?** Envie:

- ✅ Output do `diagnose-safepay.sh`
- ✅ Logs do Dokploy
- ✅ Nova chave da SafeFyPay (se gerou uma)
