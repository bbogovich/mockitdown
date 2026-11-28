---
requirement: R-PACK-016
title: Role rules
status: implemented
version: 0.13.9
date: 2026-11-28
issue: 30
---

# R-PACK-016 — Role rules

<!-- written by `vio-docs ledger record`; never edit -->

| Version | Date | Status | Issue | Change in the code | Pages |
|---|---|---|---|---|---|
| 0.13.9 | 2026-11-28 | implemented | #30 | holdsChildren(pack, name) (C16) | [Role rules](../narrative/architecture/roles.md) |
| 0.13.7 | 2026-11-28 | implemented | #28 | shared/language/roles.json: one rule per render role (90, title, category, accepts, attach) and root.accepts, after SRC-12#s6.3; sapui5 ObjectPageLayout narrows to section; typescript/src/core/roles.ts canContain(pack, parent, child) and allowedChildren(pack, parent) with reason sentences, unknown roles, loaded through loadAssets (SharedAssets.roles, node and URL loaders); ElementDef.rules; RENDER_ROLES; test_roles.py and roles.test.ts (TC-1, TC-2), IT-56 | [Role rules](../narrative/architecture/roles.md), [TypeScript core](../narrative/architecture/typescript.md), [Pack authoring guide](../narrative/pack-authoring.md), [Testing](../narrative/testing.md) |
