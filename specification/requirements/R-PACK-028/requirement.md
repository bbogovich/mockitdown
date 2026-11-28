---
id: R-PACK-028
title: Windows CE (Pocket PC) pack
status: active
version: 0.12.12
rev: 5
page: PACK.5
slot: reqs
order: 10
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 20628a6ccd95
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
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
