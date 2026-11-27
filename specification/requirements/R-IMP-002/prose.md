Resolution against the importing file first lets libraries import their neighbours with short
relative paths; the import map makes libraries available to every page under a namespace, the way
TypeScript's `paths` or a browser import map does:

```yaml
imports:
  "": docs/mockups                 # import "kpi"         → docs/mockups/kpi.mockitdown
  shared/: docs/mockups/shared/      # import "shared/kpi"  → docs/mockups/shared/kpi.mockitdown
  acme/: [vendor/acme/, "https://example.com/acme/"]   # local copy first, then the vendor's URL
```

The longest matching key wins and never falls back to a shorter one, so a namespace cannot be
shadowed by a file of the same name under the root.

**Known gap.** As for assets (R-ASSET-002), a fenced block in a Markdown page has no known file in
a site build, so a block's own bare imports are resolved through the import map only, and `./` imports report
that no importing file is known.
