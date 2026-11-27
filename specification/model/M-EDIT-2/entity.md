---
id: M-EDIT-2
title: DesignMockup
status: active
version: 0.10.0
rev: 0
page: MODEL.1
slot: entities
order: 13
hash: 2b5630e3c076
level: entity
---

F1: name: str · key — unique, case-sensitive, may hold spaces
F2: x: number — canvas position of the frame's left edge
F3: y: number — canvas position of the frame's top edge
F4: options: dict · optional — render options of this mockup (`pack`, `device`, `width`, `height`, `title`, …)
F5: code: str — the mockitdown source, verbatim
I1: The mockup's pack MUST be `options.pack`, else the document's `defaults.pack`, else `base`.
