---
id: F-19
title: Visual mockup editing components
status: active
version: 0.9.0
rev: 2
page: FEAT.3
slot: features
order: 4
hash: bd50bf7ae25d
family: design-tools
source: [SRC-8, SRC-12, SRC-13]
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
C11: The design-tool components share one design session holding the design document, the active mockup, the selection and the edit history; a component joins a session by being placed in the composite designer or by being given the session by its host.
C12: A composite designer component hosts the design tools in a default layout — toolbar, outline with gallery, editable view, properties and status bar — whose panels can be resized and collapsed, and any of which the host can replace with its own.
C13: The composite designer opens a design document given to it and, on request, returns that document with every edit applied.
C14: The composite designer has three modes: Design (the editable view with outline, gallery and inspector), Preview (the mockups read-only, exactly as the mockup element renders them, in light, dark or both appearances) and Code (the active mockup's code, with the outline and inspector still live).
C15: The components report to their host, through events, every selection, every change with the text edits it made, every insertion, every rename and every change of diagnostics.
C16: A diagnostics list shows the active mockup's diagnostics; choosing one selects the element it names or reveals its place in the code.
C17: Several sibling elements can be selected together for the commands that act on a selection.
C18: The status bar shows the diagnostic count and the path from the root to the selection, any part of which selects that ancestor in one step.
AC6: A host opens a design document in the composite designer, deletes an element, receives exactly one change notification with the text edits, and gets back the same document with that edit applied and nothing else changed.
AC7: Choosing a diagnostic in the diagnostics list selects the element it names.
AC8: In Preview mode the mockups cannot be edited and look exactly as the mockup element renders them.
C19: The design tools offer these commands on the selection: delete, duplicate, cut, copy and paste with the clipboard holding mockitdown text, move up and down among siblings, wrap in a container, unwrap a container, convert to another element of the same role, and extract a component.
C20: Every command is one undo step, and undo and redo restore the selection as it was before and after the command.
C21: One burst of typing in a field forms one undo step.
C22: The commands are offered to the host too, so that it can show them in its own menus.
AC9: Each command of C19 can be undone and redone, and after undo the selection is the one before the command.
AC10: Elements copied from the design tools paste into a Markdown fence as mockitdown code that renders them.
