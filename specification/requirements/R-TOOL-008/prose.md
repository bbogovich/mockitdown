A light editor built for this project (SRC-12#s9): a `<textarea>` over a coloured copy of its text,
with line numbers, diagnostics in the gutter, bracket matching and auto-indent. It has no third-party
editor (SRC-12#s14 "Dependencies", ADR-20) and, by the developer's choice, no find and replace, folding
or multi-cursor; find and replace can be a later issue. It is usable on its own, for example to show code
beside a `mockitdown-mockup`.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-20, R-EDIT-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
