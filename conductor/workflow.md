# Workflow: Under Sports

## Fluxo de Desenvolvimento
1. **Análise**: Identificar as mudanças necessárias no código existente.
2. **Implementação**: Realizar as alterações conforme as especificações.
3. **Validação**: Testar as mudanças localmente.
4. **Deploy**: Enviar as atualizações para o Dokploy.

## Gestão de Trilhas (Tracks)
- Cada funcionalidade ou mudança significativa deve ser tratada em uma track separada dentro de `conductor/tracks/`.

## Critérios de Aceite para Deploy
- Build do frontend bem sucedido.
- Build do backend bem sucedido.
- Verificação de conectividade com o banco de dados.
- Verificação de chaves de API no ambiente (.env).
