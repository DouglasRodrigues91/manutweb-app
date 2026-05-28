---
name: build-apk-web
description: Gera builds de produção para Android (APK/AAB) e Web, configurando toolchains, otimizações e pipeline de CI/CD.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  category: build
---

## O que faz
- Configura toolchains para build Android (Gradle, Android SDK, assinatura)
- Gera APK e AAB assinados para produção
- Cria builds web otimizadas (minificação, tree-shaking, code splitting)
- Configura variantes de build (debug/release/staging)
- Integra CI/CD com GitHub Actions ou equivalentes
- Configura ProGuard/R8 para ofuscação e redução de tamanho
- Gera manifests e configurações específicas da plataforma

## Quando usar
Use ao preparar uma build de produção para Android ou Web, ao configurar um novo pipeline de CI/CD, ou ao otimizar builds existentes para reduzir tamanho e melhorar performance.

## Como usar
Inclua no prompt qual plataforma (Android, Web, ou ambas) e o tipo de build (debug, release, staging). Exemplo: "Use build-apk-web para gerar APK release assinado" ou "Use build-apk-web para configurar build web de produção."
