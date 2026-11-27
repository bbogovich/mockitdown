---
id: TC-1
title: Import map flags
verifies: [C1, C2, C3]
---

`mockitdown render screens/a.mockitdown -I acme/=vendor/acme/ -I lib` in a temporary tree resolves `import "acme/cards"` from `vendor/acme/` and `import "kpi"` from `screens/` then `lib/` (C1, C2, C3); `-I acme/=x -I acme/=y` tries `x` then `y`; the old long option `--import-path` is rejected by argparse. Automated in `python/tests/test_cli.py`.
