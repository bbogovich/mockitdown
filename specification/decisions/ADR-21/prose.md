**Context.** SRC-12#s13 wants the same printing rules in both variants, checked by conformance cases,
and SRC-12#s16 says Python runs the same cases "once it implements" the edit API. ADR-18 makes the Python
variant the reference for everything both variants do.

**Decision.** Only TypeScript edits code structurally, for now. The rules it follows are kept as
language-neutral cases (source, operation, expected text), so they are specified once and a Python
implementation can adopt them unchanged.

**Consequences.** The editing core is built in one language; nothing in the Python variant changes for
it, except the edit-mode rendering, which is a rendering change (ADR-22).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-001, R-EDIT-002, R-EDIT-003 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.
