---
id: R-REND-003
title: Attributes on the markup
status: active
version: 0.2.0
rev: 0
page: REND.1
slot: reqs
order: 3
source: [SRC-3]
realizes: [F-3, F-6, F-8]
constrained_by: [A-REND-1]
reverse_engineered: true
hash: 035c2ef54ac4
---

C1: The renderer MUST copy the view attributes `variant`, `size`, `color`, `shape`, `density`, `elevation`, `placement`, `orientation`, `emphasis`, `design`, `severity`, `kind`, `labelStyle`, `position`, `appearance` and `level` to `data-<name>` on the root element when the value is a string, number, boolean or enum value whose text matches `^[A-Za-z0-9_. -]{1,40}$`; booleans MUST be written `true`/`false` and enum values by name.
C2: The renderer MUST set `data-state` to the `state` attribute's name; when `disabled` is truthy it MUST set `data-state="disabled"`, and otherwise when `error` is set and not false or empty and no state was given, `data-state="error"`.
C3: When `selected` is truthy, the renderer MUST set `data-selected="true"`.
C4: The renderer MUST set `data-mkd-id` from `.id(x)`, `data-ref` from `.ref(a, b, …)` (space-separated) and `title` from `.help(x)`.
C5: A role MAY add role-specific `data-*` attributes; each MUST be listed in the role catalogue.
V1: `Button("Delete").buttonStyle(.bordered).disabled(true).id("del")` renders `data-variant="bordered" data-state="disabled" data-mkd-id="del"`.
