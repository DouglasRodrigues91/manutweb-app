---
name: reduzir-tokens
description: Otimiza prompts e respostas para usar o mínimo de tokens possível sem perder qualidade. Ideal para economizar custos com APIs de LLM e melhorar performance.
license: MIT
compatibility: opencode
metadata:
  audience: all
  category: optimization
---

## O que faz
- Analisa o prompt atual e sugere versões enxutas que removem redundância
- Elimina palavras desnecessárias, mantendo todo o significado técnico
- Usa termos precisos em vez de frases longas
- Prioriza informações por relevância, movendo contexto menos importante para o final
- Evita repetir informações já conhecidas do contexto

## Quando usar
Use quando perceber que os prompts estão muito longos, quando quiser economizar tokens em conversas extensas, ou antes de enviar um prompt complexo para reduzir custos.

## Como usar
A skill é ativada automaticamente pelo agente quando detecta que o prompt pode ser otimizado. Para usar manualmente, inclua no prompt: "Use a skill reduzir-tokens para otimizar esta solicitação."
