---
id: TC-2
title: DOM events
verifies: [C7, C8, C11]
---

Browser test (Chromium, `typescript/tests/browser/designer.spec.mjs`, "R-EDIT-006 TC-2: DOM events") on
`pages/designer.html`: a listener on `document` receives one `mockitdown-select` for a row chosen in the
designer's outline, then one `mockitdown-change` and one `mockitdown-insert` for an insert applied to the
designer's session, each from the designer element with the notification's detail; a
`mockitdown-outline` placed outside the designer with its `session` set to the designer's joins that
session, and a selection made in it reaches the listener once, from the designer, the outline itself
dispatching nothing. The test of R-TOOL-003.TC-2 adds a `mockitdown-outline` in the designer's `outline`
slot, which joins the designer's session (C11).
