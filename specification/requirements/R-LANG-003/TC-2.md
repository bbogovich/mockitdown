---
id: TC-2
title: File import aliases
verifies: [C8, C9]
---

`import "acme/cards" as Acme` parses as a file import with alias `Acme` (C8); `import SwiftUI as S` raises the syntax error of C9; `import "x" as 3` is a syntax error. Automated in the parser tests of both variants.
