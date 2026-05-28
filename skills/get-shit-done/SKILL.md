---
name: get-shit-done
description: Meta-prompting system for spec-driven development. Spawns specialized agents with fresh 200k+ token contexts. Phases: discuss, plan, execute, verify. Ends context rot.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  category: workflow
---

## O que faz
- Sistema de meta-prompting com 4 fases: **Discuss → Plan → Execute → Verify**
- Spawna agentes especializados com contextos frescos (evita context rot)
- Mantém estado persistente em documentos estruturados
- Fase Discuss: explora requisitos e define escopo
- Fase Plan: cria especificação detalhada (spec)
- Fase Execute: implementa seguindo o spec
- Fase Verify: valida e testa o resultado
- Gerencia dependências entre tarefas
- Preserva decisões e rationale entre sessões

## Quando usar
Use em projetos complexos que exigem planejamento antes da execução, ou quando o contexto da sessão está ficando grande demais e degradando a qualidade.

## Como usar
Inicie com uma descrição do que precisa ser feito. A skill guia automaticamente pelas fases: "Use get-shit-done para implementar o sistema de autenticação."
