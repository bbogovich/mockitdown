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

**Role rules and typed parameters (SRC-12#s6.3, SRC-12#s7).** The design tools must know which
elements may go where and which control edits each argument. Both are kept once, as shared language
data by role, so that the 3132 element definitions need no annotation each: a pack element inherits
the rules and types of its role, and a pack overrides them only where one of its elements differs
(for example a Fiori object page that accepts only sections).

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

**Re-checked at definition 0.9.1.** F-16.CR-1 adds role rules and typed parameters as shared data that only the design tools read; embedding a mockup in a web page is unchanged.

**F-17.UC-1 — Show a mockup in a web application**

**Actor:** web developer.

1. The developer adds the mockitdown package to the page.
2. The developer writes a `mockitdown-mockup` element with a `pack` attribute and a `<script type="text/mockitdown">` child holding the mockup code.
3. The page loads.

**Outcome:** the mockup appears in place, styled after the chosen framework, exactly as the same code renders in a Markdown site.

### F-18 — Web pack gallery test page

**Requires:** F-17, F-3

**Problem.** The Python variant has the example site and its Reference section to show every pack; the web components need an equivalent that also serves as their end-to-end test (SRC-8).

**Change.** A test page in `typescript/` lists the packs on the left and shows the selected pack's elements and complete design patterns on the right, all as `mockitdown-mockup` components. The browser test suite (Playwright, SRC-8#clar-deps) drives the same page.

**Meaningful samples (SRC-9).** Generic samples (`Picker("Label")` without options, a lone `Tab`)
said nothing about the element. Packs can name a sample per element; the gallery lays out variants
so each is seen whole; multi-platform packs show an example application per platform.

**Tabs and complex examples (SRC-10).** A pack has around a hundred element cards; the examples sat below all of them. Elements and examples now have their own tabs, and the examples grow to complex application layouts.

**Show source (SRC-11).** Each design example can reveal the source that builds it — the pattern
file wrapped in the `mockitdown-mockup` tag with the attributes the gallery passes for the selected
pack — so a reader learns the vocabulary from working layouts and can copy one as a starting point.

**Published (SRC-17).** The gallery was reachable only through the development server, so a reader of
the published documentation could not find it. It is now published beside the documentation and the
demo site, with a Gallery header tab on both sites.

**Re-checked at definition 0.9.2.** The F-17 clarification changed no obligation; this feature is unaffected.

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

**F-18.UC-3 — Learn how a design example is built**

**Actor:** developer or designer writing their own mockup.

**Precondition:** the pack gallery is open on a pack's Examples tab.

1. The reader chooses an example (for example the mail client) and selects its Show source button.
2. The gallery shows, under the example, the source that produces it in the selected pack.
3. The reader copies the source, or reads how the regions are composed.
4. The reader selects the button again; the source is hidden.

**Outcome:** the reader has the exact source of the example as rendered in that pack, and the example
itself did not change while they looked.

**F-18.UC-4 — Open the gallery from the published documentation**

**Actor:** reader of the published documentation or the demo site.

1. The reader selects the Gallery header tab.
2. The published pack gallery opens on its first pack.
3. The reader selects another pack and its Examples tab.

**Outcome:** the reader sees every pack's elements and examples without installing anything or running a server.

### F-19 — Visual mockup editing components

**Requires:** F-17, F-21

**Problem.** Writing mockups as code suits developers, not designers. Figma is the most popular web tool, but Axure is the better model here: the element hierarchy must be easy to navigate to insert, remove and edit elements (SRC-8).

**Change.** Design-tool components — gallery, outline, inspector, editable view and code view — that a web application composes into an editor. The outline is the primary means of selection, because a click on nested elements is ambiguous; a click narrows the search by selecting the innermost element there. The components are defined now and built after the developer reviews the designer design document (SRC-8#clar-design).

**Design session, modes and host integration (SRC-12#s4, SRC-12#s5, SRC-12#s12, SRC-13).** The
components share one plain session object, so that the outline, the view, the gallery and the
inspector always agree on the document, the active mockup and the selection. A composite
`mockitdown-designer` lays them out as in the designer's main window (SRC-13: toolbar, outline,
gallery, canvas, properties, status bar) and is what a host such as the MockItDown Designer's
Electron shell embeds: it opens a design document, reports changes so the host can mark the document
edited and autosave it, and returns the document on request. Opening and saving files, menus and
windows stay with the host.

**Structural commands (SRC-12#s8).** Rearranging the hierarchy is the main editing activity, so the
selection has the commands of a structured editor: delete, duplicate, the clipboard as mockitdown text
(which also pastes into a Markdown fence), move, wrap, unwrap, convert and extract component. Each is
one undo step that restores the selection, and a host can put the same commands in its menus.

**Re-checked at definition 0.9.2.** The F-17 clarification changed no obligation; this feature is unaffected.

**F-19.UC-1 — Build a screen visually**

**Actor:** UX designer.

1. The designer selects a vertical stack in the outline.
2. The gallery narrows to the elements allowed inside it; the designer presses Add on a text field.
3. The designer clicks the new field in the view, which selects it in the outline, and changes its placeholder in the inspector.
4. The designer undoes the change.

**Outcome:** the screen shows the new field with its original placeholder; the code view shows the matching mockitdown code.

**F-19.UC-2 — Host a design document in the composite designer**

**Actor:** a host application (for example the MockItDown Designer's desktop shell).

**Precondition:** the host has read a design document from a file.

1. The host places the composite designer on its page and opens the document in it.
2. The designer selects an element and deletes it.
3. The host receives one change notification with the text edits and marks the document edited.
4. The host asks the composite designer for the document and writes it to the file.
5. The host later opens the written file in the composite designer again.

**Outcome:** the reopened document shows the mockups as they were saved, without the deleted element, and every
other part of the document, including keys the designer does not know, is unchanged.

### F-20 — Infinite canvas of named mockups

**Requires:** F-19

**Problem.** One page of a design often holds several mockups, and tools that build design and specification projects (SpecItOut) must place each one where it belongs (SRC-8).

**Change.** An infinite canvas that zooms and pans, holding named mockups. The name is the key importing tools use.

**The design document (SRC-12#s10, SRC-12#s11, SRC-15).** A design document is one readable,
diffable JSON file, `*.mkdesign`, with each mockup's code kept verbatim, so it can be read without the
designer and imported by SpecItOut tools mockup by mockup. A mockup may use its own pack, which keeps
side-by-side comparisons possible; the document names the default. One small module in the mockitdown
package reads and writes the format for the components and for a desktop shell alike; Markdown and
folder export stay in the shell for now.

**Re-checked at definition 0.9.1.** F-19.CR-3 only adds F-21 to its prerequisites; the canvas depends on the design tools as before.

**Re-checked at definition 0.9.2.** The F-17 clarification changed no obligation; this feature is unaffected.

**F-20.UC-1 — Lay out a flow of screens**

**Actor:** UX designer.

1. The designer adds three mockups to the canvas and names them `Sign in`, `Inbox` and `Message`.
2. The designer zooms out to fit all three, then zooms into `Inbox` and edits it.
3. The designer saves the canvas document.

**Outcome:** the document holds the three named mockups with their positions and code, ready for a SpecItOut tool to import each by name.

### F-21 — Structural editing of mockup source

**Requires:** F-16

**Problem.** The design-tool components (F-19) need to change a mockup's code as the designer works. Regenerating the whole mockup from a model would lose the author's formatting, comments, `let` bindings, `ForEach` loops and `if` conditions, and would turn every edit into a large diff (SRC-12#s9). The core also has no way to tell which call produced a rendered element (SRC-12#s13).

**Change.** The code stays the source of truth. The TypeScript core keeps the position of every node, gives each element call a node identity that survives edits, and offers structural edits that return minimal text changes plus the new tree. New code follows printing rules kept as language-neutral cases, so the Python variant can adopt the same rules later (ADR-21). An optional rendering made for editing tags each rendered element with its node and marks the derived ones, which is how a click in the view finds its source (SRC-12#s16 "Core tests").

**F-21.UC-1 — Apply a structural edit and receive the text edits**

**Actor:** a host application (for example a design-tool component).

**Precondition:** the host holds a mockup's code, formatted by its author, with comments and a `ForEach` loop.

1. The host parses the code and finds the node of a vertical stack.
2. The host asks the core to insert a `Toggle` as the stack's last child.
3. The core returns the text edits and the new tree.
4. The host applies the text edits to its copy of the code and renders it for editing.

**Outcome:** the code differs from the original only by the inserted line; the rendered toggle names its node; every
other call keeps its node identity.
