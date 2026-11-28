---
id: R-PACK-024
title: RISC OS pack
status: active
version: pending
rev: 5
page: PACK.5
slot: reqs
order: 6
source: [SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
requires: [R-PACK-008, R-PACK-013, R-PACK-018]
hash: e491a96f4677
refs: [R-PACK-008, R-PACK-013, R-PACK-018, R-REPO-004, R-WEB-004]
---

C1: The pack `riscos` MUST imitate the Acorn RISC OS 3.11 desktop (1992), with `framework` naming it, `version` "RISC OS 3.11", and the import modules `RISCOS`, `Acorn`, `Archimedes` and `Wimp`, listed in the Retro group after `nextstep` (R-PACK-008.C9).
C2: Its default device MUST be `desktop` at 1280 × 1024 halved to 640 × 512 points (the mode 20 screen), chrome `none`, and `window` for a single window.
C3: Its light tokens MUST use the RISC OS 3 desktop colours: window work areas light grey `#DDDDDD`, the title bar of the window with the input focus cream `#FFFFC0`, other title bars light grey, window furniture mid grey `#BBBBBB` with black outlines, scroll bar sliders grey in light blue wells `#99BBEE`, and the desktop background mid grey `#777777`; its dark tokens MAY repeat the light ones.
C4: The icon bar MUST run along the bottom of the screen in light grey, holding the disc drive and filing system icons at the left (for example `:0` and `HardDisc4`) and the application icons at the right, the Acorn task manager icon last.
C5: A window MUST show, from the left of its title bar, the back icon and the close icon, the title centred, then the toggle-size icon at the right; scroll bars on the right and bottom with arrows at both ends, and the adjust-size icon at the bottom right.
C6: Menus MUST pop up at the pointer (the middle mouse button) with a title bar, items in black on white, a separator as a rule, and a right-pointing arrow on items that open a submenu or a dialogue box.
C7: A `SaveBox` MUST show the save dialogue — a file icon to drag, a writable name field and an OK button — and buttons MUST be bordered grey boxes, the default action button with an extra outline; option icons MUST be drawn as diamonds and check icons as small squares with a tick.
C8: The pack MUST define at least `Desktop`, `IconBar`, `IconBarIcon`, `FilerWindow`, `FilerIcon`, `Window`, `Menu`, `MenuItem`, `SaveBox`, `Dialogue`, `ActionButton`, `DefaultActionButton`, `OptionIcon`, `CheckIcon`, `WritableIcon`, `Slider`, `TaskManager` and `ErrorBox`.
C9: The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["riscos"]`, R-WEB-004.C14).
C10: Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `riscos-screen` rendering the example of the previous clause (R-REPO-004.C2).
V1: The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present.
