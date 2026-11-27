---
id: TC-2
title: The mockitdown-library element
verifies: [C8, C9]
---

Browser test (Chromium): a page with `<mockitdown-library name="cards">` holding a `<script type="text/mockitdown">` that declares `Pill`, followed by a `mockitdown-mockup` importing `#cards`, renders the pill; the library element renders nothing, and with the attribute `source` renders a code listing; a mockup element placed before the library element reports the C4 error of R-IMP-008. A unit test calls the TypeScript `render` with `libraries` (C9).
