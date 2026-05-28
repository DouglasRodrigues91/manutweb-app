---
name: dead-code
description: Analisa bases de código para identificar e remover funções, variáveis, imports e blocos de código declarados mas nunca utilizados, reduzindo tamanho do bundle e melhorando performance.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  category: optimization
---

## O que faz
- Escaneia toda a base de código em busca de funções, métodos e variáveis não utilizados
- Identifica imports e require statements nunca referenciados
- Detecta componentes, classes e módulos órfãos
- Encontra blocos de código comentados ou dead branches (if/else que nunca executam)
- Analisa exports públicos que não são importados por nenhum outro módulo
- Verifica chamadas de API, endpoints ou handlers não utilizados
- Gera relatório de código morto organizado por impacto (seguro remover vs. precisa investigar)
- Sugere refatoração passo a passo para remoção segura

## Quando usar
Use antes de builds de produção, ao notar bundles muito grandes, ao herdar código legado, ou periodicamente como parte de manutenção preventiva.

## Como usar
Inclua no prompt o escopo da análise. Exemplo: "Use dead-code para analisar todo o projeto" ou "Use dead-code para verificar código não utilizado no diretório src/components."
