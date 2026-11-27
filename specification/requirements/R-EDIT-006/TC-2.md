---
id: TC-2
title: DOM events
verifies: [C7, C8, C11]
---

Browser test (Chromium) on `pages/designer.html`: a listener on `document` receives each of
`mockitdown-select`, `mockitdown-change` and `mockitdown-insert` once per action, from the designer
element, with the notification's detail; a `mockitdown-outline` placed outside the designer with its
`session` set joins that session and dispatches the events of a selection made in it.
