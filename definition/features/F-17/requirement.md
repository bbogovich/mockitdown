---
id: F-17
title: Mockups embedded in web pages
status: active
version: 0.10.0
rev: 2
page: FEAT.3
slot: features
order: 2
hash: 656547104525
family: web
source: [SRC-8, SRC-18]
requires: [F-16]
---

G1: Web applications need to show mockitdown mockups inside their own pages without a documentation build.
C1: A web component `mockitdown-mockup` renders one mockup in place in an HTML page.
C2: The mockup's code is the component's only child, a `<script type="text/mockitdown">` element, so the browser does not parse it as markup.
C3: The code is the same language as the Markdown fence, with the same options (pack, device, appearance, title) and the same import mechanisms for packs and reusable components.
C4: The component re-renders when its code or its options change.
C5: Diagnostics are shown in place of the mockup and reported to the page, as the Markdown variant reports them to the build.
C6: The TypeScript variant is published as an NPM package with no runtime dependencies and no server part.
AC1: A page that loads the package and contains a `mockitdown-mockup` with a script child shows the rendered mockup in the chosen pack's style.
AC2: Code containing `<`, `>` and `&` renders exactly as the same code in a Markdown fence.
AC3: Changing the script's text or an option attribute updates the rendered mockup.
AC4: An invalid mockup shows its diagnostics in place and does not break the rest of the page.
AC5: All tags of the TypeScript variant begin with `mockitdown-`.
C7: Each release of the TypeScript variant is also published on the project's GitHub releases page as the packaged library (the NPM package archive), so that a project can install a released build without a package registry.
AC6: A project installs the library from the archive attached to a GitHub release and renders a `mockitdown-mockup` with it.
