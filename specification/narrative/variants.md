---
title: "Variants, repository layout and shared assets"
spec_version: 0.6.0
status: draft
updated: 2026-11-25
page_id: REPO.1
---

# Variants, repository layout and shared assets

mockitdown ships two variants from one repository (F-16, ADR-17): the Python library (`python/`) and
the TypeScript web components (`typescript/`). Everything both publish — the packs, the page
stylesheet, the icon glyphs, images, the reference samples and patterns, and the conformance corpus —
lives once in `shared/`.

```text
mockitdown/
├── python/        pyproject.toml, src/mockitdown/, tests/, examples/site/, tools/
├── typescript/    package.json, tsconfig.json, src/, tests/, pages/, scripts/
├── shared/        packs/<id>/pack.{json,css}, css/page.css, icons/icons.json, images/,
│                  patterns/*.mockitdown, reference/<pack>.json, conformance/
├── .github/workflows/
└── README.md · LICENSE · CLAUDE.md · HANDOFF.md
```

<!-- slot: reqs -->
