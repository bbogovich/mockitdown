---
id: SRC-18
title: "Request: answers to the audit questions, pack stylesheet duplication, gallery home page and easter eggs, more retro and classic mobile packs"
recorded: 2026-11-27
---

The developer's answers to the definition and specification audit (#47, #51) and the request that
followed, verbatim. The attached screenshot (Image #1) is kept as `assets/SRC-18-win1.png`.

<a id="answers"></a>

> Auditor Questions
>
> 1. Record all packs
> 2. Annotations are callouts for when a design is presented in a doc.  These will be added either in the designer tool or in one of the specitout apps as part of design refinement.
> 3. We want to clarify using node built in http to stop an implementing agent from trying to import an unnecessary framework.  Deliberate constraints.
> 4. Shared
> 5. Backfill, we need test cases defined.  This is a rapid prototype project so backfill of test cases will be a frequent issue that needs refined in the vibeitout skills
> 6. yes

<a id="health"></a>

> Red Health
> This is a special case due to the scale of the UI component libraries, but if there is pure duplication we should be using CSS imports to include common definitions so that they are defined once.  So both raise limits and migrate shared rules to base pack.

<a id="gallery"></a>

> The scifi packs need to be accessible in the gallery, but as they are easter eggs shouldn't be in the main list.  Add a home page to the gallery, with explanation of what the gallery is for, that it uses the typescript renderer, quick note on using the TS code in a project (note - we will need to publish release builds on github with the packaged typescript library build), and include something in the home page that would link to the gallery for each of the scifi interfaces.

<a id="packs"></a>

> Add packs for Amiga, the early garish looking Windows 1 [Image #1], expand on the IIGS some good examples here http://toastytech.com/guis/gsos.html, look for a few more retro / obscure examples that could be used this has some good conent http://toastytech.com/guis/guitimeline.html

<a id="mobile"></a>

> Also include Palm, Blackberry, Windows CE, Newton in mobile category.

<a id="image1"></a>

**Image #1** (`assets/SRC-18-win1.png`, 640 × 350): Windows 1.0 with Calendar and Cardfile tiled. Colours
read from its pixels: menu bars yellow `#FCFC54` with black text; caption bars blue `#5454FC`, the active
one with a black and white dot pattern and its title in white on a black field; window frames and rules
black `#000000`; client areas white `#FCFCFC`; the scroll bar track red `#FC5454` with a white thumb and
white arrow boxes outlined in black; the selected calendar day inverted (white on black); the desktop
behind the tiles a blue and cyan `#54FCFC` checkerboard; an application's empty workspace solid blue
`#5454FC`; the icon area along the bottom a cyan and green `#54FC54` checkerboard. These are the EGA
palette's light colours (`#55FFFF` etc.) as the capture recorded them.

<a id="refs"></a>

**Pages the request points to, read on 2026-11-27.**
- `http://toastytech.com/guis/gsos.html` ("GS/OS for the Apple IIgs", System 6.0.1): the boot screen
  with the icons of loaded extensions in the lower left; the Launcher (a lightweight program starter on
  application disks without the Finder); the Finder with the Apple menu holding desk accessories and the
  Control Panel, one menu bar, drive icons down the right of the desktop (one per 5.25" drive whether or
  not a disk is in it, 3.5" drives, the RAM disk) and the Trash; file icons placed on the desktop with
  Put Away; aliases; monochrome icons and folders given colours; the desk accessories Calculator,
  on-screen Keyboard and a file finder; the Control Panel window of control panel items; the Teach text
  editor (several fonts, sizes and styles); the shut-down screen.
- `http://toastytech.com/guis/guitimeline.html` (pages 1 to 4): Alto 1973, Perq 1980, Xerox Star 1981,
  Lisa and Visi On 1983, Macintosh, GEM (Digital Research, later the Atari ST) and X 1984, GEOS
  (Commodore 64, later Apple II), Amiga Workbench 1.0 and Windows 1.0 (tiled windows, an icon area at the
  bottom) 1985, GEM's two fixed windows and Tandy DeskMate 1986, Macintosh II, Windows 2.03, Acorn
  Arthur (the basis of RISC OS) and the Apple IIGS Finder 1987, OS/2 1.1 Presentation Manager and NeXT
  1988, Amiga Workbench 2 (new 3-D effects), Windows 3.0 and PC/GEOS 1990, OS/2 2.0 Workplace Shell,
  Windows 3.1, DESQview/X and Amiga Workbench 3 1992, Windows NT 1993, QNX Photon 1994, Windows 95 and
  BeOS 1995, OS/2 Warp 4 1996, Mac OS 8 1997, then Windows 98, KDE, GNOME, Aqua and later systems.
