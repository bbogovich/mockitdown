---
id: R-EDIT-008.CR-6
target: R-EDIT-008
kind: revision
version: 0.14.0
date: 2026-11-28
issue: "#85"
summary: "SRC-21 answers (#85, #88, #90): the sapui5 ObjectPageLayout holds its header and AnchorBar; copies named <name>-copy; New Section and Delete Section"
from: 9dcee1f1692d
to: cb17bfd671c2
---

## Clauses

@ meta.source
- [SRC-12]
+ [SRC-12, SRC-21]
@ C2 edit
~ In a copy, each `.id("x")` MUST become [-`.id("x-<n>")`,-]{+`.id("x-copy")`, or `.id("x-copy-<n>")` when `x-copy` is used in the mockup,+} `<n>` being the smallest integer from 2 that makes the identifier [-unique in-]{+unique;+} the [-mockup.-]{+designer renames it afterwards.+}
@ C11 edit
~ In pasted views, each `.id("x")` that the mockup already uses MUST become [-`.id("x-<n>")`-]{+`.id("x-copy")` or `.id("x-copy-<n>")`+} as in C2, and an identifier the mockup does not use MUST be kept.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -8,8 +8,9 @@
 (`VStack { Text("Title"); Button("A").id("ok"); // the row; HStack { Text("Left").id("left") } }`),
-every expected code written by hand: a duplicate of the button gives `.id("ok-2")` directly after it,
-selected, and a second duplicate of the original `.id("ok-3")`; duplicating the title and the stack
-copies each after itself with the nested `left` becoming `left-2`; `copy` gives the stack with its
+every expected code written by hand: a duplicate of the button gives `.id("ok-copy")` directly after it,
+selected, and a second duplicate of the original `.id("ok-copy-2")`, a duplicate of
+the copy `.id("ok-copy-copy")`; duplicating the title and the stack
+copies each after itself with the nested `left` becoming `left-copy`; `copy` gives the stack with its
 comment at column 0; a cut of the button selects the stack, and its text pasted into the stack goes in
-as the last child with `ok` kept, after the title (a leaf) as `ok-2`, with nothing selected at the end
-of the top level as `ok-3`; several pasted views go after the last of several selected nodes; a paste
+as the last child with `ok` kept, after the title (a leaf) as `ok-copy`, with nothing selected at the end
+of the top level as `ok-copy-2`; several pasted views go after the last of several selected nodes; a paste
 of invalid text (`Button("A"`), of a `let`, of nothing and of a struct is refused with no step and no
--- a/prose.md
+++ b/prose.md
@@ -20,4 +20,4 @@
 a copy are renamed only where the mockup already uses them, so a duplicate always renames (`ok` →
-`ok-2`) and a paste after a cut keeps them; duplicating `ok-2` gives `ok-2-2`, by C2's letter, so the
-second duplicate of TC-1 is one of the original. Copied code keeps the comment lines above a node, as a
+`ok-copy`, then `ok-copy-2`) and a paste after a cut keeps them; duplicating `ok-copy` gives
+`ok-copy-copy`. The name only marks the copy: the designer renames it (SRC-21#answers). Copied code keeps the comment lines above a node, as a
 move carries them. A paste goes into the one selected node only when it is a container the drop rules
```
