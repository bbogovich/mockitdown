---
id: UC-3
title: Combine two component libraries with overlapping names
---

**Actor:** documentation-site maintainer combining a vendor library and the product's own library.

1. The maintainer maps `acme/` to the vendor's library URL and `contoso/` to the product's directory.
2. An author imports both, `import "acme/cards"` and `import "contoso/cards"`; both declare `Card`.
3. The author writes `acme.Card(…)` and `contoso.Card(…)` (or imports one `as` a shorter name).

**Outcome:** each call renders its own library's `Card`; a plain `Card` is reported as ambiguous
rather than silently picking one.
