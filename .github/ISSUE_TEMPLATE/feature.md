---
name: Feature do catálogo
about: Uma issue por feature pontuada. O PR que a entrega fecha a issue com Closes #N.
title: "[feature] "
labels: feature
---

**Feature do catálogo:** <!-- nome exato, como no CATALOGO.md -->
**Esforço e pontos:** <!-- P = 3, M = 5, G = 7; avançada M = 8, G = 10 -->
**Dono:** <!-- @username, o mesmo do DECISIONS.md. Quem responde pela feature. -->
**Módulo em core/:** <!-- app.core.<nome> (features de menu) -->

## Checklist

- [ ] estrutura em `core/` (Python puro, como `core/contadores.py`)
- [ ] endpoint que usa o `core/` (quebra se o `core/` for sabotado)
- [ ] página no frontend
- [ ] teste autoral (`test_autoral_<feature>.py`)
- [ ] linha no `DECISIONS.md`
- [ ] só avançada: `scripts/bench_<feature>.py`, números e interpretação
