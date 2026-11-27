---
title: "Retro and handheld packs"
spec_version: 0.11.0
status: draft
updated: 2026-11-27
page_id: PACK.5
---

# Retro and handheld packs

Packs requested after the first retro set (R-PACK-008.C7): the Amiga Workbench, Windows 1.0 in its
default colours, a fuller Apple IIgs GS/OS, four further systems from the GUI timeline, and four
handhelds for the Mobile group (F-3.C10 to C14, SRC-18#packs, SRC-18#mobile). Each requirement names
the pack's identity, its group and place, its device and chrome, its colours, its own elements and the
look a reader must recognise.

Every pack here also satisfies the general pack rules: it extends `base`, declares import modules, light
and dark tokens and a default device (R-PACK-008.C2), scopes its CSS (R-PACK-007), declares samples for
elements whose generic sample would say nothing (R-PACK-013.C4), has a conformance case (R-REPO-004.C2),
gets a Reference page and a gallery entry generated from its definition (R-PACK-012) and reuses the
shared stylesheet rules instead of copying them (R-PACK-018). The colours given are the targets; a pack
may add tokens for further parts.

**Choosing the further retro systems.** From the GUI timeline (SRC-18#refs) four systems were chosen
whose look is distinct from every shipped pack and recognisable at a glance: Atari ST GEM (1985, green
desktop, white windows with patterned title bars), GEOS on the Commodore 64 (1986, 320 × 200, a
cartoon-like monochrome desktop with its own menu style), Acorn RISC OS 3 (1992, the icon bar along the
bottom, textured grey windows with cream title bars, the three-button mouse's pop-up menus) and BeOS R5
(1995/2000, yellow tab title bars sized to their title). OS/2 Warp 4, DeskMate, DESQview/X and Visi On
were left out: the first three resemble packs already shipped, and Visi On is mostly text.

**The Amiga version.** Workbench 1.3 (1988) is chosen over 2.x/3.x: its blue, white, black and orange
palette is what people remember as "the Amiga", while the grey, bevelled Workbench 2 and 3 look close to
the shipped Windows 95, NeXTSTEP and CDE packs.

### R-PACK-019 — Amiga Workbench pack

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** Amiga Workbench pack (F-3.C10, SRC-18#packs).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).

**R-PACK-019.TC-1 — The amiga pack, automated**

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `amiga`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the Workbench screen's background is `rgb(0, 85, 170)`; the screen title bar is white; a selected menu item's background is `rgb(255, 136, 0)` or its text inverted as C5 says; the `GuruMeditation` alert has a red border on black (C4, C5, C6, C7).
4. The conformance case `amiga-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["amiga"]`
   and renders in the Examples tab without a diagnostic (C9).

**R-PACK-019.TC-M1 — The amiga pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside Workbench 1.3 screenshots, for example the Amiga pages of the GUI Gallery (toastytech.com/guis, AmigaOS), and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `amiga` MUST imitate the Commodore Amiga Workbench 1.3 (Kickstart 1.3, 1988) in its 4-colour high-resolution screen, with `framework` naming it, `version` "Workbench 1.3", and the import modules `Amiga`, `Workbench`, `Intuition` and `AmigaOS`, listed in the Retro group after `win2` (R-PACK-008.C9). |
| C2 | Its default device MUST be `desktop` at 640 × 512 points, showing the 640 × 256 PAL screen with each Amiga pixel one point wide and two points tall, with chrome `none` on `desktop` (the Workbench screen draws its own title bar) and `window` on `window`. |
| C3 | Its light tokens MUST use the Workbench 1.3 palette: screen background blue `#0055AA`, white `#FFFFFF`, black `#000000` and orange `#FF8800`, and no other colour for window parts; text MUST be white or black in the Topaz-like fixed-pitch font (a `Topaz` font alias with monospace fallbacks); its dark tokens MAY repeat the light palette, since the Workbench had no dark mode. |
| C4 | The Workbench screen MUST show the screen title bar across the top (white, with the title "Workbench release." and free memory in blue at its left, and the screen depth gadgets at its right) over the blue background. |
| C5 | A window MUST have a white frame, a title bar holding the close gadget at its left, the title, and the two overlapping depth gadgets at its right; the active window's title bar MUST be filled and an inactive one's left unfilled; a sizing gadget MUST sit at the bottom right, and proportional scroll gadgets (a knob in a blue well) MUST sit on the right and bottom borders of windows that scroll. |
| C6 | Menus MUST open from the screen title bar (the right mouse button's menu strip): menu titles in the title bar, items in black on white, the highlighted item inverted with orange, and keyboard shortcuts as the Amiga key glyph followed by a letter. |
| C7 | System requesters MUST show their text over the window background with Retry and Cancel (or OK) as bordered boolean gadgets at the bottom corners; a `GuruMeditation` alert MUST draw the red-on-black rectangle with its red border and the two lines "Software Failure.  Press left mouse button to continue." and "Guru Meditation #…". |
| C8 | The pack MUST define at least `WorkbenchScreen`, `ScreenTitleBar`, `Window` (variants `workbench`, `drawer`, `tool`), `DiskIcon`, `DrawerIcon`, `ToolIcon`, `ProjectIcon`, `TrashcanIcon`, `RamDiskIcon`, `Shell` (the CLI/AmigaShell window), `Requester`, `GuruMeditation`, `MenuStrip`, `MenuItem`, `BoolGadget`, `StringGadget`, `PropGadget`, `CheckMarkItem`, `Preferences` (the Preferences tool with its colour sliders) and `Clock`. |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["amiga"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `amiga-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-020 — Windows 1.0 in its default colours

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** Windows 1.0 as it looked out of the box on an EGA screen: yellow menu bars, blue
captions, red scroll bars, a blue and cyan desktop and a cyan icon area (F-3.C11). The colours are read from
the developer's screenshot, SRC-18#image1; the monochrome look stays as the dark appearance.

**Verification.** TC-1 (automated, including the colours of C3 and C4 as computed styles), TC-M1
(side by side with the screenshot).

**R-PACK-020.TC-1 — The win1 pack, automated**

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

**R-PACK-020.TC-M1 — The win1 pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside SRC-18#image1 (`definition/sources/assets/SRC-18-win1.png`); a conformance case and the gallery example reproduce its Calendar and Cardfile layout, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `win1` (R-PACK-008.C7) MUST keep its identity, modules, elements and tiled-window layout, and MUST change its light appearance to the Windows 1.0 default EGA colour scheme of SRC-18#image1; its `framework` key MUST say "EGA 16 colours, default colour scheme". |
| C2 | Its default device, sizes and chrome MUST stay as they are (desktop 640 × 350, chrome `window`). |
| C3 | Its light tokens MUST be: menu bar `#FCFC54` with black text; caption bar `#5454FC`; title text white on a black field; window frames and rules `#000000`; client areas `#FCFCFC`; scroll bar track `#FC5454`; scroll thumb and arrow boxes `#FCFCFC` outlined in black; selection inverted (white on black); application workspace `#5454FC`; its dark tokens MUST keep the existing CGA-style monochrome inversion. |
| C4 | The desktop behind the tiled windows MUST be a one-pixel checkerboard of `#5454FC` and `#54FCFC`, and the icon area along the bottom a one-pixel checkerboard of `#54FCFC` and `#54FC54`. |
| C5 | The active window's caption MUST carry a fine dot texture of black and white over the blue (alternate rows of blue-black and blue-white dots, as in the image) with the title centred in white on a black field; an inactive window's caption MUST be plain blue with the title in the same field. |
| C6 | Menu bars MUST span each window under its caption in yellow, items in black separated by spaces, an open menu as a white box with a black border whose highlighted item is inverted. |
| C7 | The vertical scroll bar MUST show a red track, white arrow boxes at both ends and a white thumb, all outlined in black; a selected list or calendar cell MUST be inverted. |
| C8 | The pack's own elements MUST stay those it defines at 0.10.8; `MonthView`, `CardStack`, `IndexCard`, `MenuBar`, `VScrollBar`, `IconArea` and `Desktop` MUST take the colours above. |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["win1"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `win1-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-021 — Apple IIgs GS/OS beyond the Finder window

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** The GS/OS pack grows from the Finder window to the whole system shown on the GUI
Gallery's GS/OS page (read 2026-11-27, SRC-18#refs): boot screen, Launcher, desktop volumes and Trash,
coloured icons and aliases, desk accessories, Control Panel, Teach and the shut-down screen (F-3.C12).

**Verification.** TC-1 (automated), TC-M1 (side by side with the GUI Gallery's screenshots).

**R-PACK-021.TC-1 — The gsos pack, automated**

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `gsos`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C9 names (C1, C2, C3, C9).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C10).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the `Desktop` sample's volume icons are in its right-hand column; an `AliasIcon` label has `font-style: italic`; an icon with `.iconColor(.red)` is drawn red (C4, C5, C6, C7, C8).
4. The conformance case `gsos-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C11).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["gsos"]`
   and renders in the Examples tab without a diagnostic (C10).

**R-PACK-021.TC-M1 — The gsos pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside the screenshots of `http://toastytech.com/guis/gsos.html` (read 2026-11-27, SRC-18#refs), and confirm each part C4, C5, C6, C7, C8 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `gsos` (R-PACK-008.C7) MUST keep its identity, device, tokens and existing elements, and MUST add the screens and parts of GS/OS System 6.0.1 that SRC-18#refs lists. |
| C2 | It MUST render the full-screen parts of C4 and C8 (boot and shut-down screens) and the desktop of C6 on its `screen` device form (640 × 400, the whole super hi-res screen, chrome `none`), and windows as before. |
| C3 | It MUST add colour tokens for the 16 colours the Finder's Color menu offers (black, dark blue, brown, grey, green, blue, orange, light grey, red, purple, yellow, pink, light green, light blue, white and a mid grey), and the six-colour striped Apple logo of the Apple menu. |
| C4 | A `BootScreen` MUST show the Apple IIgs boot display — the Apple logo, the "Welcome to the IIGS" text, a progress indication — with a row of the loaded extensions' icons along the lower left. |
| C5 | A `Launcher` MUST show the Launcher of application disks without the Finder: a window listing the applications of the disk, with its menu bar and Launch and Quit buttons. |
| C6 | The `Desktop` MUST place volume icons in a column down its right edge — `Disk525` (one per 5.25-inch drive, shown whether or not a disk is in it), `Disk35`, `RamDisk` and `HardDisk` — with the `TrashIcon` at the bottom right; file icons MAY be placed on the desktop, and an `AliasIcon` MUST show its name in italics; any icon or folder MAY take a colour by `.iconColor(…)` naming a colour of C3. |
| C7 | Desk accessories MUST include `Calculator` (keypad window), `KeyboardNDA` (an on-screen keyboard) and `FindFile` (search field, Find button, results list), each in an NDA window; `ControlPanel` MUST show a list of control panel items (General, Monitor, Sound, Mouse, Keyboard, Clock, Printer, Slots, RAM) and the selected item's settings. |
| C8 | A `TeachWindow` MUST show the Teach text editor's document window with text in several fonts, sizes and styles, and the Font, Size and Style menus in the menu bar; a `ShutDownScreen` MUST show the shut-down message with Restart and Shut Down buttons, and `AboutBox` the About the Finder box with its version and memory figures. |
| C9 | The pack MUST add at least `BootScreen`, `ExtensionIcon`, `Launcher`, `AboutBox`, `Disk525`, `Disk35`, `RamDisk`, `AliasIcon`, `Calculator`, `KeyboardNDA`, `FindFile`, `ControlPanelItem`, `TeachWindow`, `FontMenu`, `StyleMenu` and `ShutDownScreen`, and the modifier `.iconColor(_:)`. |
| C10 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["gsos"]`, R-WEB-004.C14). |
| C11 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `gsos-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-022 — Atari ST GEM pack

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** Atari ST GEM pack (F-3.C13, SRC-18#refs).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).

**R-PACK-022.TC-1 — The gem pack, automated**

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `gem`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the `Desktop` background is `rgb(0, 224, 0)`; an `Alert`'s default button border is thicker than its other buttons'; the `ItemSelector` shows a Directory field, a Selection field and a list (C4, C5, C6, C7).
4. The conformance case `gem-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["gem"]`
   and renders in the Examples tab without a diagnostic (C9).

**R-PACK-022.TC-M1 — The gem pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside Atari ST GEM screenshots, for example the GEM pages of the GUI Gallery (toastytech.com/guis), and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `gem` MUST imitate the GEM Desktop of the Atari ST (TOS 1.0 to 1.04, 1985–1989) in medium resolution, with `framework` naming it, `version` "TOS 1.04", and the import modules `GEM`, `AtariST`, `TOS` and `GEMDesktop`, listed in the Retro group after `mac-classic` (R-PACK-008.C9). |
| C2 | Its default device MUST be `desktop` at 640 × 400 points (the 640 × 200 medium-resolution screen, each pixel one point wide and two tall), chrome `none`. |
| C3 | Its light tokens MUST use the ST's default medium-resolution palette: white `#FFFFFF`, green `#00E000` (the desktop), red `#E00000` and black `#000000`; its dark tokens MUST be the monochrome high-resolution look (black on white windows over a grey dither desktop). |
| C4 | The desktop MUST be green, with the drive icons (floppy disks `A` and `B`, labelled "FLOPPY DISK") at the top left and the trash can at the bottom left, each icon a black-and-white bitmap with a label below. |
| C5 | The menu bar MUST be white across the top with the titles Desk, File, View and Options; a menu MUST drop down when the pointer rests on its title (no click), as a white box with a black border and a one-point shadow, disabled items in a grey dither. |
| C6 | A window MUST have a white title bar (the mover) filled with a dither pattern when the window is active, the close box at its left and the full box at its right, an info line under the title ("123456 bytes used in 12 items."), scroll arrows and dithered slider wells on the right and bottom, and the size box at the bottom right. |
| C7 | An alert MUST show one of the exclamation, question or stop icons and up to three exit buttons, the default one with a thick border; the `ItemSelector` MUST show the GEM file selector: the title ITEM SELECTOR, Directory and Selection fields, the file list with its scroll bar, and OK and Cancel. |
| C8 | The pack MUST define at least `Desktop`, `DriveIcon`, `TrashIcon`, `FolderIcon`, `ProgramIcon`, `FileIcon`, `MenuBar`, `MenuTitle`, `MenuItem`, `Window`, `InfoLine`, `Alert`, `Dialog`, `ExitButton`, `DefaultButton`, `ItemSelector`, `ControlPanel` (the desk accessory with its colour sliders) and `Slider`. |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["gem"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `gem-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-023 — GEOS pack

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** GEOS pack (F-3.C13, SRC-18#refs).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).

**R-PACK-023.TC-1 — The geos pack, automated**

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `geos`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the screen sits inside a border of `rgb(120, 105, 196)`; a `DialogBox` has a solid black drop shadow; a `NotepadPage` has its folded corner (C4, C5, C6, C7).
4. The conformance case `geos-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["geos"]`
   and renders in the Examples tab without a diagnostic (C9).

**R-PACK-023.TC-M1 — The geos pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside GEOS 64 screenshots, for example the GEOS pages of the GUI Gallery (toastytech.com/guis), and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `geos` MUST imitate GEOS on the Commodore 64 (GEOS 64 2.0, 1988, the deskTop), with `framework` naming it, `version` "GEOS 64 2.0", and the import modules `GEOS`, `GEOS64` and `deskTop`, listed in the Retro group after `win1` (R-PACK-008.C9). |
| C2 | Its default device MUST be `desktop` at 640 × 400 points showing the 320 × 200 screen (each C64 pixel two points square) inside the C64's border, chrome `none`. |
| C3 | Its light tokens MUST be black `#000000` on white `#FFFFFF` for the screen, a 50 % dither for the desktop pattern, and the C64 light blue `#7869C4` for the border around the screen; its dark tokens MUST be the inverted screen (white on black). |
| C4 | The deskTop MUST show the horizontal menu bar in a box at the top left (geos, file, view, disk, select, page, options), the date and time at the top right, the disk notepad in the centre and the drive icons at the right edge. |
| C5 | The disk notepad MUST be a page with a dog-eared lower-left corner for turning pages, the disk's name in its title bar with the close box at its right, up to eight file icons per page with names below, and the page number; the border area MUST run along the bottom of the screen, with the printer and the waste basket at its right. |
| C6 | A dialog box MUST be a white box with a black border and a solid drop shadow at its bottom right, its buttons (OK, CANCEL, YES, NO, OPEN, DISK) drawn as rounded labelled boxes. |
| C7 | Menus MUST open below their title as boxes with a black border and items separated by rules, the highlighted item inverted. |
| C8 | The pack MUST define at least `DeskTop`, `MenuBar`, `MenuItem`, `Notepad`, `NotepadPage`, `FileIcon`, `DriveIcon`, `PrinterIcon`, `WasteBasket`, `BorderArea`, `DialogBox`, `IconButton`, `TextField`, `Clock` and `GeoPaintToolbox` (the geoPaint tool and pattern palettes). |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["geos"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `geos-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-024 — RISC OS pack

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** RISC OS pack (F-3.C13, SRC-18#refs).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).

**R-PACK-024.TC-1 — The riscos pack, automated**

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `riscos`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the focused window's title bar is `rgb(255, 255, 192)`; the `IconBar` is at the bottom of the screen; a menu item opening a submenu shows its arrow (C4, C5, C6, C7).
4. The conformance case `riscos-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["riscos"]`
   and renders in the Examples tab without a diagnostic (C9).

**R-PACK-024.TC-M1 — The riscos pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside RISC OS 3 screenshots, for example the RISC OS pages of the GUI Gallery (toastytech.com/guis), and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `riscos` MUST imitate the Acorn RISC OS 3.11 desktop (1992), with `framework` naming it, `version` "RISC OS 3.11", and the import modules `RISCOS`, `Acorn`, `Archimedes` and `Wimp`, listed in the Retro group after `nextstep` (R-PACK-008.C9). |
| C2 | Its default device MUST be `desktop` at 1280 × 1024 halved to 640 × 512 points (the mode 20 screen), chrome `none`, and `window` for a single window. |
| C3 | Its light tokens MUST use the RISC OS 3 desktop colours: window work areas light grey `#DDDDDD`, the title bar of the window with the input focus cream `#FFFFC0`, other title bars light grey, window furniture mid grey `#BBBBBB` with black outlines, scroll bar sliders grey in light blue wells `#99BBEE`, and the desktop background mid grey `#777777`; its dark tokens MAY repeat the light ones. |
| C4 | The icon bar MUST run along the bottom of the screen in light grey, holding the disc drive and filing system icons at the left (for example `:0` and `HardDisc4`) and the application icons at the right, the Acorn task manager icon last. |
| C5 | A window MUST show, from the left of its title bar, the back icon and the close icon, the title centred, then the toggle-size icon at the right; scroll bars on the right and bottom with arrows at both ends, and the adjust-size icon at the bottom right. |
| C6 | Menus MUST pop up at the pointer (the middle mouse button) with a title bar, items in black on white, a separator as a rule, and a right-pointing arrow on items that open a submenu or a dialogue box. |
| C7 | A `SaveBox` MUST show the save dialogue — a file icon to drag, a writable name field and an OK button — and buttons MUST be bordered grey boxes, the default action button with an extra outline; option icons MUST be drawn as diamonds and check icons as small squares with a tick. |
| C8 | The pack MUST define at least `Desktop`, `IconBar`, `IconBarIcon`, `FilerWindow`, `FilerIcon`, `Window`, `Menu`, `MenuItem`, `SaveBox`, `Dialogue`, `ActionButton`, `DefaultActionButton`, `OptionIcon`, `CheckIcon`, `WritableIcon`, `Slider`, `TaskManager` and `ErrorBox`. |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["riscos"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `riscos-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-025 — BeOS pack

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** BeOS pack (F-3.C13, SRC-18#refs).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).

**R-PACK-025.TC-1 — The beos pack, automated**

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

**R-PACK-025.TC-M1 — The beos pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside BeOS R5 screenshots, for example the BeOS pages of the GUI Gallery (toastytech.com/guis), and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `beos` MUST imitate BeOS R5 (2000) with the Tracker and the Deskbar, with `framework` naming it, `version` "BeOS R5", and the import modules `BeOS`, `BeAPI`, `InterfaceKit` and `Tracker`, listed in the Retro group after `win95` (R-PACK-008.C9). |
| C2 | Its default device MUST be `desktop` at 1024 × 768 points, chrome `window` (the yellow tab) for `window` and `desktop` forms. |
| C3 | Its light tokens MUST use the BeOS defaults: the focused window's tab yellow `#FFCB00`, unfocused tabs light grey `#E8E8E8`, window panels and controls grey `#D8D8D8` with white and dark grey bevels, the desktop blue `#336698`, list selection a darker grey `#B8B8B8`, and text black in a Swiss-style sans font (`Swis721 BT` with sans-serif fallbacks); its dark tokens MAY repeat the light ones. |
| C4 | A window's title MUST sit in a tab only as wide as the title plus its boxes, at the top left of the window: the close box at the tab's left, the zoom box at its right, the tab yellow when the window has the focus. |
| C5 | The Deskbar MUST sit at the top right of the screen: the Be menu (the leaf logo) on top, the list of running applications below, and the clock and replicant tray beside the logo. |
| C6 | Controls MUST be drawn with the BeOS 3-D bevels: buttons rounded at their corners with the default button outlined in a darker frame, check boxes and radio buttons with a blue-grey mark, scroll bars with a knob carrying three grip lines, and pop-up menu fields with a down arrow. |
| C7 | Tracker windows MUST show their files in the list view with the column headers Name, Size and Modified, or as icons; `Alert` MUST show the info, idea, warning or stop icon at the left on a tinted strip with its buttons at the bottom right. |
| C8 | The pack MUST define at least `Desktop`, `Deskbar`, `DeskbarItem`, `BeMenu`, `Window` (with the tab), `TrackerWindow`, `DesktopIcon`, `BButton`, `BCheckBox`, `BRadioButton`, `BTextControl`, `BMenuField`, `BSlider`, `BStatusBar`, `BAlert`, `BTabView`, `BListView`, `BOutlineListView`, `BScrollBar`, `BColorControl`, `BBox` and `Workspaces`. |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["beos"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `beos-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-026 — Apple Newton pack

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** Apple Newton pack (F-3.C14, SRC-18#mobile).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).

**R-PACK-026.TC-1 — The newton pack, automated**

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `newton`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the screen background is `rgb(200, 204, 190)`; the `ButtonBar` is at the bottom of the screen with six items; a `Slip` has rounded corners and a border of at least 3 points (C4, C5, C6, C7).
4. The conformance case `newton-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["newton"]`
   and renders in the Examples tab without a diagnostic (C9).

**R-PACK-026.TC-M1 — The newton pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside Newton OS 2.1 screenshots on the MessagePad 2000/2100, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `newton` MUST imitate Newton OS 2.1 on the MessagePad 2000/2100 (1997), with `framework` naming it, `version` "Newton OS 2.1", and the import modules `Newton`, `NewtonOS` and `NewtonScript`, listed in the Mobile group after `android` (R-PACK-008.C9). |
| C2 | Its default device MUST be `phone` at 320 × 480 points (the 320 × 480 screen), chrome `none`, so that the generator files it under Mobile. |
| C3 | Its light tokens MUST use the MessagePad's greyscale LCD: background `#C8CCBE` (the grey-green screen), ink `#1A1A1A`, greys in four steps between them; its dark tokens MUST show the backlit screen (light ink on a dark blue-green `#1F3A33`). |
| C4 | The screen MUST end in the button bar along the bottom: Names, Dates, Extras, Undo, Find and Assist, each an icon above its name, and the keyboard and clock at the right. |
| C5 | The Notepad MUST show a lined note page whose notes are separated by a rule carrying the date at its left ("11/23"), text in the Newton system font and, through `Ink`, handwriting-like ink strokes; a folder tab ("Unfiled Notes") MUST sit at the top right. |
| C6 | A slip (a dialog) MUST be a floating box with a thick black border with rounded corners and a close box (an X in a circle) at its bottom right; a picker MUST be a label preceded by a diamond, opening a list with a border and a check mark on the chosen item. |
| C7 | Buttons MUST be rounded rectangles with a one-point border, check boxes squares, and the Extras drawer a grid of application icons with names, under a title bar with folder tabs. |
| C8 | The pack MUST define at least `Notepad`, `Note`, `NoteRule`, `Ink`, `ButtonBar`, `ButtonBarItem`, `ExtrasDrawer`, `AppIcon`, `FolderTab`, `Slip`, `CloseBox`, `Picker`, `TextButton`, `CheckBox`, `RadioButton`, `InputLine`, `Keyboard`, `StatusBar` and `DateHeader`. |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["newton"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `newton-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-027 — Palm OS pack

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** Palm OS pack (F-3.C14, SRC-18#mobile).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).

**R-PACK-027.TC-1 — The palm pack, automated**

New tests, written by the issue that builds the pack:

1. `python/tests/test_retro_packs.py` (one test class per pack): `palm`'s `pack.json` has the
   `framework`, `version` and import modules of C1, the default device, size and chrome of C2, the
   light and dark tokens of C3, and every element C8 names (C1, C2, C3, C8).
2. `test_packs.py` (every element renders), `gen_reference.py --check` (declared samples render without a
   diagnostic) and the gallery's every-pack test (R-WEB-004.TC-1) pass with the pack; the pack appears in
   its group at the place C1 names (R-PACK-008.TC-1 step 6) (C1, C9).
3. `typescript/tests/browser/retro-packs.spec.mjs` renders the pack's gallery example and its element
   samples and asserts, through computed styles and element geometry: the screen background is `rgb(184, 196, 168)`; a `FormTitle` is black with white text; the `SilkscreenArea` is below the 320 × 320 screen (C4, C5, C6, C7).
4. The conformance case `palm-screen` exists and both variants match it; `test_no_duplicated_css_runs`
   (R-PACK-018.TC-2) passes with the pack's stylesheet (C10).
5. The gallery example for the pack is listed in `shared/patterns/index.json` with `packs: ["palm"]`
   and renders in the Examples tab without a diagnostic (C9).

**R-PACK-027.TC-M1 — The palm pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside Palm OS 3.5 screenshots on the Palm V and the Palm OS emulator (POSE) skins, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `palm` MUST imitate Palm OS 3.5 on the Palm V (1999, 160 × 160 greyscale), with `framework` naming it, `version` "Palm OS 3.5", and the import modules `PalmOS`, `Palm` and `PalmPilot`, listed in the Mobile group after `newton` (R-PACK-008.C9). |
| C2 | Its default device MUST be `phone` at 320 × 440 points: the 160 × 160 screen at two points per pixel (320 × 320) above the silkscreen Graffiti area (120 points), chrome `none`. |
| C3 | Its light tokens MUST use the Palm V screen: background `#B8C4A8` (grey-green LCD), ink `#101010`, and two greys between them; its dark tokens MUST show the backlit screen (the inverted look of the Palm V backlight: light ink on dark). |
| C4 | A form MUST show its title in a black-filled tab at the top left with the title in white bold, a black rule continuing across the rest of the top, and the form's content below in the Palm system font. |
| C5 | The silkscreen area MUST show the Applications, Menu, Calc and Find icons at its corners and the Graffiti writing area with its letter and number halves, drawn as printed in dark grey on the case. |
| C6 | Buttons MUST be rounded rectangles with a one-pixel frame, push buttons groups of adjacent boxes with the selected one inverted, pop-up triggers a label followed by a down triangle, selector triggers dotted boxes, and fields underlined with a dotted line; menus MUST drop from the top over the title as a menu bar with one open menu, items with shortcut strokes at their right. |
| C7 | The Launcher MUST show application icons in a grid of four columns with names below, the category pop-up ("All") at the top right and the battery gauge in the title. |
| C8 | The pack MUST define at least `Form`, `FormTitle`, `Launcher`, `AppIcon`, `CategoryTrigger`, `Button`, `PushButton`, `PushButtonGroup`, `CheckBox`, `PopupTrigger`, `SelectorTrigger`, `Field`, `List`, `Table`, `ScrollBar`, `Alert`, `MenuBar`, `MenuItem`, `SilkscreenArea` and `Keyboard`. |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["palm"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `palm-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-028 — Windows CE (Pocket PC) pack

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** Windows CE (Pocket PC) pack (F-3.C14, SRC-18#mobile).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).

**R-PACK-028.TC-1 — The wince pack, automated**

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

**R-PACK-028.TC-M1 — The wince pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside Pocket PC 2002 screenshots and the Pocket PC 2002 emulator of eMbedded Visual Tools, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `wince` MUST imitate Pocket PC 2002 on Windows CE 3.0 (2001), with `framework` naming it, `version` "Pocket PC 2002", and the import modules `WindowsCE`, `PocketPC`, `WinCE` and `WindowsMobile`, listed in the Mobile group after `palm` (R-PACK-008.C9). |
| C2 | Its default device MUST be `phone` at 480 × 640 points (the 240 × 320 screen at two points per pixel), chrome `none`. |
| C3 | Its light tokens MUST use the Pocket PC 2002 default theme: navigation bar a dark blue gradient from `#0A246A` to `#3A6EA5` with white text, command bar light grey `#D6D3CE`, content white, selection `#0A246A` with white text, and Tahoma-like text (`Tahoma` with sans-serif fallbacks); its dark tokens MAY repeat the light ones. |
| C4 | The navigation bar MUST run across the top: the Start flag and the title at its left, then the connectivity and speaker icons and the time, and an `ok` or close (X) button in a circle at the right for dialogs and settings. |
| C5 | The Start menu MUST drop from the Start flag as a white list with a row of recently used icons, the program names with their icons, and Programs, Settings, Find and Help below a separator. |
| C6 | The Today screen MUST show the date with the owner's name, then the Calendar, Inbox and Tasks summary rows, each with its icon, over a background picture or white. |
| C7 | The command bar MUST run along the bottom with New, the menu names and the input-panel (keyboard) button at its right; tabbed forms MUST show their tabs at the bottom of the form, above the command bar. |
| C8 | The pack MUST define at least `NavigationBar`, `StartMenu`, `TodayScreen`, `TodayItem`, `CommandBar`, `CommandBarMenu`, `InputPanel`, `OkButton`, `TabControl`, `ListView`, `TreeView`, `MessageBox`, `Notification`, `Button`, `CheckBox`, `RadioButton`, `Edit`, `ComboBox`, `DateTimePicker` and `ScrollBar`. |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["wince"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `wince-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

---

### R-PACK-029 — BlackBerry pack

**Requires:** R-PACK-008, R-PACK-013, R-PACK-018

**Requirement.** BlackBerry pack (F-3.C14, SRC-18#mobile).

**Verification.** TC-1 (automated: definition, tokens, rendering, generated reference and gallery,
conformance, key colours and parts), TC-M1 (visual comparison with the real system).

**R-PACK-029.TC-1 — The blackberry pack, automated**

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

**R-PACK-029.TC-M1 — The blackberry pack looks like the real system**

Manual, once per issue that builds or changes the pack: open the pack in the gallery (Elements and
Examples, light and dark) beside BlackBerry OS 5 Precision theme screenshots on the Bold 9700, and confirm each part C4, C5, C6, C7 describes is recognisable;
record any difference in the issue as a finding (fixed in the same issue, or a follow-up bug citing the
clause).

**Realizes.** F-3

| | Statement |
|---|---|
| C1 | The pack `blackberry` MUST imitate BlackBerry OS 5 on the BlackBerry Bold 9700 (2009) with its default Precision theme, with `framework` naming it, `version` "BlackBerry OS 5.0", and the import modules `BlackBerry`, `BlackBerryOS` and `RIM`, listed in the Mobile group after `wince` (R-PACK-008.C9). |
| C2 | Its default device MUST be `phone` with the size 480 × 360 points (the Bold's landscape screen), chrome `none`. |
| C3 | Its light tokens MUST use the Precision theme: home screen and banner dark (`#1B1B1B` to `#3A3A3A` gradient), lists white with black text, the focus highlight a blue gradient from `#2F7BC9` to `#1A4F8B` with white text, and text in a BBAlpha-like sans (`BBAlpha Sans` with sans-serif fallbacks); its dark tokens MAY repeat the light ones. |
| C4 | The banner MUST run across the top: the carrier name, the date and time at the left, and the signal, connection type and battery indicators at the right; the home screen MUST show a dock row of application icons (or the full grid of icons) over the wallpaper, the focused icon framed by the highlight with its name above the dock. |
| C5 | Lists MUST show one row per item with a thin separator, the focused row in the blue highlight; there is no touch: focus is shown by the highlight alone. |
| C6 | The menu (the BlackBerry key) MUST open as a full-height list at the right of the screen, items with their icons, the focused one highlighted; dialogs MUST be centred boxes with an icon, the message and a vertical stack of buttons. |
| C7 | Choice fields MUST show their value between angled brackets or with a down arrow, check boxes as square boxes with a tick, and edit fields with a thin underline or box. |
| C8 | The pack MUST define at least `HomeScreen`, `Banner`, `Dock`, `AppIcon`, `IconGrid`, `TitleBar`, `ListField`, `ListRow`, `MenuPopup`, `MenuItem`, `Dialog`, `ButtonField`, `CheckboxField`, `ObjectChoiceField`, `EditField`, `LabelField`, `SeparatorField`, `Indicator` and `ActivityIndicator`. |
| C9 | The pack MUST declare a `sample` (R-PACK-013.C1) for each of its own elements whose generic sample would show nothing of its job, and the gallery MUST show at least one complete example of the system (a pattern of `shared/patterns/` with `"packs": ["blackberry"]`, R-WEB-004.C14). |
| C10 | Rules the pack shares with another pack's stylesheet MUST come from a stylesheet partial (R-PACK-018.C9), and the conformance corpus MUST hold a case `blackberry-screen` rendering the example of the previous clause (R-REPO-004.C2). |
| V1 | The pack's elements all render without a diagnostic, its reference page and gallery entry are generated, and its key colours and parts are present. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.11.0 | 2026-11-27 | Page created (SRC-18) |
