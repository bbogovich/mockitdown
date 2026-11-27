---
id: R-PACK-006
title: Design tokens
status: active
version: 0.2.0
rev: 0
page: PACK.1
slot: reqs
order: 6
source: [SRC-2]
realizes: [F-3, F-9]
constrained_by: [A-PACK-1, A-STYLE-1]
decisions: [ADR-6]
reverse_engineered: true
hash: 2ce414775763
---

C1: Every pack MUST define light tokens for at least every light token name of `base`, and MUST define at least one dark token.
C2: The stylesheet assembler MUST emit each token as the CSS custom property `--mkd-<name>`; it MUST skip a token whose name is not made of letters, digits, `_` and `-`, or whose value contains `{`, `}`, `;`, `<` or `>`.
C3: The base token set MUST include surface and text colours (`bg`, `surface`, `surface-2`, `surface-3`, `fg`, `fg-2`, `fg-3`, `border`, `divider`), the accent (`accent`, `on-accent`, `accent-soft`), status colours (`danger`, `warning`, `success`, `info`), field colours, `scrim`, three shadows, five radii, the fonts, base font size and line height, icon stroke and size, control height, gap and padding, chrome colours, a size and weight for each canonical font style, thirteen named colours and six chart colours.
C4: Pack CSS MUST take colours, radii, shadows and typography from tokens rather than literal values wherever a token exists, so that appearance switching (R-APP-002) restyles it.
V1: The contract test checks that every pack's light tokens include all of `base`'s and that its dark tokens are non-empty.
<!-- file: TC-1.md -->
---
id: TC-1
title: Tokens for light and dark
verifies: [C1]
---

Automated by `tests/test_packs.py::PackTests::test_tokens_have_light_and_dark`.
<!-- file: prose.md -->
Tokens are the bridge between a pack's data and its CSS and the mechanism of light and dark mode:
pack CSS says `background: var(--mkd-surface)`, and the frame's appearance decides which value
that is. The complete base token list, with values, is on the [Pack format](format.md) page.
