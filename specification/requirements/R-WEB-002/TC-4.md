---
id: TC-4
title: Edit attribute
verifies: [C13]
---

Browser test (`mockup.spec.mjs`): a mockup element with `edit` holds, in its shadow root, the HTML that
`render` returns with `edit: true` for the same code; removing the attribute re-renders without any
`data-mkd-node`.
