# Implementation Plan: track-002 (Webhooks)

## Objetivo
Implementar um endpoint de Webhook para processar notificações automáticas da SafeFyPay.

## Alterações Necessárias
- [ ] Criar função `processPaymentStatusUpdate` no backend para centralizar a lógica de sucesso.
- [ ] Adicionar rota `POST /api/webhook/safefypay` no Express.
- [ ] Integrar com a lógica de DB, CAPI e Mailer.

## Verificação
1. Testar a rota de Webhook usando `curl` ou Postman.
2. Validar se o status no banco de dados muda para `Paid`.
3. Validar se os logs mostram o disparo do e-mail e CAPI.
