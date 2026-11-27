---
id: R-PACK-025
title: BeOS pack
status: active
version: 0.11.0
rev: 0
page: PACK.5
slot: reqs
order: 7
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: a464e624c952
---

C1: The pack `beos` MUST imitate BeOS R5 (2000) with the Tracker and the Deskbar, with `framework` naming it, `version` "BeOS R5", and the import modules `BeOS`, `BeAPI`, `InterfaceKit` and `Tracker`, listed in the Retro group after `win95` (R-PACK-008.C9).
C2: Its default device MUST be `desktop` at 1024 × 768 points, chrome `window` (the yellow tab) for `window` and `desktop` forms.
C3: Its light tokens MUST use the BeOS defaults: the focused window's tab yellow `#FFCB00`, unfocused tabs light grey `#E8E8E8`, window panels and controls grey `#D8D8D8` with white and dark grey bevels, the desktop blue `#336698`, list selection a darker grey `#B8B8B8`, and text black in a Swiss-style sans font (`Swis721 BT` with sans-serif fallbacks); its dark tokens MAY repeat the light ones.
C4: A window's title MUST sit in a tab only as wide as the title plus its boxes, at the top left of the window: the close box at the tab's left, the zoom box at its right, the tab yellow when the window has the focus.
C5: The Deskbar MUST sit at the top right of the screen: the Be menu (the leaf logo) on top, the list of running applications below, and the clock and replicant tray beside the logo.
C6: Controls MUST be drawn with the BeOS 3-D bevels: buttons rounded at their corners with the default button outlined in a darker frame, check boxes and radio buttons with a blue-grey mark, scroll bars with a knob carrying three grip lines, and pop-up menu fields with a down arrow.
C7: Tracker windows MUST show their files in the list view with the column headers Name, Size and Modified, or as icons; `Alert` MUST show the info, idea, warning or stop icon at the left on a tinted strip with its buttons at the bottom right.
C8: The pack MUST define at least `Desktop`, `Deskbar`, `DeskbarItem`, `BeMenu`, `Window` (with the tab), `TrackerWindow`, `DesktopIcon`, `BButton`, `BCheckBox`, `BRadioButton`, `BTextControl`, `BMenuField`, `BSlider`, `BStatusBar`, `BAlert`, `BTabView`, `BListView`, `BOutlineListView`, `BScrollBar`, `BColorControl`, `BBox` and `Workspaces`.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["beos"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `beos-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
<!-- file: TC-1.md -->
---
id: TC-1
title: The beos pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `beos`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the focused window's tab background is `rgb(255, 203, 0)` and narrower than the window; the `Desktop` background is `rgb(51, 102, 152)`; the `Deskbar` is at the top right (C4, C5, C6, C7).
4. The conformance case `beos-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["beos"]`
   and renders in the Examples tab without a diagnostic (C9).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: The beos pack looks like the real system
verifies: [C4, C5, C6, C7]
---

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside BeOS R5 screenshots, for example the BeOS pages of the GUI Gallery (toastytech.com/guis), and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).
<!-- file: prose.md -->
**Requirement.** BeOS pack (F-3.C13, SRC-18#refs).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).
