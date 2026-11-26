---
id: R-WEB-004.CR-4
target: R-WEB-004
kind: clarification
version: 0.8.12
date: 2026-11-25
summary: "re-based on R-WEB-002@0.8.9: pattern options map to mockitdown-mockup attributes, incl. windowed"
from: a23dbc0ef5c5
to: 6a911f4e9141
---

## Clauses

@ C14 edit
~ An entry of `shared/patterns/index.json` MAY carry `packs` (pack ids; the pattern is shown only for those packs and MAY import their module), `device`, `chrome`, [-`menubar`-]{+`menubar`, `app`+} and [-`app`;-]{+`windowed`, passed to the `mockitdown-mockup` as the attributes of the same name (R-WEB-002.C3);+} for `swiftui` the gallery MUST show at least an iPhone app (TabView with a NavigationStack list and detail), an iPad app (three-column NavigationSplitView) and a Mac app (NavigationSplitView with toolbar, `.commands` and `menubar` naming an open menu).

## Files

(none)
