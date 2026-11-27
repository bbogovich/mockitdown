---
id: R-PACK-021
title: Apple IIgs GS/OS beyond the Finder window
status: active
version: 0.12.6
rev: 3
page: PACK.5
slot: reqs
order: 3
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 2c680dd2a002
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
---

C1: The pack `gsos` (R-PACK-008.C7) MUST keep its identity, device, tokens and existing elements, and MUST add the screens and parts of GS/OS System 6.0.1 that SRC-18#refs lists.
C2: It MUST render the full-screen parts of C4 and C8 (boot and shut-down screens) and the desktop of C6 on its `screen` device form (640 × 400, the whole super hi-res screen, chrome `none`), and windows as before.
C3: It MUST add colour tokens for the 16 colours the Finder's Color menu offers (black, dark blue, brown, grey, green, blue, orange, light grey, red, purple, yellow, pink, light green, light blue, white and a mid grey), and the six-colour striped Apple logo of the Apple menu.
C4: A `BootScreen` MUST show the Apple IIgs boot display — the Apple logo, the "Welcome to the IIGS" text, a progress indication — with a row of the loaded extensions' icons along the lower left.
C5: A `Launcher` MUST show the Launcher of application disks without the Finder: a window listing the applications of the disk, with its menu bar and Launch and Quit buttons.
C6: The `Desktop` MUST place volume icons in a column down its right edge — `Disk525` (one per 5.25-inch drive, shown whether or not a disk is in it), `Disk35`, `RamDisk` and `HardDisk` — with the `TrashIcon` at the bottom right; file icons MAY be placed on the desktop, and an `AliasIcon` MUST show its name in italics; any icon or folder MAY take a colour by `.iconColor(…)` naming a colour of C3.
C7: Desk accessories MUST include `Calculator` (keypad window), `KeyboardNDA` (an on-screen keyboard) and `FindFile` (search field, Find button, results list), each in an NDA window; `ControlPanel` MUST show a list of control panel items (General, Monitor, Sound, Mouse, Keyboard, Clock, Printer, Slots, RAM) and the selected item's settings.
C8: A `TeachWindow` MUST show the Teach text editor's document window with text in several fonts, sizes and styles, and the Font, Size and Style menus in the menu bar; a `ShutDownScreen` MUST show the shut-down message with Restart and Shut Down buttons, and `AboutBox` the About the Finder box with its version and memory figures.
C9: The pack MUST add at least `BootScreen`, `ExtensionIcon`, `Launcher`, `AboutBox`, `Disk525`, `Disk35`, `RamDisk`, `AliasIcon`, `Calculator`, `KeyboardNDA`, `FindFile`, `ControlPanelItem`, `TeachWindow`, `FontMenu`, `StyleMenu` and `ShutDownScreen`, and the modifier `.iconColor(_:)`.
C10: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["gsos"]`, R-WEB-004.C14).
C11: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `gsos-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
