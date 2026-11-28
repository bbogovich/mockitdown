---
title: The designer element
impl_version: 0.3.43
status: draft
updated: 2026-11-28
page_id: IMPL.DESIGNER
---

# The designer element

Realizes **A-WEB-5** (P1 for `mockitdown-designer` and `pages/designer.html`, K1, K2) and implements
**R-TOOL-003** (#27): `<mockitdown-designer>`, the composite designer that owns a design session and lays
out [the outline](outline.md), a gallery placeholder, [the editable view](editor.md), a properties
placeholder, a toolbar and a status bar. It finishes R-EDIT-006 C7, C8 and C11 (the designer's own event
dispatch, and components joining a designer's session) and adds the session's `delete` command
(R-EDIT-006.C19, see [Design documents and the design session](design.md)).

## Files

| File (`typescript/`) | What |
|---|---|
| `src/elements/designer.ts` | `DesignerElement`, `DESIGNER_TAG`, `DESIGNER_ATTRIBUTES` (`mode`, `import-base`, `asset-base`), `DESIGNER_MODES`, `DESIGNER_SLOTS`, `PREVIEW_APPEARANCES`, `DEFAULT_LAYOUT`, `PANEL_MIN` (120), `PANEL_MAX` (640), `designerMode(value)`, `DesignOpenError`, the `DesignerLayout` types |
| `src/design/session.ts` | `DesignSession.delete()`; `apply` and `delete` share `applyOp(op, select?)` |
| `src/core/syntax/edit.ts` | `bodySiblings(tree, node)`: the statements of the body a node stands in (used by `delete`) |
| `src/elements/define.ts` | `ELEMENT_TAGS` and `defineElements()` now include `mockitdown-designer`, defined before the editor and the outline |
| `scripts/serve.mjs` | serves `.mkdesign` as `application/json` |
| `pages/designer.html`, `pages/designer-sample.mkdesign` | "Designer element": the sample document (Sign in on mui/phone, Inbox on base/fit with a comment, a `let`, a `ForEach` and the button in a card in a list; unknown keys at the document and mockup levels) and an event log |
| `tests/browser/designer.spec.mjs`, `tests/browser/fixtures/designer-deleted.mkdesign` | IT-55 (Playwright); the hand-written document after the delete |

## Use

```html
<mockitdown-designer id="d" style="height: 40rem"></mockitdown-designer>
<script type="module">
  import { writeDesign } from "mockitdown/design";
  await d.open(text);                              // DesignOpenError with .errors when invalid
  d.addEventListener("mockitdown-change", (e) => markEdited(e.detail.edits));
  d.layout = { right: { collapsed: true } };
  d.mode = "preview";
  save(writeDesign(d.toJSON()));
</script>
```

## How it works

```mermaid
flowchart TD
  O["open(json) · document = …"] --> RD["readDesign(text)"]
  RD -- errors --> X["DesignOpenError (current session kept)"]
  RD -- document --> NS["new DesignSession(document)"]
  NS --> RJ["#rejoin: shadow editor/outline and package components inside read .session<br/>#giveSlotted: slotted elements get .session"]
  NS -- notifications --> N["#notified"]
  N --> ST["#drawState: name, pack, device, diagnostic count, breadcrumb, placeholder"]
  N --> PV["Preview: #drawPreviews (mockitdown-mockup per mockup)"]
  N --> EV["dispatch mockitdown-select, -change, -insert, -rename, -diagnostics"]
  K["keydown Delete/Backspace<br/>(path through a joined editor or outline)"] --> DEL["session.delete()"]
```

- **Shadow DOM** (C2, C4): a grid of toolbar, main and status rows. The main row's
  `grid-template-columns` is written from `layout`: `240px 5px minmax(0,1fr) 5px 260px`, the 5 px
  columns being the resizers (`role="separator"`). Each panel's default content sits inside its named
  `<slot>`, so a slotted element replaces it. The left column holds the `outline` slot (a
  `mockitdown-outline`) above the `gallery` slot (placeholder), the centre the `view` slot (a
  `mockitdown-editor`), the code `<pre>` and the preview pane, the right column the `inspector` slot
  (placeholder naming the selection).
- **Session** (C1, C5, R-EDIT-006.C11): the constructor makes a session over an empty document; `open`
  makes a new one per document. The editor and the outline find it themselves (`#designerSession`
  walks up through the shadow host); after `open` the designer reads `session` on each of them, which
  re-attaches them. Slotted elements are given it (`el.session = designer.session`) on `slotchange` and
  `open`, after `customElements.whenDefined` for an element not defined yet. Joined components never
  dispatch; the designer dispatches each notification of its session once (R-EDIT-006.C7, C8), so a
  change made through an outline outside the designer that was given its session is heard once too.
- **Delete** (C11): a `keydown` listener on the host sees Delete and Backspace from inside the shadow
  roots; when the composed path passes through an editor or outline on the designer's session (and not
  through a text field, and not in Preview), it calls `session.delete()`. The session picks the next
  selection with `bodySiblings` and applies the remove with it, so the host hears one `change` and one
  `select`.
- **Layout** (C3): pointer capture on a resizer; the size is clamped to 120–640 px. Left and Right on a
  focused resizer move it by 16 px. The toolbar's Outline and Properties buttons (`aria-pressed`) toggle
  `collapsed`. `layout` returns a copy; setting it merges the parts given.
- **Modes** (C8-C10, C15): `mode` reads the attribute through `designerMode` (unknown → `design`) and the
  setter writes the normalised value. Preview hides the side panels, the resizers, the toggles and the
  view, and builds one `<figure>` per mockup with a `mockitdown-mockup` carrying the fence options among
  `mockupOptions` as attributes and the code through its `code` property; a list of buttons beside them
  scrolls to a preview. The appearance toggle overrides `appearance` on every preview while a button is
  pressed (pressing it again restores each mockup's own). Leaving Preview removes the previews. Code
  mode shows the active mockup's code in a `<pre>` until the code view (R-TOOL-009) exists.
- **Toolbar and status** (C10, C12): `#drawState` after `active`, `select`, `change`, `diagnostics` and
  `rename`: the active mockup's name, `mockupPack`, its `device` option else `registry.get(pack).device`,
  `N diagnostics` from `session.diagnostics`, and one crumb button per view node from the top level to
  the first selected node.

## Debugging

- `npm run serve`, open `http://127.0.0.1:8173/pages/designer.html`. In the console:
  `designer.session.selection`, `designer.layout`, `writeDesign(designer.toJSON())` (import
  `/dist/design.js`); the page logs every event the designer dispatches.
- Two events per action: a component inside joined its own session instead of the designer's (it was
  upgraded before the designer existed and not re-joined); `designer.shadowRoot.querySelector("mockitdown-editor").session === designer.session`.
- Delete does nothing: the focus is not in the outline or the view, nothing is selected, the mode is
  Preview, or the mockup's code does not parse (`session.delete()` returns the refusal).
- Panel sizes look wrong: read `designer.layout` and the main grid's `gridTemplateColumns`.

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.3.43 | 2026-11-28 | Page written: `mockitdown-designer`, layout, slots, modes, Delete through `session.delete()`, the designer test page, IT-55 (#27) |
