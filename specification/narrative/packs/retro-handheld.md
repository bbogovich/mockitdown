---
title: "Retro and handheld packs"
spec_version: 0.11.0
status: draft
updated: 2026-11-27
page_id: PACK.5
---

# Retro and handheld packs

Packs requested after the first retro set (R-PACK-008.C7): the Amiga Workbench, Windows 1.0 in its
default colours, a fuller Apple IIgs GS/OS, four further systems from the GUI timeline, and four
handhelds for the Mobile group (F-3.C10 to C14, SRC-18#packs, SRC-18#mobile). Each requirement names
the pack's identity, its group and place, its device and chrome, its colours, its own elements and the
look a reader must recognise.

Every pack here also satisfies the general pack rules: it extends `base`, declares import modules, light
and dark tokens and a default device (R-PACK-008.C2), scopes its CSS (R-PACK-007), declares samples for
elements whose generic sample would say nothing (R-PACK-013.C4), has a conformance case (R-REPO-004.C2),
gets a Reference page and a gallery entry generated from its definition (R-PACK-012) and reuses the
shared stylesheet rules instead of copying them (R-PACK-018). The colours given are the targets; a pack
may add tokens for further parts.

**Choosing the further retro systems.** From the GUI timeline (SRC-18#refs) four systems were chosen
whose look is distinct from every shipped pack and recognisable at a glance: Atari ST GEM (1985, green
desktop, white windows with patterned title bars), GEOS on the Commodore 64 (1986, 320 × 200, a
cartoon-like monochrome desktop with its own menu style), Acorn RISC OS 3 (1992, the icon bar along the
bottom, textured grey windows with cream title bars, the three-button mouse's pop-up menus) and BeOS R5
(1995/2000, yellow tab title bars sized to their title). OS/2 Warp 4, DeskMate, DESQview/X and Visi On
were left out: the first three resemble packs already shipped, and Visi On is mostly text.

**The Amiga version.** Workbench 1.3 (1988) is chosen over 2.x/3.x: its blue, white, black and orange
palette is what people remember as "the Amiga", while the grey, bevelled Workbench 2 and 3 look close to
the shipped Windows 95, NeXTSTEP and CDE packs.

<!-- slot: reqs -->

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.11.0 | 2026-11-27 | Page created (SRC-18) |
