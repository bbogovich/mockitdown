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

A host can replace any panel through its slot, for example to put its own inspector on the right; the
replacement joins the designer's session. Code mode is specified with the code view (R-TOOL-009); undo
and the toolbar's Undo and Redo buttons with the history (R-EDIT-007); the zoom control with the canvas
(R-TOOL-011).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
