---
id: R-DEV-002
title: Device selection
status: active
version: 0.2.1
rev: 1
page: REND.2
slot: reqs
order: 5
source: [SRC-2]
realizes: [F-10]
constrained_by: [A-REND-2, A-MDX-1]
reverse_engineered: true
hash: 310b1b390165
---

C1: The figure assembler MUST take the device form from the `device` fence attribute or render option, else from `@Screen(device:)`, else from the configured default device (`default_device`), else from the pack's default `device`.
C2: If the device form is neither `fit`, a pack size nor a default size, then the figure assembler MUST warn "unknown device 'x'; using desktop (known: …)" with code `device` and use `desktop`.
C3: When both `width` and `height` are given, the frame MUST have exactly that size; when only one is given, it MUST replace that dimension of the device size.
V1: A site with `default_device: tablet` renders a block with `@Screen(device: .phone)` as a phone and a block without any device as a tablet; `width=600` on a phone gives 600 × 852.
