---
title: "Command line"
spec_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: CLI.1
---

# Command line

The `mockitdown` command.

<!-- slot: reqs -->

## Synopsis

```text
mockitdown render FILE [options] [--standalone] [-o OUT]   HTML fragment, or a full page
mockitdown check FILE… [options] [--json]                   diagnostics; exit 1 on any error
mockitdown css [--pack ID …] [-P DIR …] [--pretty] [-o OUT] the stylesheet (for css: none sites)
mockitdown packs [-P DIR …] [--json]                        the packs and their element counts
mockitdown elements PACK [-P DIR …] [--markdown]            one pack's element catalogue

options: --pack ID  --default-pack ID  --device NAME  --appearance light|dark|auto|both
         --width N  --height N  --chrome KIND  --title TEXT  --elements
         -I/--import-path DIR  -A/--asset-path DIR  -P/--pack-path DIR  --no-embed
```

Examples:

```sh
mockitdown render screens/checkout.mockitdown --device phone --appearance both --standalone -o checkout.html
mockitdown check docs/mockups/**/*.mockitdown -I docs/mockups --json
mockitdown css --pack swiftui --pack fluent -o docs/assets/mockitdown.css
mockitdown elements sapui5 --markdown > sapui5-elements.md
```

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
