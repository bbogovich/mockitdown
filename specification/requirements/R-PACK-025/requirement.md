---
id: R-PACK-025
title: BeOS pack
status: active
version: 0.12.6
rev: 3
page: PACK.5
slot: reqs
order: 7
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 64e7e8ff31e0
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
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
