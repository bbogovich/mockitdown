---
id: R-API-002
title: check, evaluate and stylesheet
status: active
version: 0.2.0
rev: 0
page: API.1
slot: reqs
order: 2
source: [SRC-2]
realizes: [F-13]
constrained_by: [A-API-1]
reverse_engineered: true
hash: f27f25799de0
---

C1: The library API MUST provide `check(source, options=None, **overrides)` returning every diagnostic of a full render.
C2: The library API MUST provide `evaluate(source, options=None)` returning the evaluated screen (or `None` on a syntax error) and the diagnostics collector, without rendering.
C3: The library API MUST provide `stylesheet(packs=None, *, pack_paths=(), minify=True)` returning the CSS for the given pack ids, or for every known pack when `packs` is `None`.
C4: The package MUST export `render`, `check`, `evaluate`, `stylesheet`, `RenderOptions`, `RenderResult`, `Diagnostic`, `Severity`, `MockitdownError`, `MockitdownSyntaxError`, `makeExtension` and `__version__`.
V1: `from mockitdown import render, stylesheet` and `f"<style>{stylesheet(r.packs)}</style>{r.html}"` produces a self-contained page fragment.
