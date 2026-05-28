---
name: seguranca
description: Analisa código e arquitetura em busca de vulnerabilidades de segurança, aplica OWASP Top 10, valida autenticação, autorização, injeção, exposição de dados sensíveis e boas práticas de segurança.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  category: security
---

## O que faz
- Analisa código contra OWASP Top 10 (injeção, quebra de autenticação, XSS, SSRF, etc.)
- Verifica exposição de secrets, tokens e dados sensíveis no código
- Valida autenticação e autorização em rotas/endpoints
- Verifica proteção contra SQL/NoSQL injection e command injection
- Analisa dependências por vulnerabilidades conhecidas
- Verifica headers de segurança (CSP, HSTS, CORS)
- Valida sanitização de inputs e outputs
- Sugere correções específicas para cada vulnerabilidade encontrada

## Quando usar
Use ao implementar novas funcionalidades que manipulam dados sensíveis, ao revisar código antes de deploy, ao configurar autenticação/autorização, ou em qualquer alteração que envolva entrada de usuário.

## Como usar
A skill é ativada automaticamente ao detectar operações sensíveis. Para uso explícito: "Use seguranca para auditar este código" ou "Use seguranca para verificar vulnerabilidades neste endpoint."
