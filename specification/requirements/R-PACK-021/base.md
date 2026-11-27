---
id: R-PACK-021
title: Apple IIgs GS/OS beyond the Finder window
status: active
version: 0.11.0
rev: 0
page: PACK.5
slot: reqs
order: 3
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 6de8013c4f10
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
<!-- file: TC-1.md -->
---
id: TC-1
title: The gsos pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `gsos`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C9 names (C1, C2, C3, C9).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C10).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the `Desktop` sample's volume icons are in its right-hand column; an `AliasIcon` label has `font-style: italic`; an icon with `.iconColor(.red)` is drawn red (C4, C5, C6, C7, C8).
4. The conformance case `gsos-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C11).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["gsos"]`
   and renders in the Examples tab without a diagnostic (C10).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: The gsos pack looks like the real system
verifies: [C4, C5, C6, C7, C8]
---

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside the screenshots of `http://toastytech.com/guis/gsos.html` (read 2026-11-27, SRC-18#refs), and confirm each part C4, C5, C6, C7, C8 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).
<!-- file: prose.md -->
**Requirement.** The GS/OS pack grows from the Finder window to the whole system shown on the GUI
Gallery's GS/OS page (read 2026-11-27, SRC-18#refs): boot screen, Launcher, desktop volumes and Trash,
coloured icons and aliases, desk accessories, Control Panel, Teach and the shut-down screen (F-3.C12).

**Verification.** TC-1 (automated), TC-M1 (side by side with the GUI Gallery's screenshots).
