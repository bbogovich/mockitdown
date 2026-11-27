---
id: R-PACK-005
title: Pack selection
status: active
version: 0.10.8
rev: 1
page: PACK.1
slot: reqs
order: 5
source: [SRC-2]
realizes: [F-3]
constrained_by: [A-EVAL-1, A-PACK-1]
decisions: [ADR-4]
reverse_engineered: true
hash: e7f94f78fd37
refs: [R-EVAL-011]
---

C1: The evaluator MUST select a mockup's pack by the first of: the `pack` fence attribute or render option; the first `import <Module>` whose module name a pack declares (compared case-insensitively); the `pack` argument of `@Screen`; the configured default pack (`default_pack`, default `base`).
C2: If a later `import <Module>` selects a different pack than an earlier one, then the evaluator MUST warn "import M selects pack 'b', but 'a' is already selected; the first import wins" with code `pack`.
C3: If `import <Module>` names no pack's module and is not a neutral module (R-EVAL-011.C3), then the evaluator MUST warn "import M names no known pack" with code `pack`.
C4: If the selected pack cannot be loaded, then the evaluator MUST report the registry's error with code `pack` and use the `base` pack.
C5: When several packs declare the same module name, the first pack in registry order MUST win; shipped packs MUST NOT share a module name.
V1: A block with `import SwiftUI` and fence `pack="fluent"` renders with Fluent; without the fence attribute it renders with SwiftUI; `@Screen(pack: "mui")` applies only when no import selects a pack.
