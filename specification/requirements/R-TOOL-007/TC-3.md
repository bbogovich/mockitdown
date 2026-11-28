---
id: TC-3
title: Mockup tab and Edit in code
verifies: [C10, C11]
---

`node:test` (`tests/unit/inspect.test.ts`) and a browser test (`tests/browser/inspector.spec.mjs`,
IT-63): with nothing selected the Mockup tab shows the mockup's name and its options with the inherited
values; changing the device changes the mockup's `options.device` as one `options` change, a height of 0
or an unknown device is refused, and each option edit is undone on its own. Edit in code (C11) on a
derived row, switching to Code mode with the node's span selected, is tested with the code view
(R-TOOL-008).
