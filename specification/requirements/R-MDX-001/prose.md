Zensical reads `mkdocs.yml` and runs Python-Markdown extensions and superfences fences, but not
MkDocs plugins (ADR-3). Everything the prototype's plugin did — configuration, CSS, strict
failure — therefore moves into the extension and the fence. The [Site integration guide](site-guide.md)
has the complete configuration.
