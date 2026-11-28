The gallery of SRC-13#p1.c3 and SRC-14: the elements allowed at the selection, drawn as small live
previews in the pack's style — the same samples as the Reference pages and the pack gallery test page
(R-PACK-013), created as they scroll into view as the pack gallery does (R-WEB-004.C10). The "Hidden
here" footer says what the role rules filtered out and why, so the rule is never a mystery.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-006, R-PACK-016, R-WEB-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-PACK-016, R-WEB-002 (changed at 0.12.0, 0.12.4: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges; test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#29).** The inserted code is the bare call `<Name>()`; R-TOOL-006 gives it the sample's
arguments. Inserting at the root uses the top-level `insert` of R-EDIT-002 (`parent: null`) through the
session's `insert` command, so the gallery itself holds no editing rule (A-WEB-5.K2). Components are
listed by the structs the edit-mode evaluation knows (`evaluate(…).structs`), declared or imported.
