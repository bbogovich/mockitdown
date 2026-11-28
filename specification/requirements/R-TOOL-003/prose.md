The composite editor of SRC-13 (callouts 1–6) and the walking skeleton the MockItDown Designer's
desktop shell embeds first (SRC-16 D32–D34): open a document, select, delete, hear about the change, get
the document back.

```html
<mockitdown-designer id="d"></mockitdown-designer>
<script type="module">
  import "mockitdown";
  const d = document.getElementById("d");
  await d.open(await (await fetch("mail.mkdesign")).text());
  d.addEventListener("mockitdown-change", () => markEdited());
  save(JSON.stringify(d.toJSON(), null, 2));   // or writeDesign(d.toJSON())
</script>
```

`open` starts a new session over the document, so a host that kept `designer.session` reads it again
after each `open`; the components inside the designer re-join the new one. An invalid document rejects
with a `DesignOpenError` whose `errors` list every problem `readDesign` found:

```js
try { await d.open(text); } catch (e) { showProblems(e.errors); }   // [{path: "version", message: …}]
d.layout = { right: { collapsed: true } };                          // sizes and collapsed states, in part
d.mode = "preview";                                                  // design, preview or code
```

The gallery panel holds the gallery element (R-TOOL-004, #29); until the inspector exists, the properties
panel holds a placeholder. Delete is the
session's `delete` command (R-EDIT-006.C19), so the host hears one `mockitdown-change` and then one
`mockitdown-select` for the node selected after it.

A host can replace any panel through its slot, for example to put its own inspector on the right; the
replacement joins the designer's session. Code mode shows the active mockup in a read-only `mockitdown-code` (R-TOOL-008), with its diagnostics in the gutter; editing it comes with two-way editing (R-TOOL-009); undo
and the toolbar's Undo and Redo buttons with the history (R-EDIT-007); the zoom control with the canvas
(R-TOOL-011).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-TOOL-001, R-TOOL-002 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
