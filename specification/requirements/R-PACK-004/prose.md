The element definition is the whole mapping from a framework's component to mockitdown's markup:
`"InfoBar": {"role": "alert", "params": ["title"], "defaults": {"variant": "infobar"}}` makes
Fluent's `InfoBar("Saved")` render through the shared `alert` role, restyled by the Fluent CSS.
