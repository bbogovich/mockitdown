---
id: R-PACK-026
title: Apple Newton pack
status: active
version: 0.11.0
rev: 0
page: PACK.5
slot: reqs
order: 8
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: daa8d2b5cf67
---

C1: The pack `newton` MUST imitate Newton OS 2.1 on the MessagePad 2000/2100 (1997), with `framework` naming it, `version` "Newton OS 2.1", and the import modules `Newton`, `NewtonOS` and `NewtonScript`, listed in the Mobile group after `android` (R-PACK-008.C9).
C2: Its default device MUST be `phone` at 320 × 480 points (the 320 × 480 screen), chrome `none`, so that the generator files it under Mobile.
C3: Its light tokens MUST use the MessagePad's greyscale LCD: background `#C8CCBE` (the grey-green screen), ink `#1A1A1A`, greys in four steps between them; its dark tokens MUST show the backlit screen (light ink on a dark blue-green `#1F3A33`).
C4: The screen MUST end in the button bar along the bottom: Names, Dates, Extras, Undo, Find and Assist, each an icon above its name, and the keyboard and clock at the right.
C5: The Notepad MUST show a lined note page whose notes are separated by a rule carrying the date at its left ("11/23"), text in the Newton system font and, through `Ink`, handwriting-like ink strokes; a folder tab ("Unfiled Notes") MUST sit at the top right.
C6: A slip (a dialog) MUST be a floating box with a thick black border with rounded corners and a close box (an X in a circle) at its bottom right; a picker MUST be a label preceded by a diamond, opening a list with a border and a check mark on the chosen item.
C7: Buttons MUST be rounded rectangles with a one-point border, check boxes squares, and the Extras drawer a grid of application icons with names, under a title bar with folder tabs.
C8: The pack MUST define at least `Notepad`, `Note`, `NoteRule`, `Ink`, `ButtonBar`, `ButtonBarItem`, `ExtrasDrawer`, `AppIcon`, `FolderTab`, `Slip`, `CloseBox`, `Picker`, `TextButton`, `CheckBox`, `RadioButton`, `InputLine`, `Keyboard`, `StatusBar` and `DateHeader`.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["newton"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `newton-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
<!-- file: TC-1.md -->
---
id: TC-1
title: The newton pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `newton`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the screen background is `rgb(200, 204, 190)`; the `ButtonBar` is at the bottom of the screen with six items; a `Slip` has rounded corners and a border of at least 3 points (C4, C5, C6, C7).
4. The conformance case `newton-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["newton"]`
   and renders in the Examples tab without a diagnostic (C9).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: The newton pack looks like the real system
verifies: [C4, C5, C6, C7]
---

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside Newton OS 2.1 screenshots on the MessagePad 2000/2100, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).
<!-- file: prose.md -->
**Requirement.** Apple Newton pack (F-3.C14, SRC-18#mobile).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).
