Naming a new element takes one keystroke sequence (SRC-12#s6): it arrives with its sample's arguments,
as in the Reference pages, and its first text opens for editing at once.

**As built (#31).** The sample is the one the pack's reference data publishes (R-PACK-013), so the
text depends on the pack: in the base pack a `Button` arrives as `Button("Label")` and a `Toggle` as
`Toggle("Label")`, in swiftui as `Button("Share", systemImage: "square.and.arrow.up")`. The rule
applies to every insertion from the gallery, Add and a drop alike (R-TOOL-004.C8, R-TOOL-005.C5), and
the editor opens the field after any insertion into the mockup it shows. The gallery holds no rule of
its own: `sampleCall` is in the core, `firstText` and `setText` in the session (A-WEB-5.K2). The field
is an `<input>` in the editor's shadow root (`part="text-field"`), drawn above the outlines with the
rendered element's font; its keys stay in it, so the designer's Delete and the editor's Esc and Enter
do not act on the selection while typing.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-003, R-TOOL-004 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
