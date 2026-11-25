---
title: "Features: web components and design tools"
def_version: 0.5.0
status: draft
updated: 2026-11-25
page_id: FEAT.3
---

# Features: web components and design tools

mockitdown has two variants built from one repository: the Python library that renders mockups in
Markdown sites, and a TypeScript library of web components (`mockitdown-…`) that renders and edits
mockups inside web applications. Both read the same language and the same packs, kept once in the
repository's shared assets (SRC-8). Authoring and documentation-site rendering are on
[Features: authoring](authoring.md) and [Features: rendering and integration](rendering.md).

### F-16 — Shared language and packs for the Python and web variants

**Requires:** F-10

**Problem.** The web components were to be a separate project, but they need the same CSS and the same packs as the Python library; two copies would drift apart (SRC-8).

**Change.** The repository becomes the home of both variants: `python/` (the existing library), `typescript/` (the web components) and `shared/` (what both publish). A shared set of reference mockups keeps the two renderers producing the same markup.

**F-16.UC-1 — Change a pack once for both variants**

**Actor:** pack author.

1. A pack author edits a pack's stylesheet and definition in `shared/packs/`.
2. The author runs the Python and the TypeScript test suites.

**Outcome:** both the Markdown sites and the web components render the changed pack, and the reference mockups still match between variants.

### F-17 — Mockups embedded in web pages

**Requires:** F-16

**Problem.** Mockups written for documentation also need to appear in web applications, notably online design tools (SRC-8).

**Change.** A `<mockitdown-mockup>` element renders the code it carries. The request named a CDATA child; in an HTML document the parser turns CDATA into a comment that ends at the first `>`, so the developer chose a `<script type="text/mockitdown">` child instead (SRC-8#clar-script):

```html
<mockitdown-mockup pack="fluent" device="desktop">
  <script type="text/mockitdown">
    VStack { Text("Hello").font(.title); Button("OK") }
  </script>
</mockitdown-mockup>
```

**F-17.UC-1 — Show a mockup in a web application**

**Actor:** web developer.

1. The developer adds the mockitdown package to the page.
2. The developer writes a `mockitdown-mockup` element with a `pack` attribute and a `<script type="text/mockitdown">` child holding the mockup code.
3. The page loads.

**Outcome:** the mockup appears in place, styled after the chosen framework, exactly as the same code renders in a Markdown site.

### F-18 — Web pack gallery test page

**Requires:** F-17

**Problem.** The Python variant has the example site and its Reference section to show every pack; the web components need an equivalent that also serves as their end-to-end test (SRC-8).

**Change.** A test page in `typescript/` lists the packs on the left and shows the selected pack's elements and complete design patterns on the right, all as `mockitdown-mockup` components. The browser test suite (Playwright, SRC-8#clar-deps) drives the same page.

**Meaningful samples (SRC-9).** Generic samples (`Picker("Label")` without options, a lone `Tab`)
said nothing about the element. Packs can name a sample per element; the gallery lays out variants
so each is seen whole; multi-platform packs show an example application per platform.

**F-18.UC-1 — Review a pack in the browser**

**Actor:** developer or reviewer.

1. The reviewer starts the development server and opens the gallery page.
2. The reviewer selects a pack in the side panel.

**Outcome:** the main area shows every element of that pack and complete design patterns in its style, each rendered by the web component.

**F-18.UC-2 — Review a multi-platform pack across phone, tablet and desktop**

**Actor:** designer or reviewer.

1. The reviewer opens the pack gallery and selects SwiftUI.
2. The reviewer scrolls past the element cards to the examples.

**Outcome:** each element card shows a meaningful sample and its variants without overlap; the
examples show an iPhone app, an iPad app and a Mac app with its menu bar.

### F-19 — Visual mockup editing components

**Requires:** F-17

**Problem.** Writing mockups as code suits developers, not designers. Figma is the most popular web tool, but Axure is the better model here: the element hierarchy must be easy to navigate to insert, remove and edit elements (SRC-8).

**Change.** Design-tool components — gallery, outline, inspector, editable view and code view — that a web application composes into an editor. The outline is the primary means of selection, because a click on nested elements is ambiguous; a click narrows the search by selecting the innermost element there. The components are defined now and built after the developer reviews the designer design document (SRC-8#clar-design).

**F-19.UC-1 — Build a screen visually**

**Actor:** UX designer.

1. The designer selects a vertical stack in the outline.
2. The gallery narrows to the elements allowed inside it; the designer presses Add on a text field.
3. The designer clicks the new field in the view, which selects it in the outline, and changes its placeholder in the inspector.
4. The designer undoes the change.

**Outcome:** the screen shows the new field with its original placeholder; the code view shows the matching mockitdown code.

### F-20 — Infinite canvas of named mockups

**Requires:** F-19

**Problem.** One page of a design often holds several mockups, and tools that build design and specification projects (SpecItOut) must place each one where it belongs (SRC-8).

**Change.** An infinite canvas that zooms and pans, holding named mockups. The name is the key importing tools use.

**F-20.UC-1 — Lay out a flow of screens**

**Actor:** UX designer.

1. The designer adds three mockups to the canvas and names them `Sign in`, `Inbox` and `Message`.
2. The designer zooms out to fit all three, then zooms into `Inbox` and edits it.
3. The designer saves the canvas document.

**Outcome:** the document holds the three named mockups with their positions and code, ready for a SpecItOut tool to import each by name.
