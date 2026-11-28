---
id: R-PACK-019
title: Amiga Workbench pack
status: active
version: 0.12.12
rev: 5
page: PACK.5
slot: reqs
order: 1
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: c5a6a2b2fac8
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
---

C1: The pack `amiga` MUST imitate the Commodore Amiga Workbench 1.3 (Kickstart 1.3, 1988) in its 4-colour high-resolution screen, with `framework` naming it, `version` "Workbench 1.3", and the import modules `Amiga`, `Workbench`, `Intuition` and `AmigaOS`, listed in the Retro group after `win2` (R-PACK-008.C9).
C2: Its default device MUST be `desktop` at 640 × 512 points, showing the 640 × 256 PAL screen with each Amiga pixel one point wide and two points tall, with chrome `none` on `desktop` (the Workbench screen draws its own title bar) and `window` on `window`.
C3: Its light tokens MUST use the Workbench 1.3 palette: screen background blue `#0055AA`, white `#FFFFFF`, black `#000000` and orange `#FF8800`, and no other colour for window parts; text MUST be white or black in the Topaz-like fixed-pitch font (a `Topaz` font alias with monospace fallbacks); its dark tokens MAY repeat the light palette, since the Workbench had no dark mode.
C4: The Workbench screen MUST show the screen title bar across the top (white, with the title "Workbench release." and free memory in blue at its left, and the screen depth gadgets at its right) over the blue background.
C5: A window MUST have a white frame, a title bar holding the close gadget at its left, the title, and the two overlapping depth gadgets at its right; the active window's title bar MUST be filled and an inactive one's left unfilled; a sizing gadget MUST sit at the bottom right, and proportional scroll gadgets (a knob in a blue well) MUST sit on the right and bottom borders of windows that scroll.
C6: Menus MUST open from the screen title bar (the right mouse button's menu strip): menu titles in the title bar, items in black on white, the highlighted item inverted with orange, and keyboard shortcuts as the Amiga key glyph followed by a letter.
C7: System requesters MUST show their text over the window background with Retry and Cancel (or OK) as bordered boolean gadgets at the bottom corners; a `GuruMeditation` alert MUST draw the red-on-black rectangle with its red border and the two lines "Software Failure.  Press left mouse button to continue." and "Guru Meditation #…".
C8: The pack MUST define at least `WorkbenchScreen`, `ScreenTitleBar`, `Window` (variants `workbench`, `drawer`, `tool`), `DiskIcon`, `DrawerIcon`, `ToolIcon`, `ProjectIcon`, `TrashcanIcon`, `RamDiskIcon`, `Shell` (the CLI/AmigaShell window), `Requester`, `GuruMeditation`, `MenuStrip`, `MenuItem`, `BoolGadget`, `StringGadget`, `PropGadget`, `CheckMarkItem`, `Preferences` (the Preferences tool with its colour sliders) and `Clock`.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["amiga"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `amiga-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
