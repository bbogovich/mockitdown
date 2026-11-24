---
id: UC-1
title: Share a component library across a site
---

**Actor:** documentation-site maintainer.

1. The maintainer writes `docs/mockups/shared/kpi.mockitdown` declaring `struct KPI: View`.
2. The maintainer sets the extension's import directory to `docs/mockups`.
3. Authors write `import "shared/kpi"` in any block and use `KPI(…)`.

**Outcome:** every page renders the same KPI component; changing the library changes every mockup
on the next build.
