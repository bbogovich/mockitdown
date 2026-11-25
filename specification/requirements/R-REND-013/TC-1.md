---
id: TC-1
title: No overlapping siblings
verifies: [C1, C2, C3]
---

Browser test over every pack's element samples and variants (gallery `renderAll`): for each row container, child bounding boxes pairwise do not intersect (1-pixel tolerance); repeated inside a `device=phone` frame.
