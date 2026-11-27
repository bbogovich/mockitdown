---
id: ADR-5
title: Static CSS replicas, no framework runtime, no scripts, no network
status: active
version: 0.2.0
rev: 0
page: ADR.1
slot: decisions
order: 5
source: [SRC-2, SRC-3]
constrains: [R-REND-006, R-REND-007, R-MDX-006, R-PACK-007]
hash: cbe83e4dcae7
---

D1: Each pack imitates its framework with static CSS over mockitdown's own markup; mockups use no framework runtime, no web components, no JavaScript, no CDN and no web fonts.
D2: The prototype's `ui5-*` SAPUI5 web components and declarative shadow DOM are dropped.
O1: rejected: load the real frameworks (UI5 web components, Material UI, Fluent web components) — needs JavaScript and network access, is non-deterministic, breaks with `navigation.instant`, and React/Angular components cannot run in a static page without a build.
O2: rejected: web fonts for framework typography (SF Pro, Segoe UI Variable, Roboto, 72) — licensing (SF Pro) and network dependence; system font stacks are close enough.
C1: Output is deterministic, offline-capable and safe in untrusted previews.
C2: Fidelity is an approximation maintained by CSS; complex framework behaviours appear only as the static state the author describes.
C3: Pages stay compatible with instant navigation.
<!-- file: prose.md -->
**Context.** The prototype's `fiori` kit emitted real `ui5-*` tags that "come alive" under the UI5
runtime (SRC-3). With seven frameworks, three of them React/Angular libraries, real runtimes are
impractical in a documentation page.

**Decision.** Replicate each design language in CSS.

**Consequences.** mockitdown owns the fidelity of every pack; the example site is the visual
regression reference.
