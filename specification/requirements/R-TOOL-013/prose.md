One mockup at a time is editable (SRC-12#s10, SRC-15#p1.c2): it is the one the outline, the gallery and
the inspector act on. The others render as plain previews, which keeps large canvases fast. New,
duplicate and delete are session commands, so a host's Mockup menu can offer them (SRC-16 D39).

As built (#43): a copy goes where a new mockup would go if the copied mockup were active, so duplicating
the active mockup places the copy exactly as `newMockup` would, and the copy becomes active. Deleting the
active mockup hands the activity to its neighbour in document order, so that a run of deletes walks
through the document; the active mockup moves on before the `change` is told, so no component reads the
removed one. Deleting the last mockup leaves none active and sends no `active` notification (as undoing
the first mockup of an empty document does); the outline, the inspector and the editor redraw on the
`change` of kind `mockups` instead.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-TOOL-002, R-TOOL-012 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
