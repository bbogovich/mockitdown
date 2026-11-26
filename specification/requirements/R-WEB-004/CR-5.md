---
id: R-WEB-004.CR-5
target: R-WEB-004
kind: clarification
version: 0.8.14
date: 2026-11-25
issue: 16
summary: "as built: the design patterns live in the Examples tab (C3); an index entry's device and chrome take precedence over the pack's defaults (C9, C14) (#16)"
from: 6a911f4e9141
to: f0f9ce1532cf
---

## Clauses

@ C3 edit
~ [-Below-]{+The+} [-the-]{+Examples+} [-elements-]{+tab+} [-the main area-]{+(C16)+} MUST show the design patterns of `shared/patterns/` rendered in the selected pack: at least sign-in form, list and detail, settings, dashboard with charts, data table with toolbar and filters, and wizard or multi-step form.
@ C9 edit
~ The gallery MUST render each element sample with `device="fit"`, and each design pattern with the {+device and chrome its index entry names (C14), else with the +}selected pack's default device and chrome.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -7,3 +7,3 @@
 vocabulary, each as a card with the element's sample and, when the pack has variants for it, the
-variants sample. The design patterns follow (sign-in form, list and detail, settings, dashboard with
+variants sample. The Examples tab shows the design patterns (sign-in form, list and detail, settings, dashboard with
 charts, data table with toolbar and filters, wizard): ordinary mockitdown sources without an
@@ -21 +21,6 @@
 **Tabs (SRC-10).** Elements and examples are separate tabs so the examples are one click away; six complex layouts join the six simple patterns.
+The tab list stays under the top bar while a tab scrolls, and the name filter belongs to the Elements tab. A pack change is a
+history entry (Back returns to the previous pack); a tab change replaces the current entry. The complex layouts (mail
+client, admin console, kanban board, chat, product page, calendar) are desktop layouts: their index entries name
+`device: "desktop"`, so the phone-first packs (`swiftui`, `android`) show them in their desktop form rather than squeezed
+onto a phone.
```
