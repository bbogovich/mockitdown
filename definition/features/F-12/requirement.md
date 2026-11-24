---
id: F-12
title: Diagnostics and strict builds
status: active
version: 0.2.0
rev: 0
page: FEAT.2
slot: features
order: 5
family: rendering
source: [SRC-3]
hash: a8e4b882df54
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
