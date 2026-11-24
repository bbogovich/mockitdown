**Problem.** The prototype needed a MkDocs plugin (SRC-3); Zensical, the successor the project
moves to, does not run MkDocs plugins.

**Change.** mockitdown plugs in at the Markdown layer that every one of these tools shares: a
Python-Markdown extension for configuration and CSS, and a `pymdownx.superfences` custom fence for
the blocks.
