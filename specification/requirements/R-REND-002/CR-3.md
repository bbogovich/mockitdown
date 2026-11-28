---
id: R-REND-002.CR-3
target: R-REND-002
kind: correction
version: 0.12.10
date: 2026-11-27
issue: 59
summary: "as built: C1 names the roles with another root (icon, table, tab, tablerow, toolbaritem) and tablecolumn; TC-1 verifies C1-C5 against the role catalogue (#59)"
from: 589c7b4b39e0
to: 56521e8e4623
---

## Clauses

@ C1 edit
~ The renderer MUST render every view through its element's render role, and every role MUST produce a root element with the class [-`mkd-<role>`.-]{+`mkd-<role>`, except the roles the role catalogue gives another root (`icon`, `table`, `tab` outside a `TabView`, `tablerow`, `toolbaritem`) and `tablecolumn`, which draws nothing of its own.+}

## Files

```diff
--- /dev/null
+++ b/TC-1.md
@@ -0,0 +1,14 @@
+---
+id: TC-1
+title: Role roots, components, parts, classes and the role catalogue
+verifies: [C1, C2, C3, C4, C5]
+---
+
+Python unit tests `python/tests/test_markup.py` `RoleMarkupTests`: every `base` element renders a root of class `mkd-<role>` (or the root the
+role catalogue names for `icon`, `table`, `tab`, `tablerow`, `toolbaritem`; `tablecolumn` draws none) with `data-el`
+as written (C1, C2); a struct's body root carries `data-component` (C2); `Button("Save")` renders
+`span.mkd-button[data-el=Button][role=button]` with `mkd-button__label` in every shipped pack, and a toggle, a slider
+and a card emit the same part classes in base, SwiftUI, Fluent, Material UI and Windows 95 (C3, V1); `.class(…)`
+classes follow the role class (C4); the renderer's roles are exactly the catalogue's, `base` maps the catalogue's
+elements to each, and every part class the conformance corpus contains is listed for its role in
+`python/tests/fixtures/role-catalogue.json`, the copy of the catalogue's table (C5).
--- a/prose.md
+++ b/prose.md
@@ -6 +6,3 @@
 **Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.
+
+A few roles keep another root class (the role catalogue lists them): `icon` uses `mkd-symbol` because `mkd-icon` is every glyph's `svg`, and a table's root is the wrapper that scrolls it.
```
