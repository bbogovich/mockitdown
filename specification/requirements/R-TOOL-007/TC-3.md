---
id: TC-3
title: Mockup tab and Edit in code
verifies: [C10, C11]
---

`node:test` (`tests/unit/inspect.test.ts`) and a browser test (`tests/browser/inspector.spec.mjs`,
IT-63): with nothing selected the Mockup tab shows the mockup's name and its options with the inherited
values; changing the device changes the mockup's `options.device` as one `options` change, a height of 0
or an unknown device is refused, and each option edit is undone on its own. Edit in code (C11): `code-sync.test.ts`
(IT-67) finds `editInCode` the span of a `ForEach` (27-64) and of `Text(n)` (a code-only value, 53-60) and
null for `Text("Welcome back")`; `sync.spec.mjs` (IT-67) clicks a derived `ForEach` row, then Edit in
code, and finds the designer in Code mode with the ForEach's span (220-269) selected, and no Edit in code
for `Text("Inbox")`.
