**Problem.** A wireframe does not show what the user will see; one hand-made style per project
does not scale to the frameworks teams actually use.

**Change.** A *pack* captures one framework: its component names, its colours and typography for
light and dark mode, its window or device chrome and its stylesheet. mockitdown ships packs for
SwiftUI, Fluent (WinUI 3), Material UI, Angular Material, SAPUI5 (Fiori), Bootstrap and shadcn/ui,
on top of a neutral wireframe pack every other pack extends.

**Fidelity of the SwiftUI pack (SRC-9).** Each style variant must look like the native style it
names; a variant that renders as the default with a different label misleads the reviewer.

**All shipped packs (SRC-18#answers).** C2 once named only the first eight packs; later requests added
desktop, mobile and web frameworks (SRC-4, SRC-6, SRC-7), retro systems (SRC-5, SRC-6) and science-fiction
easter eggs (SRC-4, SRC-5). C2, C8 and C9 now record every pack that ships. The easter eggs are their own
capability because they behave differently: they render when named but are never listed — a reward for
readers who explore (SRC-4).

**More history, and phones before the iPhone (SRC-18#packs, SRC-18#mobile).** The Amiga Workbench, a
Windows 1.0 pack in the garish default colours of its time (the developer's screenshot, SRC-18#image1),
a much fuller GS/OS pack (from the screens of SRC-18#refs), and four systems from the GUI timeline with a
look nobody confuses with another: Atari ST GEM (green desktop, 1985), GEOS on the Commodore 64 (1986),
Acorn RISC OS (the icon bar, 1987/1992) and BeOS (yellow title tabs, 1995). OS/2 Warp 4, DeskMate and
Visi On were considered and left for later: OS/2 and DeskMate resemble the Windows packs already shipped,
and Visi On is mostly text. The handhelds — Newton, Palm OS, Windows CE and BlackBerry — join the Mobile
group because they are phones and PDAs, not desktops.

**Shared rules written once (SRC-18#health).** Packs that imitate related systems (the Lisa and the
Macintosh, for example) share many drawing rules. Those rules live in one shared stylesheet that each
pack includes, rather than in copies that drift apart.

