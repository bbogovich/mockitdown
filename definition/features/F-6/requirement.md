---
id: F-6
title: Element identifiers and the Elements table
status: active
version: 0.2.0
rev: 0
page: FEAT.1
slot: features
order: 6
family: authoring
source: [SRC-3]
hash: 91d048040fa6
---

G1: A specification must be able to cite individual parts of a screen, and a mockup must show which parts carry which requirement.
C1: An author tags an element with an identifier (`.id("…")`) and with references to requirement or use-case IDs (`.ref("…")`).
C2: On request, the figure is followed by an Elements table listing every tagged element with its identifier, element name, component and references.
C3: A mockup carries a screen identifier and title (from the fence or `@Screen`) shown in its caption.
C4: The tags appear on the rendered markup, so tests and tooling can locate elements.
AC1: With `elements="true"`, a block with three `.id` tags renders a three-row Elements table in source order.
AC2: The caption reads `<id> · <title>` when both are given.
