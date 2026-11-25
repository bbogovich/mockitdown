---
id: TC-1
title: Positional arguments take the parameter's alias
verifies: [C1, C3]
---

Python (`test_fit.py`) and TypeScript (`render.test.ts`): in `prime`, whose `Dialog` has the parameter `header` mapped to `title`, `Dialog("Edit")` and `Dialog(header: "Edit")` render the same HTML, a dialog titled Edit.
