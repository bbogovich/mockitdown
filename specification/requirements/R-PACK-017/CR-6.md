---
id: R-PACK-017.CR-6
target: R-PACK-017
kind: correction
version: 0.13.12
date: 2026-11-28
issue: 33
summary: "as built (#33): the role table's reads lists became the keys of typed params maps (top-level params for the common labels); parameterTypes and modifierTypes; a label an element's types names is understood"
from: 91eaa20c3a80
to: d06e1a7c5f68
---

## Clauses

@ C1 replace
- Each rule of `roles.json` MUST carry `params`, an object mapping every labelled argument its role understands (R-EVAL-004.C7) to a type.
+ `roles.json` MUST carry `params` at its top level, an object mapping each label every role reads through the common element markup to a type, and each of its rules MUST carry `params`, an object mapping each other label its role reads (R-EVAL-004.C8) to a type, without repeating a common label.
@ C6 replace
- The TypeScript core MUST export `parameterTypes(pack, element)`, the element's role `params` with its own `types` applied, and `modifierTypes()`, the vocabulary's `modifiers`.
+ The TypeScript core MUST export `parameterTypes(pack, element)`, taking a pack id or a loaded pack, which returns the common `params`, then the element's role `params`, then its own `types`, the common ones alone for an element the pack does not define, and `modifierTypes()`, the vocabulary's `modifiers`, each type in its object form (`{"type": "bool"}`).
@ C9 insert after C8
+ If no role rules are loaded or the pack is unknown, then `parameterTypes` MUST throw a `MockitdownError`.

## Files

```diff
--- a/TC-1.md
+++ b/TC-1.md
@@ -8,2 +8,6 @@
 types; every rendered modifier of the vocabulary has a group and argument types; every pack's `types`
-is valid; the labels each role understands (R-EVAL-004.C8) all have a type.
+is valid and `params` stays a list of names; the labels each role reads (R-EVAL-004.C8) all have a
+type, being the keys of its `params`, which `test_unknown_labels.py` holds against what the Python
+renderer looks up. The Python suite also runs each check on hand-written bad data (an unknown type, a rule
+without `params`, an enum without values, an array without items, a repeated common label, a modifier
+without an entry or with an unknown group) and expects the hand-written error list (C8).
--- a/TC-2.md
+++ b/TC-2.md
@@ -3,6 +3,9 @@
 title: Lookups and no rendering change
-verifies: [C4, C6, C7]
+verifies: [C4, C6, C7, C9]
 ---
 
-`node:test`: the cases of V1 and `modifierTypes().padding.group === "layout"`; both conformance suites
-pass with the types loaded.
+`node:test` (`typescript/tests/unit/types.test.ts`, IT-61): the cases of V1 and `modifierTypes().padding.group
+=== "layout"`, each type in its object form; an application pack element whose `types` overrides and adds
+to its role's (`variant` still the enum of its declared variants, `params` still a list of names); the
+common params alone for an element the pack does not define; a `MockitdownError` for an unknown pack (C9).
+Both conformance suites pass with the types loaded. Expected values written by hand from the shared files.
--- a/prose.md
+++ b/prose.md
@@ -2,11 +2,31 @@
 element definitions need no annotation each; a pack adds `types` only for an element whose parameters
-differ from its role's. `params` keeps its meaning — the names of the positional arguments — so nothing
-that reads it changes.
+differ from its role's, and a label it types that way is understood by the element's calls
+(R-EVAL-004.C7). `params` in `pack.json` keeps its meaning — the names of the positional arguments — so
+nothing that reads it changes.
+
+As built (#33), the typed maps replaced the `reads` lists of R-EVAL-004.C8: the labels a role reads are
+the keys of its `params`, those every role reads the keys of the table's top-level `params`. Each type
+was chosen from what the renderer does with the label: `value` is a number for a slider, a progress bar
+or a rating and text for a text field; `rows` is a number for a text field and an array of arrays for a
+table. An `enum` names its values only where the renderer knows a fixed set (`orientation`,
+`titleDisplayMode`, a button's `role`); the rest of the common markup (`size`, `state`, `severity`, …)
+is `text`, its values differing from pack to pack. `variant` is `text` in the table, and
+`parameterTypes` makes it an `enum` of the element's declared variants (C4).
 
 ```json
-"button": {
-  "category": "content", "accepts": [], "attach": "child",
-  "params": { "label": "text", "role": { "type": "enum", "values": ["cancel", "destructive"] },
-              "systemImage": "icon", "disabled": "bool" }
+"params": {"color": "color", "disabled": "bool", "orientation": {"type": "enum", "values": ["horizontal", "vertical"]}, …},
+"roles": {
+  "button": {"title": "button", "category": "content", "accepts": ["text", "label", "icon", "image", …], "attach": "child",
+             "params": {"label": "text", "role": {"type": "enum", "values": ["cancel", "destructive"]}, "systemImage": "icon", "loading": "bool", …}}
 }
+```
+
+The modifiers are grouped as the renderer's stylesheet builder groups them: `layout` (padding, frame,
+offset, position, aspect ratio, …), `typography`, `colour` (colour and shape: fills, strokes, borders,
+corner radius, clip shape, shadow, opacity), `presentation` (alert, sheet, popover, overlay, …),
+`annotations` (callouts, pointers, marquees, highlights, taps) and `other` (identity, navigation titles,
+search, shortcuts, toolbars). An argument without a label is positional:
+
+```json
+"padding": {"group": "layout", "args": [{"label": null, "type": {"type": "enum", "values": ["all", "horizontal", "vertical", "top", "bottom", "leading", "trailing"]}}, {"label": null, "type": "number"}]}
 ```
```
