---
id: R-EDIT-006
title: The design session and its events
status: active
version: 0.13.23
rev: 9
page: WEB.3
slot: reqs
order: 6
hash: 81413be2474f
source: [SRC-12]
realizes: [F-19, F-20]
requires: [R-EDIT-005, R-EDIT-002]
constrained_by: [A-WEB-4, M-EDIT-1, M-EDIT-3]
refs: [M-EDIT-3, R-EDIT-001, R-EDIT-002, R-EDIT-003, R-EDIT-004, R-EDIT-005, R-TOOL-014]
---

C1: `mockitdown/design` MUST export `DesignSession`, a plain object without DOM access that holds a design document, the name of the active mockup, the selection (the ids of sibling view nodes of the active mockup), the hovered node and, per mockup, its last valid tree and its current diagnostics.
C2: The session MUST parse a mockup's code with `parseTree` (R-EDIT-001.C5) when the mockup is first needed and after every change of its code, and MUST keep the last valid tree when the code does not parse.
C3: `session.apply(op)` MUST apply an edit operation (R-EDIT-002, R-EDIT-003) to the active mockup, replace its code with the edited source, keep its tree from `reparse` and keep the selected nodes that still exist.
C4: `session.subscribe(listener)` MUST register a listener and return a function that removes it, and the session MUST notify every listener once per state change with one of the kinds `select`, `hover`, `change`, `insert`, `rename`, `active` and `diagnostics` and its detail, as one object `{kind, detail}`, and MUST NOT notify a request that changes nothing.
C5: The detail of a notification MUST be: `select` `{mockup, nodes}`; `hover` `{mockup, node}`; `change` `{kind, mockup, edits, code}` with `kind` one of `code`, `options`, `move`, `mockups` and `sections` (R-TOOL-014.C8, whose `mockup` and `code` are empty) and `edits` the text edits (M-EDIT-3, empty unless `kind` is `code`); `insert` `{mockup, node, element}`; `rename` `{from, to}`; `active` `{mockup}`; `diagnostics` `{mockup, diagnostics}`.
C6: Applying one operation or command MUST produce exactly one `change` notification, however many text edits it made.
C7: The design-tool components MUST dispatch the notifications of kinds `select`, `change`, `insert`, `rename` and `diagnostics` to the host as bubbling, composed DOM events named `mockitdown-select`, `mockitdown-change`, `mockitdown-insert`, `mockitdown-rename` and `mockitdown-diagnostics`, with the notification's detail as the event's `detail`.
C8: Inside a `mockitdown-designer`, only the designer element MUST dispatch these events, once per notification of its session, also for a change made through a component outside it that joined its session; a component used on its own MUST dispatch those of its own session.
C9: `session.nodeFor(mockup, ordinal)` MUST return the id of the view node with that ordinal in the mockup's current tree, so that an element of an edit-mode rendering (R-EDIT-004.C4) maps to its node.
C10: `session.select(ids)` MUST refuse a list whose nodes are not siblings, or that names an id the active mockup's tree does not have, and MUST replace the selection otherwise; siblings are the children of one view node, or the parentless nodes of the top level or of one struct.
C11: A component MUST join the session of the nearest enclosing `mockitdown-designer`, else the session its host sets as its `session` property, else a session of its own.
C12: The active mockup of a new session MUST be the one the document's `view.active` names, else the first mockup, else none, and `session.setActive(name)` MUST make another mockup active, notifying `active` and clearing the selection and the hover.
C13: `session.apply(op)` MUST be refused, changing nothing and notifying nothing, when the operation is refused or the active mockup's code does not parse, and MUST notify `insert` with the inserted root node after the `change` of an `insert` operation, then `select` or `hover` when they lost a removed node.
C14: `session.setCode(mockup, code)` MUST replace a mockup's code with text and notify one `change` of kind `code` whose one edit replaces the part between the longest common prefix and suffix, and MUST re-parse from the last valid tree, so that nodes outside the changed text keep their ids.
C15: `session.hover(id)` MUST set the hovered node of the active mockup, or clear it with null, and MUST refuse an id its tree does not have.
C16: `session.setOptions(mockup, options)` and `session.moveMockup(mockup, x, y)` MUST replace a mockup's options and position and notify a `change` of kind `options` or `move` with no edits; a position that is not a finite number MUST be refused.
C17: A mockup's diagnostics MUST be those of `check` with its render options (R-EDIT-005.C9) over the session's `renderOptions`, when packs are loaded into the core, else its syntax diagnostics, and the session MUST notify `diagnostics` when they change after a change of the mockup.
C18: `mockitdown/design` MUST export `DESIGN_EVENTS`, the map from the notification kinds of C7 to their DOM event names.
C19: `session.delete()` MUST remove the selected nodes (R-EDIT-002.C6) as one change, then make the selection the statement after the last of them in their body that is not removed, else the one before it, else their parent view node, else nothing, notifying one `change` and then one `select`, and MUST be refused, changing and notifying nothing, when nothing is selected or the removal is refused.
C20: `session.insert(code, parent, index)` MUST insert one view's code (R-EDIT-002.C4) before statement child `index` of `parent` (default `end`, the last child), a node id of the active mockup, by default of the first selected node, else in the mockup's top level (`parent` null), then make the inserted node the selection, notifying one `change`, one `insert` and one `select`, and MUST be refused, changing and notifying nothing, as `apply` refuses an insert.
C21: `session.move(nodes, parent, index)` MUST move sibling nodes of the active mockup (R-EDIT-002.C8, C32) as one change, the moved nodes keeping their ids and becoming the selection, and MUST be refused, changing and notifying nothing, as `apply` refuses a move.
V1: A unit test opens a document in a session, applies an insert and a remove, and receives exactly two `change` notifications whose edits, applied to the original code, give the session's code.
