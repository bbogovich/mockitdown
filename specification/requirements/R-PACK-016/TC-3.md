---
id: TC-3
title: The sapui5 object page holds its header and anchor bar
verifies: [C5, C9, C14, C17]
---

`typescript/tests/unit/roles.test.ts` "TC-3: …" (`node:test`), every expected value written by hand
before the code changes: in the sapui5 pack, `canContain("sapui5", "ObjectPageLayout", n)` is
`{ok: true}` for `ObjectPageSection` (section), `ObjectPageHeader` and `ObjectPageDynamicHeaderTitle`
(card) and `AnchorBar` (tab view), and is refused for `Text` and `Button` with the reason
`… cannot be placed inside ObjectPageLayout, which its pack limits to section, card and tab view`;
`allowedChildren("sapui5", "ObjectPageLayout")` lists exactly the pack's section, card and tabs
elements in the pack's order. The pack lists `"widens": ["tabs"]`; the shared test of C9 passes with it and fails, with a
hand-written message, for a fixture pack whose `rules.accepts` adds `tabs` without listing it in
`widens` (SRC-21#answers).
