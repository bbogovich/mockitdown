---
id: TC-1
title: Menu bar and open menu
verifies: [C1, C3, C4, C5, C6, C7, C8, C10, C11, C12]
---

Python and TypeScript render tests (conformance cases added to `shared/conformance/`): V1 source; assert the bar's items in order, the clock text, the open File menu's rows, shortcut glyphs, separator, disabled row and submenu chevron. Also: the option's spellings (`true`, empty, a title, `@Screen`, fence, CLI, element attribute) and the app name's defaults; `CommandGroup` replacing, before and after; `.open()` on a menu and on a submenu (cascading); a title naming no menu and an unknown placement warn with code `chrome`.
