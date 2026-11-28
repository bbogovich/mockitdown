---
id: ADR-18
title: The web variant is a TypeScript port held to the Python output
status: active
version: 0.12.12
rev: 6
page: ADR.2
slot: decisions
order: 999
hash: 6bc92909b033
source: [SRC-8]
constrains: [R-WEB-001, R-REPO-004]
---

D1: The web variant re-implements the lexer, parser, evaluator, renderer, style builder and chart renderer in TypeScript, module for module after the Python core.
D2: The Python variant is the reference: for every case of the conformance corpus the TypeScript renderer MUST produce the HTML the Python renderer produces.
D3: The TypeScript core runs in browsers and in Node without DOM access, producing an HTML string; only the custom elements touch the DOM.
O1: rejected: running the Python library in the browser (Pyodide/WebAssembly) — a multi-megabyte runtime for a component meant to be light.
O2: rejected: a rendering server — the web variant has no backend (SRC-8).
C1: Every change to rendering in one variant is made in both, in the same issue, with a conformance case.
