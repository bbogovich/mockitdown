---
id: R-PACK-002
title: pack.json keys
status: active
version: 0.10.8
rev: 1
page: PACK.1
slot: reqs
order: 2
source: [SRC-3]
realizes: [F-3]
constrained_by: [A-PACK-1, M-PACK-1]
decisions: [ADR-4]
reverse_engineered: true
hash: 0778cd19aea1
refs: [R-DEV-006, R-EVAL-009, R-PACK-004]
---

C1: The pack registry MUST read these `pack.json` keys, all optional except as stated: `id` (default: the directory name), `name` (default: the id), `framework`, `version`, `extends`, `modules`, `device`, `chrome`, `tokens`, `elements`, `modifiers`, `fonts`, `sizes`, `icons`; other keys MUST be ignored.
C2: `modules` MUST be a list of module names that `import <Module>` accepts to select the pack.
C3: `device` MUST be the pack's default device form (default: the parent's, and `desktop` for a root pack).
C4: `chrome` MUST map device forms to chrome kinds (R-DEV-006); a form not listed MUST mean `none`.
C5: `tokens` MUST hold `light` and `dark` objects mapping token names to CSS values.
C6: `elements` MUST map element names to element definitions (R-PACK-004).
C7: `modifiers` MUST map modifier names to `{ "attr": <attribute>, "value": <optional fixed value> }` (R-EVAL-009.C2).
C8: `fonts` MUST map font style names written in the source (`.font(.h4)`) to canonical font styles.
C9: `sizes` MUST map device forms to `[width, height]` in logical points, overriding the default device sizes.
C10: `icons` MUST map icon names to built-in glyph names, consulted before the global icon aliases.
V1: A minimal `{"id": "acme", "extends": "mui"}` loads with the Material UI pack's elements, tokens, modifiers, chrome and sizes.
