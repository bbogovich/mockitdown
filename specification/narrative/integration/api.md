---
title: "Library API"
spec_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: API.1
---

# Library API

The Python API shared by the fence, the CLI and other tools, and the package's dependencies and platform.

<!-- slot: reqs -->

## Example

```python
from pathlib import Path
from mockitdown import RenderOptions, render, stylesheet

opts = RenderOptions(device="phone", appearance="both", imports={"": ["docs/mockups"]})
result = render(Path("checkout.mockitdown").read_text(), opts)
for d in result.diagnostics:
    print(d)                       # "error [unknown] at line 3:5: …"
page = f"<style>{stylesheet(result.packs)}</style>{result.html}"
```

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
| 0.12.0 | 2026-11-27 | `imports` replaces `import_paths` in the example (ADR-24) |
