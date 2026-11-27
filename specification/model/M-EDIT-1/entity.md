---
id: M-EDIT-1
title: DesignDocument
status: active
version: 0.10.0
rev: 0
page: MODEL.1
slot: entities
order: 12
hash: f27d1fd9bcca
level: entity
---

F1: format: str — always `mockitdown-design`
F2: version: int — the format version, 1
F3: name: str — the document's name
F4: defaults: dict — render options applied to every mockup (among them `pack`, the default pack)
F5: imports: list · optional — component files the mockups may import
F6: sections: list · optional — `{name, x, y, w, h}` rectangles drawn behind groups of mockups
F7: mockups: list — the named mockups, in document order
F8: view: dict · optional — `{zoom, x, y, active}`: the canvas's zoom, position and active mockup
R1: mockups: → M-EDIT-2 (0..*) — the document's mockups
I1: Mockup names MUST be unique within a document.
I2: Keys not listed here MUST be kept, after the listed ones, in the order they were read.
