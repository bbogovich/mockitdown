---
id: F-19.CR-1
target: F-19
kind: additive
version: 0.9.0
date: 2026-11-26
summary: "design session, composite designer, modes, host events, diagnostics list, multi-select, breadcrumb: C11-C18, AC6-AC8, UC-2 (ING-1)"
from: a06fed973721
to: 487b9df2f6b2
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-12, SRC-13]
@ C11 insert after AC5
+ The design-tool components share one design session holding the design document, the active mockup, the selection and the edit history; a component joins a session by being placed in the composite designer or by being given the session by its host.
@ C12 insert after C11
+ A composite designer component hosts the design tools in a default layout — toolbar, outline with gallery, editable view, properties and status bar — whose panels can be resized and collapsed, and any of which the host can replace with its own.
@ C13 insert after C12
+ The composite designer opens a design document given to it and, on request, returns that document with every edit applied.
@ C14 insert after C13
+ The composite designer has three modes: Design (the editable view with outline, gallery and inspector), Preview (the mockups read-only, exactly as the mockup element renders them, in light, dark or both appearances) and Code (the active mockup's code, with the outline and inspector still live).
@ C15 insert after C14
+ The components report to their host, through events, every selection, every change with the text edits it made, every insertion, every rename and every change of diagnostics.
@ C16 insert after C15
+ A diagnostics list shows the active mockup's diagnostics; choosing one selects the element it names or reveals its place in the code.
@ C17 insert after C16
+ Several sibling elements can be selected together for the commands that act on a selection.
@ C18 insert after C17
+ The status bar shows the diagnostic count and the path from the root to the selection, any part of which selects that ancestor in one step.
@ AC6 insert after C18
+ A host opens a design document in the composite designer, deletes an element, receives exactly one change notification with the text edits, and gets back the same document with that edit applied and nothing else changed.
@ AC7 insert after AC6
+ Choosing a diagnostic in the diagnostics list selects the element it names.
@ AC8 insert after AC7
+ In Preview mode the mockups cannot be edited and look exactly as the mockup element renders them.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,10 @@
 **Change.** Design-tool components — gallery, outline, inspector, editable view and code view — that a web application composes into an editor. The outline is the primary means of selection, because a click on nested elements is ambiguous; a click narrows the search by selecting the innermost element there. The components are defined now and built after the developer reviews the designer design document (SRC-8#clar-design).
+
+**Design session, modes and host integration (SRC-12#s4, SRC-12#s5, SRC-12#s12, SRC-13).** The
+components share one plain session object, so that the outline, the view, the gallery and the
+inspector always agree on the document, the active mockup and the selection. A composite
+`mockitdown-designer` lays them out as in the designer's main window (SRC-13: toolbar, outline,
+gallery, canvas, properties, status bar) and is what a host such as the MockItDown Designer's
+Electron shell embeds: it opens a design document, reports changes so the host can mark the document
+edited and autosave it, and returns the document on request. Opening and saving files, menus and
+windows stay with the host.
--- /dev/null
+++ b/usecases/UC-2.md
@@ -0,0 +1,17 @@
+---
+id: UC-2
+title: Host a design document in the composite designer
+---
+
+**Actor:** a host application (for example the MockItDown Designer's desktop shell).
+
+**Precondition:** the host has read a design document from a file.
+
+1. The host places the composite designer on its page and opens the document in it.
+2. The designer selects an element and deletes it.
+3. The host receives one change notification with the text edits and marks the document edited.
+4. The host asks the composite designer for the document and writes it to the file.
+5. The host later opens the written file in the composite designer again.
+
+**Outcome:** the reopened document shows the mockups as they were saved, without the deleted element, and every
+other part of the document, including keys the designer does not know, is unchanged.
```
