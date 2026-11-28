---
id: R-EDIT-006.CR-6
target: R-EDIT-006
kind: revision
version: 0.13.6
date: 2026-11-28
issue: 27
summary: "as built (#27): C8 the designer dispatches once per notification, also for a change made through a component outside it that joined its session; C19 session.delete(), the command behind Delete in the designer; TC-1 covers delete; TC-2 names the designer.spec.mjs test"
from: 55cbf964dde1
to: 20ad3e29e5b2
---

## Clauses

@ C8 edit
~ Inside a `mockitdown-designer`, only the designer element MUST dispatch these [-events;-]{+events, once per notification of its session, also for a change made through a component outside it that joined its session;+} a component used on its own MUST dispatch those of its own session.
@ C19 insert after C18
+ `session.delete()` MUST remove the selected nodes (R-EDIT-002.C6) as one change, then make the selection the statement after the last of them in their body that is not removed, else the one before it, else their parent view node, else nothing, notifying one `change` and then one `select`, and MUST be refused, changing and notifying nothing, when nothing is selected or the removal is refused.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,3 +3,3 @@
 title: Session notifications
-verifies: [C1, C2, C3, C4, C5, C6, C9, C10, C12, C13, C14, C15, C16, C17, C18]
+verifies: [C1, C2, C3, C4, C5, C6, C9, C10, C12, C13, C14, C15, C16, C17, C18, C19]
 ---
@@ -15,2 +15,2 @@
 `hover` notify their kinds and clear the selection; `setOptions` and `moveMockup` notify `options` and
-`move` with no edits; an unsubscribed listener hears nothing more; diagnostics follow `check` with the mockup's pack; `DESIGN_EVENTS` maps `select`, `change`, `insert`, `rename` and `diagnostics` to their event names.
+`move` with no edits; an unsubscribed listener hears nothing more; diagnostics follow `check` with the mockup's pack; `DESIGN_EVENTS` maps `select`, `change`, `insert`, `rename` and `diagnostics` to their event names. `delete` ("delete removes the selection as one change…") over a VStack holding a Text, an HStack of two Texts and a Text: deleting the HStack gives one `change` then one `select` of the last Text (the next sibling), deleting the last Text selects the HStack (the previous sibling), deleting both Texts of the HStack leaves its braces and selects it (the parent), deleting the only top-level node selects nothing, and a delete with nothing selected is refused and notifies nothing; the expected codes and selections were written by hand.
--- a/TC-2.md
+++ b/TC-2.md
@@ -6,5 +6,9 @@
 
-Browser test (Chromium) on `pages/designer.html`: a listener on `document` receives each of
-`mockitdown-select`, `mockitdown-change` and `mockitdown-insert` once per action, from the designer
-element, with the notification's detail; a `mockitdown-outline` placed outside the designer with its
-`session` set joins that session and dispatches the events of a selection made in it.
+Browser test (Chromium, `typescript/tests/browser/designer.spec.mjs`, "R-EDIT-006 TC-2: DOM events") on
+`pages/designer.html`: a listener on `document` receives one `mockitdown-select` for a row chosen in the
+designer's outline, then one `mockitdown-change` and one `mockitdown-insert` for an insert applied to the
+designer's session, each from the designer element with the notification's detail; a
+`mockitdown-outline` placed outside the designer with its `session` set to the designer's joins that
+session, and a selection made in it reaches the listener once, from the designer, the outline itself
+dispatching nothing. The test of R-TOOL-003.TC-2 adds a `mockitdown-outline` in the designer's `outline`
+slot, which joins the designer's session (C11).
--- a/prose.md
+++ b/prose.md
@@ -27,2 +27,3 @@
 session.setCode("Inbox", typed);                  // change, then diagnostics if they changed
+session.select([id]); session.delete();           // change, then select: the next sibling, else previous, else parent
 off();
@@ -30,2 +31,6 @@
 ```
+
+`delete` is the command behind Delete and Backspace in the composite designer (R-TOOL-003.C11). It
+picks the node to select next itself, so that the host hears one `change` and then one `select`, rather
+than a `select` that empties the selection followed by another that fills it.
 
```
