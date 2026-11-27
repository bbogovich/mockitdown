---
id: TC-1
title: Library names, qualified and ambiguous references
verifies: [C1, C2, C3, C4, C5, C6, C7, C8]
---

With registered or temporary files `acme/cards` (`Card`, `Row`, and `Panel` whose body calls `Card()`), `contoso/cards` (`Card`), `@vendor/kit` (`Chip`), `my-lib/x` (`Tag`) and `acme/more` (`Badge`, importing `contoso/cards`):

1. `acme.Card()` and `contoso.Card()` render their own bodies; `vendor.Chip()` works (C1, C4); `import "contoso/cards" as Co` makes `Co.Card()` work and `contoso.Card()` an `unknown` error of C4 (C1).
2. `Card()` alone reports the C6 message naming `acme, contoso` in load order; `Row()` resolves to acme's (C5); `acme.Panel()` uses acme's `Card` inside its body (C5).
3. `acme.Nope()` reports C4's error; `import "my-lib/x"` warns as C2 says and `Tag()` still works.
4. Importing `acme/more` makes contoso's `Card` belong to `contoso`, not `acme` (C3); `acme/cards` and `acme/more` form one library `acme` (C7).
5. The screen's used components list `acme.Card` for the qualified call (C8).

Automated in the Python tests and the TypeScript unit tests with the same sources; one conformance case covers 1 and 2.
