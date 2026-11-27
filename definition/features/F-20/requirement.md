---
id: F-20
title: Infinite canvas of named mockups
status: active
version: 0.9.0
rev: 1
page: FEAT.3
slot: features
order: 5
hash: 0b45edc1cbe4
family: design-tools
source: [SRC-8, SRC-12, SRC-15]
requires: [F-19]
refs: [F-19]
---

G1: A design usually needs several screens side by side, and each must be identifiable when design and specification tools import it.
C1: The TypeScript variant provides an infinite canvas component that holds several mockups, each placed at a position on the canvas.
C2: The canvas can be zoomed and panned with the mouse, trackpad, keyboard and a zoom control, and can zoom to fit all mockups or the selected one.
C3: Every mockup on the canvas has a unique name, shown as its label and editable.
C4: The canvas reads and writes its mockups as a document that records each mockup's name, position, options and code, so that SpecItOut design and specification tools can import each mockup by name into the right place.
C5: The canvas works with the design tools of F-19: selecting a mockup makes it the one the outline, inspector and gallery act on.
AC1: A canvas with three mockups can be zoomed between 10 % and 400 % and panned in every direction, and the mockups stay crisp.
AC2: Two mockups cannot have the same name; renaming to a taken name is refused with a message.
AC3: Saving and reloading a canvas document restores every mockup's name, position, options and code.
AC4: Selecting a mockup on the canvas loads it into the outline and the inspector.
C6: The canvas document of C4 is one JSON file with the extension `.mkdesign`, holding a format name and version, the document name, the document defaults (among them the default pack), the component files it imports, optional sections, the named mockups (each with its name, position, options and code) and the view (zoom, position and active mockup).
C7: Each mockup may name its own pack; a mockup that names none uses the document's default pack.
C8: The document is written with its keys in a stable order and each mockup's code verbatim, and keys that a tool does not know are kept when it writes the document back.
C9: The canvas can hold optional named sections: rectangles drawn behind groups of mockups.
C10: The document is read, validated and written by a module of the mockitdown package that needs no browser, so that the composite designer and a desktop shell share one implementation; converting a document to or from Markdown or a folder of files is left to the host.
AC5: Opening a document of an unknown format or version, or one whose mockup has no code, is refused with a readable message naming the problem.
AC6: Opening a document that holds keys the tools do not know and writing it back yields the same document, its keys and their order included.
AC7: Saving and reloading a canvas also restores its sections and its view.
