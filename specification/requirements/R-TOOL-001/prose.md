The view of SRC-13#p1.c4 for one mockup. A click is a quick way to *locate* an element: it selects
the innermost element under the pointer, and a second click or Esc climbs to the parent, because a click
on a button's label could mean the label, the button, the stack or the card around it (SRC-12#s5). The
outline remains the primary means of selection.

Elements that a loop, a condition or a component produced select the construct they came from and show a
"derived" badge, because editing them means editing that construct.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-004, R-EDIT-006, R-WEB-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-WEB-002 (changed at 0.12.0: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
