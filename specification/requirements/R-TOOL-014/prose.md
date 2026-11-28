Optional named rectangles behind groups of mockups (SRC-12#s10), for example "Onboarding flow", which a
Markdown export can turn into headings. The canvas's own state — zoom, position, active mockup — is part
of the document, so a designer reopens it where they left off.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-005, R-TOOL-013 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.

**As built (#44).** The rules are in `mockitdown/design` (`design/sections.ts`) and the session; the
canvas only draws sections and forwards drags and renames. A section is addressed by its index in the
document's `sections`, since names need not be unique. The view is written by the designer's `toJSON()`
only when it differs from the one the document opened with, which is what keeps an opened and unedited
document byte-identical when written back.

**Adding and deleting sections (SRC-21#answers).** A section is chosen by clicking its label, and the
designer's menus offer New Section (around the active mockup, named in the inline field) and Delete
Section (the current one). Deleting a section removes only the rectangle: the mockups it enclosed stay
where they are, so a section added and deleted again leaves the document unchanged.
