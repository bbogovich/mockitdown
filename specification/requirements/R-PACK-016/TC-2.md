---
id: TC-2
title: canContain and allowedChildren
verifies: [C5, C6, C7, C8, C10]
---

`node:test`: the cases of V1; `allowedChildren("base", "HStack")` lists `Toggle` and not `TabView`,
with `TabView` under its reason; an `unknown` parent accepts all. Python: the package holds `roles.json`
and every conformance case's diagnostics are unchanged.
