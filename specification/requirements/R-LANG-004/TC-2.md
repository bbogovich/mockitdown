---
id: TC-2
title: Optional view properties
verifies: [C6]
---

`@ViewBuilder var toolbar: (some View)?`, `var footer: some View?` and `var x: Content?` are view-typed and optional; `var t: String?` is neither. Automated in the parser tests of both variants.
