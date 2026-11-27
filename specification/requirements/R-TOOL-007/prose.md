The properties panel of SRC-13#p1.c5 (SRC-12#s7). Its controls are generated from the typed parameter
data (R-PACK-017), so a new pack needs no inspector code, and it borrows the field style of the MockItOut
inspector: a small grey label above a full-width input (SRC-12#s15).

Edits apply as the designer types, debounced, and a burst of typing is one undo step. An invalid value is
never written: a value the control rejects, or one whose rendering would add a diagnostic at the node,
stays red with the message until corrected.
