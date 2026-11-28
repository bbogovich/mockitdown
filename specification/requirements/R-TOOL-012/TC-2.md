---
id: TC-2
title: Moving and placing
verifies: [C1, C2, C8, C9]
---

Browser test (`frames.spec.mjs`, IT-70) on `pages/designer.html` with three phone mockups (393 units
wide): dragging `Message`'s label by (13, 21) px at 100 % moves it from (0, 1200) to the grid's
(16, 1224); by (473, -3) to Inbox's left edge 485 (4 units away; the grid would give 488); with Alt by
(5, 3) freely to (490, 1227); the mockup's `x` and `y` and the frame's position follow; a click without
a drag moves nothing; three undos give back each position. `session.newMockup()` with Inbox active adds
`Mockup 1` at (958, 0), 80 units right of Inbox, the rightmost frame of its row, and the Mockups list
marks only that row with the warning.
