---
id: R-EVAL-004
title: Binding element arguments
status: active
version: 0.13.11
rev: 2
page: LANG.2
slot: reqs
order: 4
source: [SRC-2, SRC-12]
realizes: [F-2, F-3, F-12]
constrained_by: [A-EVAL-1, M-PACK-2, M-VIEW-1]
reverse_engineered: true
hash: ca0c9e9355e8
refs: [R-PACK-011]
---

C1: When an element is called, the evaluator MUST start the view's attributes from the element definition's defaults, then set one attribute per labelled argument, named by its label.
C2: The evaluator MUST assign positional arguments to the element definition's `params` in order; positional arguments beyond them MUST be kept as extra arguments.
C3: The evaluator MUST evaluate an element's unlabelled trailing closure as its children and each labelled trailing closure as a named slot.
C4: When a labelled argument's value is a closure, the evaluator MUST evaluate it as views: the argument `content` becomes the children when there are none yet, any other label becomes a slot of that name.
C5: The evaluator MUST discard closure-valued arguments labelled `action`, `onCommit`, `onEditingChanged` or `perform` without evaluating them.
C6: When a labelled argument's value is a list of views (a view call used as an argument, such as `label: Label(…)`), the evaluator MUST also make it the slot of that label unless a slot of that name already exists.
V1: `Button("Save", systemImage: "tray") { … }` with params `["label"]` yields attributes `label="Save"`, `systemImage="tray"`; `Section("A") { X() } footer: { Y() }` yields children `[X]` and slot `footer: [Y]`; `Button("Go", action: { doIt() })` evaluates nothing for `action`.
C7: A labelled argument of an element call is understood when its label is a name in the element definition's `params` or `defaults`, an argument alias of the element or its pack (R-PACK-011), a label its render role reads (C8) or a discarded action label (C5), or when its value is a closure or views (C3, C4, C6).
C8: `shared/language/roles.json` MUST list the labels each render role reads as `reads`, at the top level those every role reads through the common element markup and in each role's rule those it reads besides, and both variants MUST take the labels of C7 from that file.
C9: If a labelled argument of an element call is not understood (C7) and its value is not a binding (`$name`), then the evaluator MUST report the warning "'<label>' is not understood by <Element> in pack '<id>'" with code `argument`, at the argument's location, and still render the element.
C10: The shipped design patterns, the reference samples and the example site MUST render without a warning of C9.
C11: When a role's rule lists no `reads`, or the TypeScript core has no role rules loaded, the evaluator MUST NOT report the warning of C9 for that role's elements.
C12: The Python test suite MUST fail when rendering the conformance corpus looks up a label on a view that neither the common `reads` nor its role's list.
V2: `Text("Hi", colour: .red)` warns "'colour' is not understood by Text in pack 'base'" at line 1, column 12 and still renders `Hi`; `Toggle("Wi-Fi", unheard: $on)`, `Button("Go", action: { … })`, `Button("Save", type: "primary")` in antd and `Card(cover: Image("photo.png"))` warn nothing.
