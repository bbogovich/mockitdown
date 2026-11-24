**Problem.** A mockup without images looks unfinished; relative image paths break when a page is
served under a different URL or when the HTML fragment is reused elsewhere.

**Change.** Image references are resolved when the site is built. Local images are inlined as
`data:` URIs; remote ones are linked; anything else is refused. Icons come from mockitdown's own
icon set, addressed by SF Symbols, Material, Fluent or SAP icon names.
