---
id: TC-1
title: Open, select, delete, toJSON
verifies: [C1, C5, C6, C7, C11, C13, C14]
---

Browser test (`typescript/tests/browser/designer.spec.mjs`, "TC-1") on `pages/designer.html`, which opens
`pages/designer-sample.mkdesign`: the designer owns a `DesignSession` that its outline and view share,
with the `view.active` mockup active, and writes the sample back unchanged; clicking the nested button and
pressing Delete gives exactly one `mockitdown-change`, from the designer, whose one edit removes the
button's line, and selects the button's previous sibling `Text("Quarterly report")` (the card has no
next one); `writeDesign(designer.toJSON())` equals the hand-written `fixtures/designer-deleted.mkdesign`,
the sample without that line, unknown keys and key order kept; Backspace in the outline then deletes the
text and selects the card. `open` of the document with `version: 2` rejects with a `DesignOpenError`
whose `errors` are `[{path: "version", message: "version must be 1, found 2"}]` and keeps the current
document; an object without `view` opens with its first mockup active; `document` is `toJSON()`, and
setting it to the sample's text opens it.
