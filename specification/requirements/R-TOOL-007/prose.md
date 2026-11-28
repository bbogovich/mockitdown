The properties panel of SRC-13#p1.c5 (SRC-12#s7). Its controls are generated from the typed parameter
data (R-PACK-017), so a new pack needs no inspector code, and it borrows the field style of the MockItOut
inspector: a small grey label above a full-width input (SRC-12#s15).

Edits apply as the designer types, debounced, and a burst of typing is one undo step. An invalid value is
never written: a value the control rejects, or one whose rendering would add a diagnostic at the node,
stays red with the message until corrected.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-003, R-EDIT-007, R-PACK-017 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#35).** The model is `mockitdown/design`'s `inspect.ts`: `inspect(session, pack)` gives the
groups, the fields (each with its control, value, code as written and where it is written) and the Add
lists, and `setField` turns a typed value into an edit operation, checks it with the edit API and with
the diagnostics its code would add at the node, and applies it through the session with the coalescing
key `<node>:<field>`; the element only draws the model and debounces the inputs. A state argument is
edited where it is written, so `Button("Sign in").variant("outlined")` and `Button("Sign in", variant:
"outlined")` both show `outlined`; a new one becomes the pack's modifier (`.disabled(true)`) when the
pack has one. Values the typed controls cannot show (`maxWidth: .infinity`, a variable) are edited as
code. The negative width of V1 is refused by the number field itself: the vocabulary gives the `.frame`
sizes a `min` of 0 (C16), since the renderer does not warn about them. Renaming the mockup stays with the
canvas (R-TOOL-012), so the Mockup tab shows the name; Edit in code (C11) comes with the code view
(R-TOOL-008).
