---
id: M-EDIT-3
title: TextEdit
status: active
version: 0.10.0
rev: 0
page: MODEL.1
slot: entities
order: 14
hash: 51527ff009f9
level: entity
---

F1: start: int — offset of the first replaced code unit (UTF-16)
F2: end: int — offset after the last replaced code unit; equal to `start` for an insertion
F3: text: str — the replacement text; empty for a removal
I1: The edits of one change MUST be in ascending order of `start` and MUST NOT overlap, every offset referring to the text before the change.
