---
name: token-optimizer
description: Otimiza o uso de tokens em prompts e respostas aplicando estratégias avançadas de compressão, leitura eficiente e seleção inteligente de contexto.
license: MIT
compatibility: opencode
metadata:
  audience: all
  category: optimization
---

## O que faz
- Comprime prompts removendo redundância sem perder informação essencial
- Aplica estratégias de leitura eficiente: escaneamento vs leitura profunda
- Sugere o modelo ideal para cada tarefa (rápido/barato vs poderoso/caro)
- Elimina contexto desnecessário mantendo apenas o relevante
- Estrutura informações por prioridade (crítico > importante > opcional)
- Usa referências em vez de duplicar conteúdo
- Mantém histórico compacto sem perder continuidade

## Quando usar
Use em conversas longas, prompts complexos, ou quando estiver próximo do limite de contexto. Também use para reduzir custos em tarefas repetitivas.

## Como usar
A skill ativa automaticamente ao detectar prompts longos. Para uso explícito: "Use token-optimizer para otimizar este prompt." ou "Use token-optimizer para reduzir o contexto pela metade."
