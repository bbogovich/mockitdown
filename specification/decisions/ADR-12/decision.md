---
id: ADR-12
title: Zero runtime dependencies in the core; Python 3.11 or later
status: active
version: 0.2.0
rev: 0
page: ADR.2
slot: decisions
order: 5
source: [SRC-2]
constrains: [R-API-004]
hash: 4ff0cd3e62fe
---

D1: The core (language, evaluation, packs, rendering, stylesheets, assets, icons, CLI) uses only the Python standard library.
D2: Markdown and pymdown-extensions are the optional `markdown` extra, needed only for the site integration.
D3: The minimum Python version is 3.11.
O1: rejected: a parser generator (Lark, ANTLR) — a dependency for a grammar small enough to hand-write, and worse error messages.
O2: rejected: a templating engine (Jinja) for markup — role markup is short and escaping is simpler to audit in code.
O3: rejected: Python 3.14 minimum (the prototype's) — Zensical and common CI images support 3.11, and nothing in the core needs newer.
C1: Installing mockitdown adds nothing to an environment except, for sites, the two Markdown packages it already uses.
C2: The parser, CSS minifier and MIME detection are maintained in the project.
