---
id: R-API-001
title: render
status: active
version: 0.2.0
rev: 0
page: API.1
slot: reqs
order: 1
source: [SRC-2]
realizes: [F-13, F-11]
constrained_by: [A-API-1, M-API-1]
reverse_engineered: true
hash: d66ed75ab2f6
---

C1: The library API MUST provide `render(source, options=None, **overrides)` returning a render result with `html` (the fragment, without CSS), `diagnostics`, `packs` (the ids of the selected pack's lineage, root first; empty when nothing rendered) and `screen` (the evaluated screen or `None`).
C2: Keyword overrides MUST replace the named render options when they are not `None`; unknown names MUST be ignored.
C3: A render result MUST expose `errors` (the error diagnostics) and `ok` (true when there are none).
C4: The HTML MUST be the error box (when there are errors, or warnings shown by `show_warnings`) followed by the figure and, when requested, the source disclosure; for a syntax error it MUST be the error box only.
V1: `render('import SwiftUI\nText("Hello")', device="phone")` returns `ok` true, `packs` `["base", "swiftui"]` and a figure for a phone.
