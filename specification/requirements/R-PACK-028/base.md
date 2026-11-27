---
id: R-PACK-028
title: Windows CE (Pocket PC) pack
status: active
version: 0.11.0
rev: 0
page: PACK.5
slot: reqs
order: 10
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 4c095a5256d9
---

C1: The pack `wince` MUST imitate Pocket PC 2002 on Windows CE 3.0 (2001), with `framework` naming it, `version` "Pocket PC 2002", and the import modules `WindowsCE`, `PocketPC`, `WinCE` and `WindowsMobile`, listed in the Mobile group after `palm` (R-PACK-008.C9).
C2: Its default device MUST be `phone` at 480 × 640 points (the 240 × 320 screen at two points per pixel), chrome `none`.
C3: Its light tokens MUST use the Pocket PC 2002 default theme: navigation bar a dark blue gradient from `#0A246A` to `#3A6EA5` with white text, command bar light grey `#D6D3CE`, content white, selection `#0A246A` with white text, and Tahoma-like text (`Tahoma` with sans-serif fallbacks); its dark tokens MAY repeat the light ones.
C4: The navigation bar MUST run across the top: the Start flag and the title at its left, then the connectivity and speaker icons and the time, and an `ok` or close (X) button in a circle at the right for dialogs and settings.
C5: The Start menu MUST drop from the Start flag as a white list with a row of recently used icons, the program names with their icons, and Programs, Settings, Find and Help below a separator.
C6: The Today screen MUST show the date with the owner's name, then the Calendar, Inbox and Tasks summary rows, each with its icon, over a background picture or white.
C7: The command bar MUST run along the bottom with New, the menu names and the input-panel (keyboard) button at its right; tabbed forms MUST show their tabs at the bottom of the form, above the command bar.
C8: The pack MUST define at least `NavigationBar`, `StartMenu`, `TodayScreen`, `TodayItem`, `CommandBar`, `CommandBarMenu`, `InputPanel`, `OkButton`, `TabControl`, `ListView`, `TreeView`, `MessageBox`, `Notification`, `Button`, `CheckBox`, `RadioButton`, `Edit`, `ComboBox`, `DateTimePicker` and `ScrollBar`.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["wince"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `wince-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
<!-- file: TC-1.md -->
---
id: TC-1
title: The wince pack, automated
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10]
---

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `wince`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the `NavigationBar` background is a gradient starting at `rgb(10, 36, 106)`; the `CommandBar` is at the bottom with its keyboard button at the right; a `TabControl`'s tabs are below its pages (C4, C5, C6, C7).
4. The conformance case `wince-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["wince"]`
   and renders in the Examples tab without a diagnostic (C9).
<!-- file: TC-M1.md -->
---
id: TC-M1
title: The wince pack looks like the real system
verifies: [C4, C5, C6, C7]
---

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside Pocket PC 2002 screenshots and the Pocket PC 2002 emulator of eMbedded Visual Tools, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).
<!-- file: prose.md -->
**Requirement.** Windows CE (Pocket PC) pack (F-3.C14, SRC-18#mobile).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).
