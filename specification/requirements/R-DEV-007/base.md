---
id: R-DEV-007
title: Additional chrome kinds
status: active
version: 0.3.0
rev: 0
page: REND.1
slot: reqs
order: 999
source: [SRC-5]
realizes: [F-10]
reverse_engineered: true
hash: 49cbc12bd4f9
---

C1: The chrome kinds MUST include, besides those of R-DEV-004, `gnome` (no title bar: a GNOME app draws its own header bar), `kde` (Breeze title bar), `win31` (Windows 3.1 caption with control-menu box and arrow buttons) and `window`.
C2: The `window` chrome MUST render a generic title bar with a leading group (close, menu buttons), the title, a trailing group (help, minimise, maximise, zoom, collapse, close buttons) and a bottom status strip (grow box), all controls hidden by default, so a pack can show and draw the controls its system had.
V1: A pack whose desktop chrome is `window` renders `.mkd-chrome--window` with its title.
<!-- file: prose.md -->
Retro systems each drew their own window frame; a generic frame whose parts a pack switches on avoids a chrome kind per system.
