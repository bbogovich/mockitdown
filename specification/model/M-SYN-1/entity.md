---
id: M-SYN-1
title: Module
status: active
version: 0.2.0
rev: 0
page: MODEL.1
slot: entities
order: 1
level: entity
hash: 2e97f0a52b7b
---

F1: source: str · optional — the file the source came from (empty for a fenced block)
F2: imports: list · ordered — `Import` nodes, each with a quoted `path` or a dotted `module` name
F3: attributes: list · ordered — top-level directives (`@Screen`)
F4: structs: list · ordered — `StructDecl` nodes: name, conformances, properties, optional body
F5: statements: list · ordered — top-level statements, including `#Preview` contents
I1: A module MUST be produced only by the parser and MUST NOT be modified by the evaluator.
