The developer asked for import paths to work like a virtual file system — a map from namespaces to
locations, as TypeScript's `paths` does — for several component libraries with overlapping names to
coexist, for components defined on the same page to be importable, and for components to act as
templates whose users override values and fill content. SwiftUI already has the template mechanism:
`@ViewBuilder` properties (the developer's "@ContentBuilder"), so no new syntax is added for it.


**Re-checked at specification 0.12.10.** Re-read against R-MDX-002 (changed at 0.12.10: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
