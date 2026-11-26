---
id: R-PACK-015.CR-4
target: R-PACK-015
kind: correction
version: 0.8.8
date: 2026-11-25
summary: "C7: hairline columns only at fit/iOS; iPadOS and macOS use the floating sidebar (R-DEV-010.C3, C6) — review of #12"
from: 07e2998d1d35
to: d23a2e29270f
---

## Clauses

@ C7 edit
~ A `NavigationSplitView` MUST take its columns from `sidebar:`/`content:`/`detail:` closures (or, unlabelled, the first child as sidebar and the last as detail, a middle child as content) and render two or three columns: the sidebar (a `.sidebar` list with its own navigation title, 320 points on a tablet and at `fit`, 220 on a desktop), the optional content column, and the detail with its title, separated by [-hairlines;-]{+hairlines at `fit` and with `ios` chrome;+} a column's title is the `.navigationTitle` of its content unless the column is a `NavigationStack`, which draws its own bar; `.balanced` MUST share the width between the columns side by side (as `.automatic`) and `.prominentDetail` MUST keep the detail at full width with the sidebar floating over it; with `macos` {+or `ipados` +}chrome it MUST follow [-R-DEV-010.C3.-]{+R-DEV-010.C3 and C6.+}

## Files

(none)
