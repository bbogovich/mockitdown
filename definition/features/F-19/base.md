---
id: F-19
title: Visual mockup editing components
status: active
version: 0.5.0
rev: 0
page: FEAT.3
slot: features
order: 4
hash: a06fed973721
family: design-tools
source: [SRC-8]
requires: [F-17]
---

G1: UX designers are not comfortable writing mockups as code, so they need to build and edit mockups in a familiar visual editor whose element hierarchy is easy to navigate.
C1: The TypeScript variant provides design-tool web components that a web application composes into a mockup editor: an element gallery, an outline, a property inspector and an editable mockup view.
C2: The gallery lists the elements of the mockup's packs, grouped by role, with a rendered preview of each.
C3: A gallery element is inserted by dragging it onto the view or the outline, or, when an element is selected, by an explicit add action that inserts it as that element's child.
C4: When an element is selected, the gallery offers only the elements that can be its children; for example a window or app frame cannot be inserted into a horizontal stack.
C5: The outline shows the mockup's element tree and is the primary means of selection; it supports expanding, collapsing, reordering by drag, deleting and duplicating.
C6: Clicking an element in the view selects the innermost element under the pointer in the outline and highlights it in the view; repeated clicks or a key move the selection to its parent.
C7: The property inspector shows the selected element's arguments, modifiers and identifier, edits them with controls matched to their types, and lists only values the pack allows.
C8: Every edit updates the mockup's code and its rendering together, and can be undone and redone.
C9: The code of the mockup being edited is the same language as the Markdown fence and can be viewed and edited as text; editing either side updates the other.
C10: The TypeScript project includes a designer test page that composes the design tools, for demonstration and automated tests.
AC1: Dragging a gallery element onto a container in the view or the outline inserts it there, and the code shows the new element.
AC2: With a horizontal stack selected, the gallery hides frame and window elements and the add action inserts the chosen element as the stack's last child.
AC3: Clicking a nested element selects it in the outline, expands its ancestors and highlights it in the view.
AC4: Changing a property in the inspector changes the code and the rendering, and undo restores both.
AC5: Text edited in the code view is reflected in the outline and the view, or its diagnostics are shown and the last valid tree is kept.
<!-- file: prose.md -->
**Problem.** Writing mockups as code suits developers, not designers. Figma is the most popular web tool, but Axure is the better model here: the element hierarchy must be easy to navigate to insert, remove and edit elements (SRC-8).

**Change.** Design-tool components — gallery, outline, inspector, editable view and code view — that a web application composes into an editor. The outline is the primary means of selection, because a click on nested elements is ambiguous; a click narrows the search by selecting the innermost element there. The components are defined now and built after the developer reviews the designer design document (SRC-8#clar-design).
<!-- file: usecases/UC-1.md -->
---
id: UC-1
title: Build a screen visually
---

**Actor:** UX designer.

1. The designer selects a vertical stack in the outline.
2. The gallery narrows to the elements allowed inside it; the designer presses Add on a text field.
3. The designer clicks the new field in the view, which selects it in the outline, and changes its placeholder in the inspector.
4. The designer undoes the change.

**Outcome:** the screen shows the new field with its original placeholder; the code view shows the matching mockitdown code.
