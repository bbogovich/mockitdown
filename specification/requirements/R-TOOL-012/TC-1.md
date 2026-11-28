---
id: TC-1
title: Rename refused
verifies: [C3, C4, C5, C6, C7]
---

Browser test (`frames.spec.mjs`, IT-70) on `pages/designer.html` with mockups `Sign in`, `Inbox`,
`Message`: double-click `Message`'s label, type `Inbox`, Enter; the field stays open beside the refusal
"A mockup named “Inbox” already exists", the names are unchanged and no `mockitdown-rename` fires
(F-20.AC2); renaming to `inbox` succeeds (case-sensitive), closes the field, fires one
`mockitdown-rename` `{from: "Message", to: "inbox"}`, and Cmd/Ctrl+Z gives the old name back; Esc
cancels a rename.
