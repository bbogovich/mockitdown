---
title: mockitdown Specification
spec_version: 0.1.0
status: draft
updated: 2026-11-24
page_id: HOME
---

# mockitdown Specification

This specification states **how mockitdown behaves**: the mockup language, how a block is evaluated,
the format of design packs, the HTML and CSS it produces, appearance and devices, images, icons and
component imports, the Markdown integration, the command line, the library API and diagnostics. It
realizes the features of the [definition](../definition/index.md) and is realized by the code on
`main`, explained in the [implementation](../implementation/index.md).

Most requirements were written from the production code (marked *reverse-engineered* in their
front matter); where the code departs from the intended behaviour, the requirement states the
intent and its prose records a **Known deviation**.

## How to read it

| Part | Pages |
|---|---|
| Orientation | [System overview](overview.md) — components, data flow, conformance |
| Language | [Syntax](language/syntax.md) (R-LANG) · [Semantics](language/semantics.md) (R-EVAL) · [Language reference](language/reference.md) (grammar, values, modifiers, live examples) |
| Packs | [Pack format](packs/format.md) (R-PACK) · [Pack catalogue](packs/catalogue.md) |
| Rendering | [Markup](rendering/markup.md) (R-REND) · [Role catalogue](rendering/roles.md) · [Markup and CSS contract](rendering/css-contract.md) · [Appearance and devices](rendering/appearance-devices.md) (R-APP, R-DEV) |
| Resources | [Assets and icons](assets.md) (R-ASSET) · [Component imports](imports.md) (R-IMP) |
| Integration | [Markdown extension and fence](integration/markdown.md) (R-MDX) · [Site integration guide](integration/site-guide.md) · [Command line](integration/cli.md) (R-CLI) · [Library API](integration/api.md) (R-API) |
| Quality | [Diagnostics](diagnostics.md) (R-DIAG) |
| Web variant | [Variants and shared assets](variants.md) (R-REPO) · [Web components](web/components.md) (R-WEB) · [Test pages and tests](web/test-pages.md) · [Editing core](web/editing.md) (R-EDIT) · [Design-tool components](web/design-tools.md) and [Canvas of named mockups](web/canvas.md) (R-TOOL) · [Role rules and typed parameters](packs/design-data.md) |
| Structure | [Core modules](architecture/core.md) · [Output and integration modules](architecture/output.md) (A-…) · [Model](model.md) (M-…) |
| Decisions | [Notation and rendering](decisions/notation-rendering.md) (ADR-1 – ADR-7) · [Integration and delivery](decisions/integration-delivery.md) (ADR-8 – ADR-14) · [Web variant and design tools](decisions/web-tools.md) (ADR-21, ADR-22) |
| History | [Traceability to the prototype](traceability.md) · [Change history](meta/change-history.md) |

**Conventions.** Requirements are `R-<AREA>-nnn`; each has numbered normative clauses `C1, C2, …`
(EARS form with RFC 2119 keywords) and verification clauses `V1, …`, and may have test cases
`TC-n`. Cite a clause as `R-EVAL-005.C4`. Architecture elements are `A-<AREA>-n`, model entities
`M-<AREA>-n`, decisions `ADR-n`. Clause labels are permanent.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.10.0 | 2026-11-26 | Web variant areas registered: R-EDIT (editing core), R-TOOL (design-tool components) (ING-1) |
| 0.2.0 | 2026-11-24 | First full specification, derived from the prototype and the production code |
| 0.1.0 | 2026-01-01 | Initialized |
