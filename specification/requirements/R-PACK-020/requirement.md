---
id: R-PACK-020
title: Windows 1.0 in its default colours
status: active
version: 0.12.6
rev: 3
page: PACK.5
slot: reqs
order: 2
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: c07e8bd816a4
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
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
