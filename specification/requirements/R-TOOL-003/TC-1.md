---
id: TC-1
title: Open, select, delete, toJSON
verifies: [C1, C5, C6, C7, C11, C13, C14]
---

Browser test (`designer.spec.mjs`) on `pages/designer.html`: select the nested button; press Delete;
exactly one `mockitdown-change` arrives, its edits remove the button's lines; the card's next sibling or
the card is selected; `writeDesign(designer.toJSON())` equals the sample's text without those lines,
unknown keys and key order kept. `open` of a document with `version: 2` rejects and keeps the current
document.
