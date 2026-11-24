---
title: Problem, users and scope
def_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: OV.1
---

# Problem, users and scope

## The problem

Specifications describe screens, but the pictures of those screens live elsewhere: in design tools,
as screenshots, or as hand-drawn wireframes. They are reviewed separately from the requirements,
they drift when requirements change, and they rarely look like the framework the product is built
with — so reviewers judge a sketch, not the screen users will get.

The MockItOut prototype (SRC-3) showed that a text notation inside Markdown, rendered by the
documentation build, closes that gap. It used its own notation, three "kits" and a MkDocs plugin.
**mockitdown** is its production successor (SRC-2): the notation becomes SwiftUI syntax, the kits
become data-driven design packs for seven frameworks, and the integration moves to the Markdown
layer so it works under Zensical, which the project's documentation now uses.

## Who it serves

| User | Needs | Main features |
|---|---|---|
| **Specification author** (product owner, analyst) | Illustrate requirements with screens kept in the same file; cite parts of a screen | F-1, F-2, F-6, F-12 |
| **Designer** | Show a realistic screen in the target framework, in light and dark, on the right device | F-3, F-5, F-8, F-9, F-10 |
| **Developer** | Read mockups as code they already know; paste real SwiftUI; check mockups in CI | F-2, F-12, F-13 |
| **Documentation-site maintainer** | Add mockups to a MkDocs or Zensical site by configuration; share components; add a corporate design system | F-4, F-7, F-11 |
| **Pack author** | Add or refine a framework's look without touching the renderer | F-3, F-7 |
| **mockitdown maintainers** | A demo of every framework that is also an end-to-end test | F-14 |

## Scope

In scope: one visual state per mockup, written declaratively; rendering to static HTML and CSS at
build time; packs for the neutral wireframe, SwiftUI, Fluent (WinUI 3), Material UI, Angular
Material, SAPUI5 (Fiori), Bootstrap and shadcn/ui; light and dark appearance; device frames and
chrome; images and icons; custom components and libraries; site-defined packs; a command-line
tool; an example site.

Out of scope:

- **Interactive prototypes.** Mockups do not respond to clicks; actions and state changes in the
  source are ignored. A flow is shown as several mockups.
- **Pixel-exact framework rendering.** Packs imitate the framework's design language with CSS;
  they do not run the framework, so details can differ from the real components.
- **Executing Swift.** The notation is a declarative subset; functions, initialisers and
  arbitrary Swift are not supported.
- **A visual designer.** The prototype's designer application is not part of this project.
- **Image output.** The prototype's SVG renderer is retired; mockups render as HTML only.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
