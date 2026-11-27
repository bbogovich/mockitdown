---
id: TC-2
title: No library, speed
verifies: [C8, C9]
---

`node:test` reads the compiled module graph of `mockitdown-code` and fails on an import outside the
package's core lexer; a browser timing of 50 keystrokes in a 1000-line source reports the median
re-colour time (warning above 16 ms).
