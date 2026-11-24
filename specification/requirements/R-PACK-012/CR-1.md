---
id: R-PACK-012.CR-1
target: R-PACK-012
kind: revision
version: 0.4.1
date: 2026-11-24
summary: Reference and Demo menus group framework packs as Desktop, Web, Mobile; header tabs stay visible at every width and while scrolling
from: 9ba4cd7d2e7f
to: 034bd6682950
---

## Clauses

@ C5 edit
~ The generator MUST also maintain the Reference block of the example site's navigation, between the `>>> reference nav` and `<<< reference nav` markers of `mkdocs.yml`, grouping packs as Core, [-Packs-]{+Desktop, Web, Mobile+} and [-Retro,-]{+Retro — a framework pack is Web when its default device uses browser chrome, Mobile when its default device is a phone or tablet, Desktop otherwise —+} the retro packs in chronological [-order.-]{+order; the Demo menu of the example site MUST use the same groups.+}
@ C8 insert after C5
+ Both sites MUST keep the header tabs visible at every window width and while scrolling (`navigation.tabs.sticky`, and a stylesheet overriding the theme's narrow-screen rule that moves the tabs into the drawer).

## Files

(none)
