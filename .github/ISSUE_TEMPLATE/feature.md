---
name: Feature do catálogo
about: 1 issue por feature pontuada — fechada pelo PR que a entrega (Closes #N)
title: "[feature] "
labels: feature
---

**Feature do catálogo:** <!-- nome exato, ver CATALOGO.md -->
**Faixa/pontos:** <!-- fácil 3 / média 5 / difícil 7 / avançada 8-10 -->
**Dono:** <!-- @username — o mesmo do DECISIONS.md; é quem defende ao vivo -->
**Módulo em core/:** <!-- app.core.<nome> (features de menu) -->

## Checklist da feature

- [ ] estrutura em `core/` (Python puro, imitando `core/contadores.py`)
- [ ] endpoint usando o core (sobrevive à sabotagem)
- [ ] página/UI
- [ ] teste autoral (`test_autoral_<feature>.py`)
- [ ] linha no `DECISIONS.md`
- [ ] avançada: `scripts/bench_<feature>.py` + números + interpretação
