---
id: TC-2
title: Typed attributes, booleans, the validator and fence errors
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_markdown_ext.py` `FenceAttributeTests`: `FENCE_OPTIONS` holds exactly the attributes and types of C1 but
`library` (TC-1), and a fence giving all of them renders without a fence error and applies them (C1, V1); `1`,
`true`, `yes`, `on` in any case turn `elements` on and `0`, `false`, `no`, `off`, `nope` and an empty value leave it
off (C2); the validator accepts unknown attributes and the block still renders as a mockup, not a code listing (C3);
`devise="phone"`, `width="wide"` and `appearance="dim"` each log one `fence` error naming the attribute, render an
error box above the figure and ignore the attribute (C4, V1); fence `pack`, `device` and `title` override
`default_pack`, `default_device` and `@Screen`'s pack, device and title, and `@Screen` overrides the site's
`default_device` (C5).
