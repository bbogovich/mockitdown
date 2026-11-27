---
id: F-12
title: Diagnostics and strict builds
status: active
version: 0.9.0
rev: 1
page: FEAT.2
slot: features
order: 5
family: rendering
source: [SRC-3, SRC-12]
hash: 2dc6c0fccd67
---

G1: Authors must learn quickly and precisely what is wrong with a mockup, and continuous integration must be able to refuse a broken one.
C1: Every problem is reported with its severity (error or warning), a message, and a location (line, column and file).
C2: A block with errors still renders as much as possible, with the problems shown above the figure and unknown elements drawn as labelled placeholders.
C3: Problems are written to the build log with the block they come from.
C4: In strict mode any error fails the site build.
C5: Warnings appear in the build log; showing them in the page is optional.
AC1: A misspelt element name produces an error naming the pack and the element, at its line and column, and a placeholder in the figure.
AC2: With strict mode on, a site containing that block fails to build.
AC3: A syntax error renders an error box in place of the figure.
C6: A labelled argument that the called element does not understand is reported as a warning naming the element and the label, instead of being dropped silently; both variants report it alike.
AC4: `Text("Hi", colour: .red)` produces a warning naming `Text` and `colour` in both variants, and the text still renders.
AC5: The shipped design patterns, the element samples and the example site render without such a warning.
