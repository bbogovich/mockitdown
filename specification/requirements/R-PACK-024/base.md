---
id: R-PACK-024
title: RISC OS pack
status: active
version: 0.11.0
rev: 0
page: PACK.5
slot: reqs
order: 6
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: b1deb13fb076
---

C1: The pack `riscos` MUST imitate the Acorn RISC OS 3.11 desktop (1992), with `framework` naming it, `version` "RISC OS 3.11", and the import modules `RISCOS`, `Acorn`, `Archimedes` and `Wimp`, listed in the Retro group after `nextstep` (R-PACK-008.C9).
C2: Its default device MUST be `desktop` at 1280 × 1024 halved to 640 × 512 points (the mode 20 screen), chrome `none`, and `window` for a single window.
C3: Its light tokens MUST use the RISC OS 3 desktop colours: window work areas light grey `#DDDDDD`, the title bar of the window with the input focus cream `#FFFFC0`, other title bars light grey, window furniture mid grey `#BBBBBB` with black outlines, scroll bar sliders grey in light blue wells `#99BBEE`, and the desktop background mid grey `#777777`; its dark tokens MAY repeat the light ones.
C4: The icon bar MUST run along the bottom of the screen in light grey, holding the disc drive and filing system icons at the left (for example `:0` and `HardDisc4`) and the application icons at the right, the Acorn task manager icon last.
C5: A window MUST show, from the left of its title bar, the back icon and the close icon, the title centred, then the toggle-size icon at the right; scroll bars on the right and bottom with arrows at both ends, and the adjust-size icon at the bottom right.
C6: Menus MUST pop up at the pointer (the middle mouse button) with a title bar, items in black on white, a separator as a rule, and a right-pointing arrow on items that open a submenu or a dialogue box.
C7: A `SaveBox` MUST show the save dialogue — a file icon to drag, a writable name field and an OK button — and buttons MUST be bordered grey boxes, the default action button with an extra outline; option icons MUST be drawn as diamonds and check icons as small squares with a tick.
C8: The pack MUST define at least `Desktop`, `IconBar`, `IconBarIcon`, `FilerWindow`, `FilerIcon`, `Window`, `Menu`, `MenuItem`, `SaveBox`, `Dialogue`, `ActionButton`, `DefaultActionButton`, `OptionIcon`, `CheckIcon`, `WritableIcon`, `Slider`, `TaskManager` and `ErrorBox`.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["riscos"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `riscos-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
<!-- file: TC-1.md -->
---
id: TC-1
title: The riscos pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `riscos`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the focused window's title bar is `rgb(255, 255, 192)`; the `IconBar` is at the bottom of the screen; a menu item opening a submenu shows its arrow (C4, C5, C6, C7).
4. The conformance case `riscos-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["riscos"]`
   and renders in the Examples tab without a diagnostic (C9).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: The riscos pack looks like the real system
verifies: [C4, C5, C6, C7]
---

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside RISC OS 3 screenshots, for example the RISC OS pages of the GUI Gallery (toastytech.com/guis), and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).
<!-- file: prose.md -->
**Requirement.** RISC OS pack (F-3.C13, SRC-18#refs).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).
