---
id: R-PACK-022
title: Atari ST GEM pack
status: active
version: 0.12.6
rev: 3
page: PACK.5
slot: reqs
order: 4
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 4b1a4fc18508
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
---

C1: The pack `gem` MUST imitate the GEM Desktop of the Atari ST (TOS 1.0 to 1.04, 1985–1989) in medium resolution, with `framework` naming it, `version` "TOS 1.04", and the import modules `GEM`, `AtariST`, `TOS` and `GEMDesktop`, listed in the Retro group after `mac-classic` (R-PACK-008.C9).
C2: Its default device MUST be `desktop` at 640 × 400 points (the 640 × 200 medium-resolution screen, each pixel one point wide and two tall), chrome `none`.
C3: Its light tokens MUST use the ST's default medium-resolution palette: white `#FFFFFF`, green `#00E000` (the desktop), red `#E00000` and black `#000000`; its dark tokens MUST be the monochrome high-resolution look (black on white windows over a grey dither desktop).
C4: The desktop MUST be green, with the drive icons (floppy disks `A` and `B`, labelled "FLOPPY DISK") at the top left and the trash can at the bottom left, each icon a black-and-white bitmap with a label below.
C5: The menu bar MUST be white across the top with the titles Desk, File, View and Options; a menu MUST drop down when the pointer rests on its title (no click), as a white box with a black border and a one-point shadow, disabled items in a grey dither.
C6: A window MUST have a white title bar (the mover) filled with a dither pattern when the window is active, the close box at its left and the full box at its right, an info line under the title ("123456 bytes used in 12 items."), scroll arrows and dithered slider wells on the right and bottom, and the size box at the bottom right.
C7: An alert MUST show one of the exclamation, question or stop icons and up to three exit buttons, the default one with a thick border; the `ItemSelector` MUST show the GEM file selector: the title ITEM SELECTOR, Directory and Selection fields, the file list with its scroll bar, and OK and Cancel.
C8: The pack MUST define at least `Desktop`, `DriveIcon`, `TrashIcon`, `FolderIcon`, `ProgramIcon`, `FileIcon`, `MenuBar`, `MenuTitle`, `MenuItem`, `Window`, `InfoLine`, `Alert`, `Dialog`, `ExitButton`, `DefaultButton`, `ItemSelector`, `ControlPanel` (the desk accessory with its colour sliders) and `Slider`.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["gem"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `gem-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
