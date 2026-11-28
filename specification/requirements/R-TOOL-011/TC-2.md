---
id: TC-2
title: Crisp at 400 %
verifies: [C8]
---

Browser test (`canvas.spec.mjs`, IT-69): the Settings text at 200 % is twice and at 400 % four times
its 100 % height (±1 px); the canvas's world is scaled by 1, 2 and 1 and the frame's CSS `zoom` is 1, 1
and 4, so no transform scales above 2 (F-20.AC1); a screenshot of the text at 400 % matches, within a
mean channel difference of 8, the same mockup laid out alone at CSS `zoom` 4.
