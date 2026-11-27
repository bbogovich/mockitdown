---
id: R-PACK-029
title: BlackBerry pack
status: active
version: 0.11.0
rev: 0
page: PACK.5
slot: reqs
order: 11
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 04c415a90c31
---

C1: The pack `blackberry` MUST imitate BlackBerry OS 5 on the BlackBerry Bold 9700 (2009) with its default Precision theme, with `framework` naming it, `version` "BlackBerry OS 5.0", and the import modules `BlackBerry`, `BlackBerryOS` and `RIM`, listed in the Mobile group after `wince` (R-PACK-008.C9).
C2: Its default device MUST be `phone` with the size 480 × 360 points (the Bold's landscape screen), chrome `none`.
C3: Its light tokens MUST use the Precision theme: home screen and banner dark (`#1B1B1B` to `#3A3A3A` gradient), lists white with black text, the focus highlight a blue gradient from `#2F7BC9` to `#1A4F8B` with white text, and text in a BBAlpha-like sans (`BBAlpha Sans` with sans-serif fallbacks); its dark tokens MAY repeat the light ones.
C4: The banner MUST run across the top: the carrier name, the date and time at the left, and the signal, connection type and battery indicators at the right; the home screen MUST show a dock row of application icons (or the full grid of icons) over the wallpaper, the focused icon framed by the highlight with its name above the dock.
C5: Lists MUST show one row per item with a thin separator, the focused row in the blue highlight; there is no touch: focus is shown by the highlight alone.
C6: The menu (the BlackBerry key) MUST open as a full-height list at the right of the screen, items with their icons, the focused one highlighted; dialogs MUST be centred boxes with an icon, the message and a vertical stack of buttons.
C7: Choice fields MUST show their value between angled brackets or with a down arrow, check boxes as square boxes with a tick, and edit fields with a thin underline or box.
C8: The pack MUST define at least `HomeScreen`, `Banner`, `Dock`, `AppIcon`, `IconGrid`, `TitleBar`, `ListField`, `ListRow`, `MenuPopup`, `MenuItem`, `Dialog`, `ButtonField`, `CheckboxField`, `ObjectChoiceField`, `EditField`, `LabelField`, `SeparatorField`, `Indicator` and `ActivityIndicator`.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["blackberry"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `blackberry-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
<!-- file: TC-1.md -->
---
id: TC-1
title: The blackberry pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `blackberry`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the focused `ListRow` has the blue highlight gradient; the `MenuPopup` is anchored at the right edge; the `Banner` is at the top with the battery indicator at the right (C4, C5, C6, C7).
4. The conformance case `blackberry-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["blackberry"]`
   and renders in the Examples tab without a diagnostic (C9).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: The blackberry pack looks like the real system
verifies: [C4, C5, C6, C7]
---

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside BlackBerry OS 5 Precision theme screenshots on the Bold 9700, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).
<!-- file: prose.md -->
**Requirement.** BlackBerry pack (F-3.C14, SRC-18#mobile).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).
