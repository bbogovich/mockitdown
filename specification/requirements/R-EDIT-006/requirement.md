---
id: R-EDIT-006
title: The design session and its events
status: active
version: 0.10.0
rev: 0
page: WEB.3
slot: reqs
order: 6
hash: b09c939b9c21
source: [SRC-12]
realizes: [F-19, F-20]
requires: [R-EDIT-005, R-EDIT-002]
constrained_by: [A-WEB-4, M-EDIT-1, M-EDIT-3]
---

C1: `mockitdown/design` MUST export `DesignSession`, a plain object without DOM access that holds a design document, the name of the active mockup, the selection (the ids of sibling view nodes of the active mockup), the hovered node and, per mockup, its last valid tree and its current diagnostics.
C2: The session MUST parse a mockup's code with `parseTree` (R-EDIT-001.C5) when the mockup is first needed and after every change of its code, and MUST keep the last valid tree when the code does not parse.
C3: `session.apply(op)` MUST apply an edit operation (R-EDIT-002, R-EDIT-003) to the active mockup, replace its code with the edited source, keep its tree from `reparse` and keep the selected nodes that still exist.
C4: `session.subscribe(listener)` MUST register a listener, and the session MUST notify every listener once per state change with one of the kinds `select`, `hover`, `change`, `insert`, `rename`, `active` and `diagnostics` and its detail.
C5: The detail of a notification MUST be: `select` `{mockup, nodes}`; `hover` `{mockup, node}`; `change` `{kind, mockup, edits, code}` with `kind` one of `code`, `options`, `move` and `mockups` and `edits` the text edits (M-EDIT-3, empty unless `kind` is `code`); `insert` `{mockup, node, element}`; `rename` `{from, to}`; `active` `{mockup}`; `diagnostics` `{mockup, diagnostics}`.
C6: Applying one operation or command MUST produce exactly one `change` notification, however many text edits it made.
C7: The design-tool components MUST dispatch the notifications of kinds `select`, `change`, `insert`, `rename` and `diagnostics` to the host as bubbling, composed DOM events named `mockitdown-select`, `mockitdown-change`, `mockitdown-insert`, `mockitdown-rename` and `mockitdown-diagnostics`, with the notification's detail as the event's `detail`.
C8: Inside a `mockitdown-designer`, only the designer element MUST dispatch these events; a component used on its own MUST dispatch those of its own session.
C9: `session.nodeFor(mockup, ordinal)` MUST return the id of the view node with that ordinal in the mockup's current tree, so that an element of an edit-mode rendering (R-EDIT-004.C4) maps to its node.
C10: `session.select(ids)` MUST refuse a list whose nodes are not siblings, and MUST replace the selection otherwise.
C11: A component MUST join the session of the nearest enclosing `mockitdown-designer`, else the session its host sets as its `session` property, else a session of its own.
V1: A unit test opens a document in a session, applies an insert and a remove, and receives exactly two `change` notifications whose edits, applied to the original code, give the session's code.
