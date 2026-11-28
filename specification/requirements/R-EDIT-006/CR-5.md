---
id: R-EDIT-006.CR-5
target: R-EDIT-006
kind: revision
version: 0.13.3
date: 2026-11-28
issue: 24
summary: "as built (#24): subscribe returns an unsubscribe function and requests that change nothing notify nothing (C4); siblings and unknown ids (C10); the active mockup (C12), apply refusals and the insert notification (C13), setCode (C14), hover (C15), setOptions and moveMockup (C16), diagnostics (C17), DESIGN_EVENTS (C18); TC-1 names its tests"
from: b3607039f4d2
to: 55cbf964dde1
---

## Clauses

@ C4 edit
~ `session.subscribe(listener)` MUST register a [-listener,-]{+listener and return a function that removes it,+} and the session MUST notify every listener once per state change with one of the kinds `select`, `hover`, `change`, `insert`, `rename`, `active` and `diagnostics` and its [-detail.-]{+detail, as one object `{kind, detail}`, and MUST NOT notify a request that changes nothing.+}
@ C10 replace
- `session.select(ids)` MUST refuse a list whose nodes are not siblings, and MUST replace the selection otherwise.
+ `session.select(ids)` MUST refuse a list whose nodes are not siblings, or that names an id the active mockup's tree does not have, and MUST replace the selection otherwise; siblings are the children of one view node, or the parentless nodes of the top level or of one struct.
@ C12 insert after C11
+ The active mockup of a new session MUST be the one the document's `view.active` names, else the first mockup, else none, and `session.setActive(name)` MUST make another mockup active, notifying `active` and clearing the selection and the hover.
@ C13 insert after C12
+ `session.apply(op)` MUST be refused, changing nothing and notifying nothing, when the operation is refused or the active mockup's code does not parse, and MUST notify `insert` with the inserted root node after the `change` of an `insert` operation, then `select` or `hover` when they lost a removed node.
@ C14 insert after C13
+ `session.setCode(mockup, code)` MUST replace a mockup's code with text and notify one `change` of kind `code` whose one edit replaces the part between the longest common prefix and suffix, and MUST re-parse from the last valid tree, so that nodes outside the changed text keep their ids.
@ C15 insert after C14
+ `session.hover(id)` MUST set the hovered node of the active mockup, or clear it with null, and MUST refuse an id its tree does not have.
@ C16 insert after C15
+ `session.setOptions(mockup, options)` and `session.moveMockup(mockup, x, y)` MUST replace a mockup's options and position and notify a `change` of kind `options` or `move` with no edits; a position that is not a finite number MUST be refused.
@ C17 insert after C16
+ A mockup's diagnostics MUST be those of `check` with its render options (R-EDIT-005.C9) over the session's `renderOptions`, when packs are loaded into the core, else its syntax diagnostics, and the session MUST notify `diagnostics` when they change after a change of the mockup.
@ C18 insert after C17
+ `mockitdown/design` MUST export `DESIGN_EVENTS`, the map from the notification kinds of C7 to their DOM event names.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -3,9 +3,14 @@
 title: Session notifications
-verifies: [C1, C2, C3, C4, C5, C6, C9, C10]
+verifies: [C1, C2, C3, C4, C5, C6, C9, C10, C12, C13, C14, C15, C16, C17, C18]
 ---
 
-`node:test`: a session over a two-mockup document; `apply` of an insert and of a remove each notify
-one `change` with `kind: "code"` and edits that, applied in turn to the original code, give the current
-code; the selection keeps a surviving node and drops a removed one; a syntax error in the code keeps the
-last valid tree and notifies `diagnostics`; `nodeFor` maps each ordinal of an edit-mode render of the
-mockup to a node of its tree; selecting two non-siblings is refused.
+`node:test` (`typescript/tests/unit/design-session.test.ts`): a session over a two-mockup document; `apply`
+of an insert and of a remove each notify one `change` with `kind: "code"` and edits that, applied in turn
+to the original code, give the current code, the insert followed by one `insert` naming the new node and
+its element; a move notifies one `change` for several edits; the selection keeps a surviving node and
+drops a removed one; a refused operation notifies nothing; a syntax error in the code keeps the last valid
+tree and notifies `diagnostics`, an operation is then refused, and fixed code keeps the untouched ids;
+`nodeFor` maps each ordinal of an edit-mode render of the mockup to a node of its tree; selecting two
+non-siblings or an unknown id is refused and the same selection notifies nothing; `setActive` and
+`hover` notify their kinds and clear the selection; `setOptions` and `moveMockup` notify `options` and
+`move` with no edits; an unsubscribed listener hears nothing more; diagnostics follow `check` with the mockup's pack; `DESIGN_EVENTS` maps `select`, `change`, `insert`, `rename` and `diagnostics` to their event names.
--- a/prose.md
+++ b/prose.md
@@ -18,2 +18,18 @@
 
+In Node, without any component, the session is used like this:
+
+```js
+import { DesignSession, readDesign, writeDesign } from "mockitdown/design";
+
+const session = new DesignSession(readDesign(text).document);
+const off = session.subscribe(({ kind, detail }) => console.log(kind, detail));
+session.apply({ op: "remove", nodes: ["n3"] });   // change {kind: "code", mockup, edits, code}
+session.setCode("Inbox", typed);                  // change, then diagnostics if they changed
+off();
+save(writeDesign(session.document));              // the live document, every change applied
+```
+
+Code typed as text keeps the last valid tree while it does not parse, and is re-parsed from that tree
+when it does again, so the nodes the typing did not touch keep their ids and the selection survives.
+
 Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
```
