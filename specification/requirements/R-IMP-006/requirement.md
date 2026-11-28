---
id: R-IMP-006
title: Module imports are not file imports
status: active
version: 0.12.8
rev: 1
page: IMP.1
slot: reqs
order: 6
source: [SRC-2]
realizes: [F-3, F-4]
constrained_by: [A-EVAL-1]
reverse_engineered: true
hash: 7e250d318881
refs: [R-EVAL-011, R-PACK-005]
---

C1: An `import` of an unquoted module name MUST only select a pack (R-PACK-005) or be accepted as neutral (R-EVAL-011.C3); it MUST NOT load a file.
C2: A component library MUST be imported with a quoted path.
V1: `import Charts` neither loads a file nor warns; `import Kpi` warns that it names no known pack.
