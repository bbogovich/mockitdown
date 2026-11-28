---
id: R-PACK-023
title: GEOS pack
status: active
version: 0.12.12
rev: 5
page: PACK.5
slot: reqs
order: 5
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 0246ea2cc98a
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
---

C1: The pack `geos` MUST imitate GEOS on the Commodore 64 (GEOS 64 2.0, 1988, the deskTop), with `framework` naming it, `version` "GEOS 64 2.0", and the import modules `GEOS`, `GEOS64` and `deskTop`, listed in the Retro group after `win1` (R-PACK-008.C9).
C2: Its default device MUST be `desktop` at 640 × 400 points showing the 320 × 200 screen (each C64 pixel two points square) inside the C64's border, chrome `none`.
C3: Its light tokens MUST be black `#000000` on white `#FFFFFF` for the screen, a 50 % dither for the desktop pattern, and the C64 light blue `#7869C4` for the border around the screen; its dark tokens MUST be the inverted screen (white on black).
C4: The deskTop MUST show the horizontal menu bar in a box at the top left (geos, file, view, disk, select, page, options), the date and time at the top right, the disk notepad in the centre and the drive icons at the right edge.
C5: The disk notepad MUST be a page with a dog-eared lower-left corner for turning pages, the disk's name in its title bar with the close box at its right, up to eight file icons per page with names below, and the page number; the border area MUST run along the bottom of the screen, with the printer and the waste basket at its right.
C6: A dialog box MUST be a white box with a black border and a solid drop shadow at its bottom right, its buttons (OK, CANCEL, YES, NO, OPEN, DISK) drawn as rounded labelled boxes.
C7: Menus MUST open below their title as boxes with a black border and items separated by rules, the highlighted item inverted.
C8: The pack MUST define at least `DeskTop`, `MenuBar`, `MenuItem`, `Notepad`, `NotepadPage`, `FileIcon`, `DriveIcon`, `PrinterIcon`, `WasteBasket`, `BorderArea`, `DialogBox`, `IconButton`, `TextField`, `Clock` and `GeoPaintToolbox` (the geoPaint tool and pattern palettes).
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["geos"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `geos-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
