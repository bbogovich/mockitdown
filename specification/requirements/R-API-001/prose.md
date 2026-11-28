`render` is the one entry point the fence, the CLI and other tools share.

`source` and `options` are positional, so that every render option can be given as a keyword
override, `source=True` included (found while writing TC-1, #56).
