---
id: TC-1
title: Sample arguments and inline edit
verifies: [C1, C2, C3, C5]
---

Browser test on `pages/designer.html`: Add on `Button` inserts `Button("Label")` and opens a focused
field with the text selected; typing `Save` and Enter gives `Button("Save")`; undo restores
`Button("Label")` and a second undo removes the button; Add on `List` inserts its sample call without
the sample's rows; Esc keeps the sample text.

As built (#31): `typescript/tests/browser/new-element.spec.mjs` (IT-59) opens the hand-written
`tests/browser/fixtures/new-element-sample.mkdesign` (base pack, a `VStack` holding `Text("Sign in")`)
in the designer and selects the stack. Add on `Button` inserts `Button("Label")`, the base pack's
sample; the field `.mkd-editor__field` holds `Label`, is focused with characters 0 to 5 selected and
sits over the new button's element; typing `Save` and Enter closes it and gives `Button("Save")`, the
code changes being exactly the insertion's and then the text's, with the button still selected. Add
on `List` gives `List()` and opens no field. Add on `Text` opens `Content`; typing then Esc closes it,
keeps `Text("Content")` and adds no change; Add on `Toggle`, typing `Wi-Fi` and a click into the
gallery's search field commits `Toggle("Wi-Fi")`. With `Hello` typed into the field of a new
`Text`, a host's `session.insert('Button("Go")', …)` commits `Text("Hello")` and opens the field
again on `Go`; replacing the code as text without the button closes the field with nothing committed. There is no undo yet (R-EDIT-007): the undo step is
checked as a change of its own. The expected code was written by hand from the fixture and
`shared/reference/base.json`.
