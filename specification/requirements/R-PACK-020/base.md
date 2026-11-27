---
id: R-PACK-020
title: Windows 1.0 in its default colours
status: active
version: 0.11.0
rev: 0
page: PACK.5
slot: reqs
order: 2
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 03b31524f532
---

C1: The pack `win1` (R-PACK-008.C7) MUST keep its identity, modules, elements and tiled-window layout, and MUST change its light appearance to the Windows 1.0 default EGA colour scheme of SRC-18#image1; its `framework` key MUST say "EGA 16 colours, default colour scheme".
C2: Its default device, sizes and chrome MUST stay as they are (desktop 640 × 350, chrome `window`).
C3: Its light tokens MUST be: menu bar `#FCFC54` with black text; caption bar `#5454FC`; title text white on a black field; window frames and rules `#000000`; client areas `#FCFCFC`; scroll bar track `#FC5454`; scroll thumb and arrow boxes `#FCFCFC` outlined in black; selection inverted (white on black); application workspace `#5454FC`; its dark tokens MUST keep the existing CGA-style monochrome inversion.
C4: The desktop behind the tiled windows MUST be a one-pixel checkerboard of `#5454FC` and `#54FCFC`, and the icon area along the bottom a one-pixel checkerboard of `#54FCFC` and `#54FC54`.
C5: The active window's caption MUST carry a fine dot texture of black and white over the blue (alternate rows of blue-black and blue-white dots, as in the image) with the title centred in white on a black field; an inactive window's caption MUST be plain blue with the title in the same field.
C6: Menu bars MUST span each window under its caption in yellow, items in black separated by spaces, an open menu as a white box with a black border whose highlighted item is inverted.
C7: The vertical scroll bar MUST show a red track, white arrow boxes at both ends and a white thumb, all outlined in black; a selected list or calendar cell MUST be inverted.
C8: The pack's own elements MUST stay those it defines at 0.10.8; `MonthView`, `CardStack`, `IndexCard`, `MenuBar`, `VScrollBar`, `IconArea` and `Desktop` MUST take the colours above.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["win1"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `win1-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
<!-- file: TC-1.md -->
---
id: TC-1
title: The win1 pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `win1`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: a `MenuBar` background is `rgb(252, 252, 84)`; a window caption background colour is `rgb(84, 84, 252)`; the `VScrollBar` track is `rgb(252, 84, 84)`; the `Desktop` background image alternates `rgb(84, 84, 252)` and `rgb(84, 252, 252)`; the `IconArea` background image alternates `rgb(84, 252, 252)` and `rgb(84, 252, 84)` (C4, C5, C6, C7).
4. The conformance case `win1-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["win1"]`
   and renders in the Examples tab without a diagnostic (C9).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: The win1 pack looks like the real system
verifies: [C4, C5, C6, C7]
---

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside SRC-18#image1 (`definition/sources/assets/SRC-18-win1.png`); a conformance case and the gallery example reproduce its Calendar and Cardfile layout, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).
<!-- file: prose.md -->
**Requirement.** Windows 1.0 as it looked out of the box on an EGA screen: yellow menu bars, blue
captions, red scroll bars, a blue and cyan desktop and a cyan icon area (F-3.C11). The colours are read from
the developer's screenshot, SRC-18#image1; the monochrome look stays as the dark appearance.

**Verification.** TC-1 (automated, including the colours of C3 and C4 as computed styles), TC-M1
(side by side with the screenshot).
