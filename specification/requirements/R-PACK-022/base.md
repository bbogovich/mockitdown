---
id: R-PACK-022
title: Atari ST GEM pack
status: active
version: 0.11.0
rev: 0
page: PACK.5
slot: reqs
order: 4
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 1359616a83b8
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
<!-- file: TC-1.md -->
---
id: TC-1
title: The gem pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `gem`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the `Desktop` background is `rgb(0, 224, 0)`; an `Alert`'s default button border is thicker than its other buttons'; the `ItemSelector` shows a Directory field, a Selection field and a list (C4, C5, C6, C7).
4. The conformance case `gem-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["gem"]`
   and renders in the Examples tab without a diagnostic (C9).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: The gem pack looks like the real system
verifies: [C4, C5, C6, C7]
---

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside Atari ST GEM screenshots, for example the GEM pages of the GUI Gallery (toastytech.com/guis), and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).
<!-- file: prose.md -->
**Requirement.** Atari ST GEM pack (F-3.C13, SRC-18#refs).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).
