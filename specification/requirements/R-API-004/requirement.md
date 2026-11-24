---
id: R-API-004
title: Dependencies and platform
status: active
version: 0.2.0
rev: 0
page: API.1
slot: reqs
order: 4
source: [SRC-2]
realizes: [F-11, F-13]
constrained_by: [A-API-1]
decisions: [ADR-12]
reverse_engineered: true
hash: 905bb1ed3202
---

C1: The core package (language, evaluation, packs, rendering, stylesheets, assets, icons, CLI) MUST have no runtime dependencies outside the Python standard library.
C2: The Markdown integration MUST be an optional extra (`mockitdown[markdown]`) requiring `Markdown>=3.6,<4` and `pymdown-extensions>=10,<14`.
C3: mockitdown MUST run on Python 3.11 or later, on macOS, Windows and Linux.
C4: The package MUST include `page.css` and every built-in pack's `pack.json` and `pack.css` as package data, and MUST install the `mockitdown` console script.
C5: mockitdown MUST be distributed under the MIT licence.
V1: In a fresh virtual environment, `pip install mockitdown` installs no other package and `mockitdown render` works; `pip install mockitdown[markdown]` adds exactly Markdown and pymdown-extensions.
