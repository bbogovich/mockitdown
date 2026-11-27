---
id: R-PACK-027
title: Palm OS pack
status: active
version: 0.11.0
rev: 0
page: PACK.5
slot: reqs
order: 9
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 8baa65a776e2
---

C1: The pack `palm` MUST imitate Palm OS 3.5 on the Palm V (1999, 160 × 160 greyscale), with `framework` naming it, `version` "Palm OS 3.5", and the import modules `PalmOS`, `Palm` and `PalmPilot`, listed in the Mobile group after `newton` (R-PACK-008.C9).
C2: Its default device MUST be `phone` at 320 × 440 points: the 160 × 160 screen at two points per pixel (320 × 320) above the silkscreen Graffiti area (120 points), chrome `none`.
C3: Its light tokens MUST use the Palm V screen: background `#B8C4A8` (grey-green LCD), ink `#101010`, and two greys between them; its dark tokens MUST show the backlit screen (the inverted look of the Palm V backlight: light ink on dark).
C4: A form MUST show its title in a black-filled tab at the top left with the title in white bold, a black rule continuing across the rest of the top, and the form's content below in the Palm system font.
C5: The silkscreen area MUST show the Applications, Menu, Calc and Find icons at its corners and the Graffiti writing area with its letter and number halves, drawn as printed in dark grey on the case.
C6: Buttons MUST be rounded rectangles with a one-pixel frame, push buttons groups of adjacent boxes with the selected one inverted, pop-up triggers a label followed by a down triangle, selector triggers dotted boxes, and fields underlined with a dotted line; menus MUST drop from the top over the title as a menu bar with one open menu, items with shortcut strokes at their right.
C7: The Launcher MUST show application icons in a grid of four columns with names below, the category pop-up ("All") at the top right and the battery gauge in the title.
C8: The pack MUST define at least `Form`, `FormTitle`, `Launcher`, `AppIcon`, `CategoryTrigger`, `Button`, `PushButton`, `PushButtonGroup`, `CheckBox`, `PopupTrigger`, `SelectorTrigger`, `Field`, `List`, `Table`, `ScrollBar`, `Alert`, `MenuBar`, `MenuItem`, `SilkscreenArea` and `Keyboard`.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["palm"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `palm-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
<!-- file: TC-1.md -->
---
id: TC-1
title: The palm pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `palm`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the screen background is `rgb(184, 196, 168)`; a `FormTitle` is black with white text; the `SilkscreenArea` is below the 320 × 320 screen (C4, C5, C6, C7).
4. The conformance case `palm-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["palm"]`
   and renders in the Examples tab without a diagnostic (C9).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: The palm pack looks like the real system
verifies: [C4, C5, C6, C7]
---

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside Palm OS 3.5 screenshots on the Palm V and the Palm OS emulator (POSE) skins, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).
<!-- file: prose.md -->
**Requirement.** Palm OS pack (F-3.C14, SRC-18#mobile).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).
