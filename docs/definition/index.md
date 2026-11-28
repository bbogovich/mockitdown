---
title: mockitdown Definition
def_version: 0.12.0
status: approved
updated: 2026-11-24
page_id: HOME
---

# mockitdown Definition

**mockitdown** lets a user-interface mockup be written inside a Markdown page, in a fenced code
block, using the syntax of SwiftUI view code — and renders it, when the documentation site is built,
as a realistic picture of the screen styled like the real UI framework the application uses
(SwiftUI, Fluent/WinUI 3, Material UI, Angular Material, SAPUI5, Bootstrap, shadcn/ui).

This definition says **what mockitdown is for, who it serves and what it does** — never how. It is
the input to the [specification](../specification/index.md), which states the behaviour precisely,
and the [implementation](../implementation/index.md), which explains the code.

## How to read it

| Page | What it holds |
|---|---|
| [Problem, users and scope](overview.md) | Why mockitdown exists, who uses it, what is out of scope |
| [Features: authoring](features/authoring.md) | F-1 – F-7: writing mockups — the fence, the notation, packs, components, assets, identifiers, site packs |
| [Features: rendering and integration](features/rendering.md) | F-8 – F-14: what the reader sees and how sites, tools and tests use it |
| [Sources](sources.md) | The request (SRC-2) and the prototype (SRC-3) the features come from |
| [Glossary](glossary.md) | The terms used across all three tiers |

Each feature states its goal (`G`), capabilities (`C`), acceptance criteria (`AC`) and use cases
(`F-n.UC-m`). Clauses are cited as `F-3.AC2`.

```mockitdown device="fit" title="A mockup, as this site renders it" caption="false"
VStack(alignment: .leading, spacing: 10) {
  Text("Release 2.4").font(.title3)
  Text("Adds **offline mode** and `sync` fixes.").foregroundStyle(.secondary)
  HStack {
    Toggle("Auto-update", isOn: true)
    Spacer()
    Button("Install").buttonStyle(.borderedProminent)
  }
}
.padding()
.frame(width: 380)
```

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Overview of the definition written |
| 0.1.0 | 2026-01-01 | Initialized |
