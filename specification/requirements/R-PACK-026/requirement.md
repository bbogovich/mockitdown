---
id: R-PACK-026
title: Apple Newton pack
status: active
version: 0.12.12
rev: 5
page: PACK.5
slot: reqs
order: 8
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: 06bf65c7aab3
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
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
