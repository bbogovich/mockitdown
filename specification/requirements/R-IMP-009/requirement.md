---
id: R-IMP-009
title: Components as templates with content slots
status: active
version: 0.12.0
rev: 0
page: IMP.1
slot: reqs
order: 9
hash: c793cd97d87d
source: [SRC-19]
realizes: [F-4]
requires: [R-EVAL-005, R-LANG-004]
constrained_by: [A-EVAL-1]
decisions: [ADR-24]
---

C1: When no argument binds a view-typed stored property that has a default, the evaluator MUST evaluate the default in the struct's own scope and place its views wherever the body names the property.
C2: When no argument binds an optional view-typed property (R-LANG-004.C6) without a default, the evaluator MUST produce no views where the body names it, without a diagnostic and also outside a preview.
C3: When a labelled argument (not a closure) binds a view-typed property, the evaluator MUST evaluate its value as a view expression in the caller's scope and bind the resulting views, as a labelled trailing closure holding that expression would.
C4: A caller MUST be able to fill any combination of a struct's view-typed properties in one call: the unlabelled trailing closure (R-EVAL-005.C2), labelled trailing closures and labelled arguments, while its other properties take arguments or their defaults (R-EVAL-005.C1, C4).
C5: The conformance corpus (R-REPO-004) MUST hold a template case with a struct that has a `content` slot, a slot with a default, an optional slot and a defaulted value property, called once filling all of them and once filling only `content`.
V1: `struct AppShell: View { var title = "App"; @ViewBuilder var sidebar: some View = Text("Nav"); @ViewBuilder var toolbar: (some View)?; @ViewBuilder var content: some View; var body: some View { … } }` called as `AppShell(title: "Orders", toolbar: Button("New")) { Text("Table") }` renders "Orders", "Nav", the button and "Table"; `AppShell { Text("Table") }` renders "App", "Nav" and "Table", no toolbar and no diagnostic.
