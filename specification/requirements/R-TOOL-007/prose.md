The properties panel of SRC-13#p1.c5 (SRC-12#s7). Its controls are generated from the typed parameter
data (R-PACK-017), so a new pack needs no inspector code, and it borrows the field style of the MockItOut
inspector: a small grey label above a full-width input (SRC-12#s15).

Edits apply as the designer types, debounced, and a burst of typing is one undo step. An invalid value is
never written: a value the control rejects, or one whose rendering would add a diagnostic at the node,
stays red with the message until corrected.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-003, R-EDIT-007, R-PACK-017 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.
