**Context.** SRC-2 requires SwiftUI, Fluent on Windows, Angular, React (with current Material UI)
and SAPUI5, and asks for proposals of others.

**Decision.** Bootstrap — still the most deployed CSS component framework — and shadcn/ui — the
fastest-growing React component style — are added. Ant Design (dominant in enterprise React), Tailwind Catalyst, IBM Carbon and GitHub
Primer followed in 0.4.

**Consequences.** Eight packs to maintain under one contract; framework major versions are
recorded in each `pack.json` (`version`).
