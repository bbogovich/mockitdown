---
id: R-PACK-015.CR-5
target: R-PACK-015
kind: clarification
version: 0.8.9
date: 2026-11-25
issue: 13
summary: "as built: on a phone the split view follows R-DEV-010.C5 (collapsed to its sidebar) (#13)"
from: d23a2e29270f
to: 4b926c87e423
---

## Clauses

@ C7 edit
~ A `NavigationSplitView` MUST take its columns from `sidebar:`/`content:`/`detail:` closures (or, unlabelled, the first child as sidebar and the last as detail, a middle child as content) and render two or three columns: the sidebar (a `.sidebar` list with its own navigation title, 320 points on a tablet and at `fit`, 220 on a desktop), the optional content column, and the detail with its title, separated by hairlines at `fit` and with `ios` chrome; a column's title is the `.navigationTitle` of its content unless the column is a `NavigationStack`, which draws its own bar; `.balanced` MUST share the width between the columns side by side (as `.automatic`) and `.prominentDetail` MUST keep the detail at full width with the sidebar floating over it; with `macos` or `ipados` chrome it MUST follow R-DEV-010.C3 and [-C6.-]{+C6, and on a `phone` form R-DEV-010.C5 (the split view collapsed to its sidebar).+}

## Files

(none)
