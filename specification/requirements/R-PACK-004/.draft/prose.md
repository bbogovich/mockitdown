The element definition is the whole mapping from a framework's component to mockitdown's markup:
`"InfoBar": {"role": "alert", "params": ["title"], "defaults": {"variant": "infobar"}}` makes
Fluent's `InfoBar("Saved")` render through the shared `alert` role, restyled by the Fluent CSS.

Checked at 0.10.1 after M-PACK-2.F7 and F8 (`rules`, `types`; R-PACK-016.C5, R-PACK-017.C3): both are optional and read only by the design tools, so C1 to C5 and the contract test are unchanged; C2 lists the keys that rendering uses.
