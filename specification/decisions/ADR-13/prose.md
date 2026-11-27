**Context.** SRC-2 requires SwiftUI, Fluent on Windows, Angular, React (with current Material UI)
and SAPUI5, and asks for proposals of others.

**Decision.** Bootstrap — still the most deployed CSS component framework — and shadcn/ui — the
fastest-growing React component style — are added. Ant Design (dominant in enterprise React), Tailwind Catalyst, IBM Carbon and GitHub
Primer followed in 0.4.

**Consequences.** Eight packs to maintain under one contract; framework major versions are
recorded in each `pack.json` (`version`).

Checked at 0.10.1: R-PACK-008 has since been extended (0.3.0 to 0.5.0) to the full list of framework, retro and hidden packs; the eight packs of D1 and the four of D2 are still shipped, and C1 and C2 stand. R-PACK-008.C1 is the current list.

**Re-checked at 0.11.0.** Its cited items R-PACK-008 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.
