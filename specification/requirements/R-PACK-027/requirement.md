---
id: R-PACK-027
title: Palm OS pack
status: active
version: 0.12.4
rev: 2
page: PACK.5
slot: reqs
order: 9
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 10c54a6e75dd
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
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
