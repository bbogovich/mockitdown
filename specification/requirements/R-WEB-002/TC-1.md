---
id: TC-1
title: Script child with markup characters
verifies: [C2]
---

Automated by `typescript/tests/browser/mockup.spec.ts`: code with `Text("a < b && c > d")` renders the text verbatim and the HTML equals the conformance output.
