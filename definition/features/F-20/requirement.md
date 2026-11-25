---
id: F-20
title: Infinite canvas of named mockups
status: active
version: 0.5.0
rev: 0
page: FEAT.3
slot: features
order: 5
hash: 0db357a007c3
family: design-tools
source: [SRC-8]
requires: [F-19]
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
