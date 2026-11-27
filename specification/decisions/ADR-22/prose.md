**Context.** ADR-18.C1 says every rendering change is made in both variants with a conformance case,
and R-REPO-004.C3 says the Python renderer produces the expected HTML. The design tools need each rendered
element to name the call it came from.

**Decision.** Both renderers gain the option. What they write is a node's ordinal — its position among
the view nodes of the source — which both parsers compute identically; the session turns an ordinal into
its stable id after each parse (R-EDIT-006.C9).

**Consequences.** The cost is small (both renderers open role elements through one tag builder), there is
one rendering truth, and the corpus grows by a handful of edit-mode cases.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.
