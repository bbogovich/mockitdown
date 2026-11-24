Resolution against the importing file first lets libraries import their neighbours with short
relative paths; the site's import directories make libraries available to every page.

**Known gap.** As for assets (R-ASSET-002), a fenced block in a Markdown page has no known file in
a site build, so a block's own relative imports are resolved through `import_paths` only.
