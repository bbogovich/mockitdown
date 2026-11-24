---
id: UC-1
title: Fix a typo reported by the build
---

**Actor:** specification author. **Precondition:** strict mode is on in CI.

1. The author writes `Buton("Save")`.
2. CI builds the site.

**Outcome:** the build fails with `error [unknown] at line 3:5: 'Buton' is not an element of pack …`;
locally, the page shows the same message above the figure and a `Buton` placeholder.
