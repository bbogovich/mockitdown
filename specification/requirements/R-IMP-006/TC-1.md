---
id: TC-1
title: Module imports load no file
verifies: [C1, C2]
---

Python unit tests `python/tests/test_imports.py` `ModuleImportTests`, with `Charts.mockitdown`,
`Kpi.mockitdown` and `Fluent.mockitdown` beside the block: `import Charts` neither loads the file nor
warns; `import Kpi` warns `import Kpi names no known pack` (code `pack`) and does not load the file, so
its struct is unknown; `import Fluent` selects the Fluent pack (C1, V1). `import "Kpi"` loads the file
(C2).
