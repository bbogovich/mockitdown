---
id: R-REND-003.CR-2
target: R-REND-003
kind: correction
version: 0.12.10
date: 2026-11-27
issue: 59
summary: "as built: C1 copies side, withHandle, direction, labelPlacement, rowsPerPage and not appearance; TC-1 verifies C1-C5 (#59)"
from: 8a67673d4a1f
to: 901d5daafcc4
---

## Clauses

@ C1 replace
- The renderer MUST copy the view attributes `variant`, `size`, `color`, `shape`, `density`, `elevation`, `placement`, `orientation`, `emphasis`, `design`, `severity`, `kind`, `labelStyle`, `position`, `appearance` and `level` to `data-<name>` on the root element when the value is a string, number, boolean or enum value whose text matches `^[A-Za-z0-9_. -]{1,40}$`; booleans MUST be written `true`/`false` and enum values by name.
+ The renderer MUST copy the view attributes `variant`, `size`, `color`, `shape`, `density`, `elevation`, `placement`, `orientation`, `emphasis`, `design`, `severity`, `kind`, `labelStyle`, `position`, `level`, `side`, `withHandle`, `direction`, `labelPlacement` and `rowsPerPage` to `data-<name>` on the root element when the value is a string, number, boolean or enum value whose text matches `^[A-Za-z0-9_. -]{1,40}$`; booleans MUST be written `true`/`false` and enum values by name.

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,12 @@
+---
+id: TC-1
+title: Data attributes on the root
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_markup.py` `AttributeTests`: each attribute of C1 is copied to `data-<name>`; enum values by name,
+numbers, and booleans as `true`/`false`; `appearance` is not copied; values with `<`, `"`, `;`, more than 40
+characters or a list are dropped (C1); `state` gives `data-state`, `disabled` overrides it, `error` gives `error` only
+without a state and only when not false or empty (C2); `selected` (C3); `.id`, `.ref` with two arguments and `.help`
+(C4, V1); every data attribute the conformance corpus puts in a role's markup is common to every role or listed for
+that role in the catalogue copy (C5).
--- a/prose.md
+++ b/prose.md
@@ -5 +5,3 @@
 **Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.
+
+`appearance` is not copied: a view's `data-appearance` would match the stylesheet's frame selectors (`.mkd-frame[data-appearance="dark"]`), so a field's `.appearance(.outline)` reaches the markup as its variant instead.
```
