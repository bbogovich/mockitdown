---
id: SRC-16
title: "designer-ING-1.plan"
recorded: 2026-11-26
file: "designer-ING-1.plan.md"
---

> ---
> id: ING-1.plan
> batch: ING-1
> sources: [SRC-1, SRC-2, SRC-3, SRC-4, SRC-5]
> written: 2026-11-26
> author: agent:planner
> status: proposed
> ---
>
> # ING-1 plan: the MockItDown Designer desktop shell
>
> ## Scope and citation conventions
>
> - This repository builds **only milestone 7** of the delivery plan (SRC-2#s17): the Electron shell of
>   SRC-2#s14 (windows, menus, files SRC-2#s11, autosave and recovery, export, security, packaging) and its
>   Electron tests (SRC-2#s16 "Application tests"). Editing behaviour lives in mockitdown (SRC-2#s3, SRC-1);
>   no issue below implements it. Milestones 1-6 are listed under "Work for the mockitdown queue" for that
>   repository's vibe-plan.
> - Language: TypeScript, `tsc` only, no bundler. Dependencies: electron, mockitdown (local path
>   `~/Documents/Projects/Dev/DevTools/mockitdown/typescript` while both are in development), and dev-only
>   electron-builder, @playwright/test, typescript (SRC-2#s14 "Dependencies"). No UI framework, state library,
>   editor library or icon font.
> - **Anchors.** SRC-2 is an HTML asset without pages or heading ids, so it is cited by its numbered section:
>   `SRC-2#s14` = section 14, `SRC-2#s6.3` = subsection 6.3. The mockups SRC-3..5 are one page each and are
>   cited by callout number: `SRC-3#p1.c4` = SRC-3, callout 4.
> - **Current state used for staging** (verified 2026-11-26): mockitdown 0.1.0 has milestone 0 only (core
>   parse + render, read-only `<mockitdown-mockup>` with fence-option attributes, `<script type="text/mockitdown">`
>   child, the `mockitdown-diagnostics` event, `code`/`diagnostics`/`rendered`; `dist/shared/` assets loaded by
>   `fetch` relative to `import.meta.url`). This repo is the electron-app template: JS samples in `src/core`,
>   `src/main`, `src/renderer`; Electron 45.5.0 installed; `npm test` = `node --test src/core`. Definition,
>   design and specification are empty; no issues, no queue.
> - Stages S1-S5 deliver a usable app on what exists today. S6 is packaging. S7-S8 integrate the design-tool
>   components as mockitdown ships them; each of their issues names the mockitdown milestone it waits on
>   (cross-project dependency `mockitdown#<n>`, filled in once mockitdown's vibe-plan has filed that
>   milestone's issues; no mockitdown issue numbers are invented here).
> - **Order change from the brief:** packaging comes before integration (S6), because it depends on nothing in
>   mockitdown and the notarisation and XProtect risk (SRC-2#s14 "Packaging") is best found early; the
>   integration stages would otherwise sit at the end of the queue blocked by another project anyway.
>
> ## Definition candidates (new features)
>
> Each is defined through vibe-change before its issues are filed (define, then design, then specify). The
> families and AC outlines below are proposals; vibe-plan writes them.
>
> | ID (proposed) | Family | Feature | AC outline | Sources |
> |---|---|---|---|---|
> | F-1 | shell | Sandboxed desktop shell: runs the mockitdown components in a locked-down window with no remote content and only named file operations | contextIsolation, sandbox, no nodeIntegration; strict CSP; bridge exposes only open/save/saveAs/export/recent; navigation and new windows refused | SRC-2#s3, SRC-2#s14 "Security", SRC-1 |
> | F-2 | documents | Design document files: `.mkdesign` read and write, stable key order, verbatim code; open a `.mockitdown` file as a one-mockup document; import a Markdown file's fences | save-reopen yields byte-identical file; `.mockitdown` opens named after the file; Markdown with three fences opens three mockups and offers to save as `.mkdesign` | SRC-2#s11 |
> | F-3 | documents | Document windows: one window per document, title with name and edited marker, size and position restored, recent documents, opening by double-click (file association) | | SRC-2#s14 "Documents and windows" |
> | F-4 | preview | Previewing a document's named mockups exactly as `<mockitdown-mockup>` renders them, with light, dark or both appearances, and a mockups list for navigation | | SRC-2#s4 "Modes" (Preview), SRC-2#s10 (names), SRC-2#s12 |
> | F-5 | export | Export to Markdown (fences in canvas order, sections as headings), a folder of files with `index.json`, standalone HTML, PNG at 1x/2x/3x | | SRC-2#s11 "Export" |
> | F-6 | documents | Autosave to a recovery file every 30 s, never over the document; recovery offered after a crash | | SRC-2#s14 "Autosave and recovery" |
> | F-7 | shell | Menus and keyboard shortcuts (File, Edit, Insert, Arrange, View, Mockup, Help) | each shortcut of SRC-2#s8 and SRC-2#s10 reaches its command; commands not yet available are disabled | SRC-2#s14 "Menus", SRC-2#s8, SRC-2#s10 |
> | F-8 | editing-host | Visual editing in the app: hosts `<mockitdown-designer>`, hands it the document, and treats its `mockitdown-change` as an edit (dirty marker, autosave) | | SRC-2#s3, SRC-2#s12, SRC-3, SRC-4, SRC-5 |
> | F-9 | distribution | Installable, signed packages for macOS (notarised), Windows and Linux, on the latest stable Electron | | SRC-2#s14 "Packaging" |
> | F-10 | interim | (Only if Q3 is answered yes) Interim code editing per mockup in a plain text area with live re-render and diagnostics, until `mockitdown-code` exists; retired in S8 | | SRC-2#s9 (re-parse after 300 ms, diagnostics), SRC-2#s17 note "hosting whatever components exist" |
>
> Personas (both `assumed`, evidence SRC-2#s2): PER-1 UX designer, PER-2 developer / spec author. SpecItOut
> tooling and mockitdown maintainers (SRC-2#s2) are actors, not personas.
>
> Dependency record: `.specitout/sdd.json` lists all five dependencies with `evaluated: false`; the evaluation
> the global rules require (complexity, stability, tree, use, licence) is mostly in SRC-2#s14 "Dependencies"
> and is recorded as `M-` items in S1 issue D1.
>
> ## Design candidates
>
> Area codes to add to `design/areas.md`: `APP` (windows, menus, modes), `DOC` (documents, files, recovery),
> `EXP` (export), `EDT` (editing views; see Q13).
>
> | Item | Owner of what is drawn | Serves | Source | Stage |
> |---|---|---|---|---|
> | APP-1 App structure: W one window per document; V modes Design, Preview, Code; N menus; R panels resizable and collapsible, sizes kept per window | shell (W, N); mockitdown-designer (V panels, from S7) | F-3, F-7, F-8 | SRC-2#s4, SRC-2#s14 | S2, S5 |
> | SCR-APP-01 Main window: frame, title with document name and edited marker, centre content | shell frame; content rendered by `<mockitdown-designer>` from S7 (toolbar, outline, gallery, canvas, inspector, status bar: SRC-3#p1.c1-c6) | F-3, F-8 | SRC-3, SRC-2#s4 | S2 (frame), S7 (content) |
> | SCR-APP-02 Interim preview window: mockups list, read-only preview, appearance toggle, (Q3) code area, status bar with diagnostic count | shell, using `<mockitdown-mockup>`; **interim**, superseded by SCR-APP-01 content in S7-S8 | F-4, F-10 | SRC-2#s4 "Modes" (Preview), SRC-2#s10 | S3 |
> | DLG-DOC-01 Open / Save As (native dialogs, `.mkdesign`, `.mockitdown`, `.md` filters) | shell (OS dialogs) | F-2 | SRC-2#s11 | S2 |
> | DLG-DOC-02 Markdown import: offer to save as `.mkdesign` | shell | F-2 | SRC-2#s11 last paragraph | S2 |
> | DLG-DOC-03 Recovery offer on launch | shell | F-6 | SRC-2#s14 | S4 |
> | DLG-DOC-04 Remote images: placeholders, allow for this document | shell bar; placeholders drawn by mockitdown (see mockitdown work list) | F-1 | SRC-2#s14 "Security" | S3 (Q4) |
> | DLG-EXP-01 Export options: format; PNG scale 1x/2x/3x, active mockup or selection | shell | F-5 | SRC-2#s11 "Export" | S4 |
> | SCR-EDT-01 Design mode, SCR-EDT-02 Inserting, SCR-EDT-03 Canvas | **rendered entirely by mockitdown components**; recorded here only as `LIB-1` "mockitdown design-tool components" with one `E` per component (SRC-2#s12 table), unless Q13 says otherwise | F-8 | SRC-3, SRC-4, SRC-5, SRC-2#s5-s10 | S7-S8 |
>
> Use cases (each with persona, flow, screens): UC-DOC-01 create, save and reopen a document; UC-DOC-02 open
> a `.mkdesign` or `.mockitdown` file (menu, recent list, double-click); UC-DOC-03 import a Markdown file;
> UC-DOC-04 recover after a crash; UC-EXP-01 export a document; UC-APP-01 preview a document's mockups.
> FL-DOC-01 "open any file" covers the three file kinds.
>
> ## Stages
>
> ### S1 Toolchain and walking skeleton
>
> Goal: a TypeScript Electron app built by `tsc`, locked down, tested by Playwright through Electron, showing
> one mockup rendered by mockitdown.
> Exit check: `npm run build && npm test` passes from a clean checkout; the Electron test launches the app and
> sees a `<mockitdown-mockup>` whose `rendered` is true with zero diagnostics; the security test finds
> `contextIsolation`, `sandbox`, no `nodeIntegration`, and a refused navigation to a remote URL.
> Features: F-1 (SRC-2#s14 "Security", SRC-2#s3), F-8 groundwork (dependency only).
>
> | Draft | Title | Type | Scope | depends-on | Priority |
> |---|---|---|---|---|---|
> | D1 | Convert the template to TypeScript built by tsc | feature (label `refactor`) | `src/main`, `src/preload`, `src/renderer`, `src/core` as `.ts` compiled to `dist/` with one tsconfig per process kind; `npm run build/start/test`; record the five dependency evaluations as M- items | none | high |
> | D2 | Electron Playwright harness | feature | `@playwright/test` with `_electron.launch` in `tests/`; `npm test` runs node:test core tests then Electron tests; one smoke test (window opens, title) | D1 | high |
> | D3 | Security baseline: app protocol, strict CSP, navigation lock | feature | serve renderer and packaged assets over a privileged custom scheme (mockitdown fetches `dist/shared/` with `fetch`, which a sandboxed `file://` page may not do); CSP with no remote origins (verify whether mockitdown's `<style>` fallback needs `style-src` beyond constructable sheets); deny permissions, `will-navigate`, `window.open`; test | D1, D2 | high |
> | D4 | mockitdown as a local path dependency, rendering a sample mockup | feature | `"mockitdown": "file:…/mockitdown/typescript"`; renderer imports `mockitdown` from the app scheme; window shows one built-in sample `<mockitdown-mockup>`; Electron test asserts `rendered` and no diagnostics | D3 | high |
>
> ### S2 Document model and files
>
> Goal: open, edit nothing yet, save and reopen design documents; one window per document.
> Exit check: Electron tests open a `.mkdesign`, a `.mockitdown` and a Markdown file with three fences; saving
> and reopening the `.mkdesign` gives a byte-identical file; two documents give two windows whose titles show
> their names; reopening the app restores window bounds and lists both in Open Recent.
> Features: F-2 (SRC-2#s11), F-3 (SRC-2#s14 "Documents and windows").
>
> | Draft | Title | Type | Scope | depends-on | Priority |
> |---|---|---|---|---|---|
> | D5 | Design document model: read, validate and write `.mkdesign` | feature | pure core module (no DOM, no Electron): `format`/`version` check, the SRC-2#s11 keys, stable key order, code kept verbatim, unknown keys preserved, readable errors; node:test with fixtures (see Q1) | D1 | high |
> | D6 | Import `.mockitdown` files and Markdown fences as documents | feature | core: a `.mockitdown` file becomes a one-mockup document named after the file; each ```mockitdown fence of a Markdown file becomes a mockup (name from the fence `id`/`title`, else a default name, Q16), placed in the next free slot to the right (SRC-2#s10) | D5 | high |
> | D7 | File bridge and native dialogs: New, Open, Save, Save As | feature | `files.ts` in main, `preload.ts` exposing only `openFile`, `saveFile`, `saveAs` (and later `export`, `recent`); validated IPC; filters for `.mkdesign`, `.mockitdown`, `.md`; atomic write (temp file then rename) | D3, D5, D6 | high |
> | D8 | One window per document, with name and edited marker | feature | `windows.ts`: a window per open document, focusing the existing window when a file is opened twice; title = document name; edited marker (macOS `documentEdited`/`representedFilename`, a title marker elsewhere); close and quit with unsaved changes (Q8) | D7 | high |
> | D9 | Recent documents and window bounds restore | feature | recent list in app data plus the OS list (`app.addRecentDocument`); window size and position restored (Q5); `open-file` (macOS) and `second-instance` argv handling, the groundwork for the file association in S6 | D8 | medium |
> | D10 | Markdown import offers to save as `.mkdesign` | feature | an imported Markdown document opens untitled; Save goes to Save As with a `.mkdesign` name proposed (DLG-DOC-02); the Markdown file is never overwritten | D7 | medium |
> | D11 | Electron tests for opening and saving the three file kinds | feature | SRC-2#s16: opening Markdown with three fences; open-save-reopen round trip; two windows | D8, D10 | medium |
>
> ### S3 Preview-level app on `<mockitdown-mockup>`
>
> Goal: a usable viewer, and (Q3) an interim editor, built only on the read-only element.
> Exit check: a three-mockup document shows its mockups list and each mockup rendered in its pack and options;
> light, dark and both appearances switch; (if Q3 yes) typing in the code area re-renders after 300 ms, an
> unbalanced brace shows a diagnostic count in the status bar, and the window shows the edited marker.
> Features: F-4 (SRC-2#s4 Preview, SRC-2#s10, SRC-2#s12), F-10 (SRC-2#s9), F-1 (SRC-2#s14 remote images).
> All S3 screens are SCR-APP-02, marked interim, superseded in S7-S8.
>
> | Draft | Title | Type | Scope | depends-on | Priority |
> |---|---|---|---|---|---|
> | D12 | Interim preview window: mockups list and read-only preview | feature | renderer (web components + CSS, no framework): mockups list (names, warning on default names such as "Mockup 3", SRC-2#s10), each mockup as a `<mockitdown-mockup>` with its `options` as attributes and its code as a script child; clicking a name reveals it; marked interim | D4, D7 | high |
> | D13 | Appearance toggle: light, dark, both | feature | view setting applied to every preview (SRC-2#s4 "Modes", Preview); kept per window | D12 | medium |
> | D14 | Component imports resolved from the document's folder | feature | the document's `imports` (SRC-2#s11) and `import` statements resolved against the document's folder through the main process (scoped read-only route of the app scheme), so previews of documents that use components render | D12 | medium |
> | D15 | Remote images: placeholders unless allowed for the document | feature | CSP blocks remote images; placeholders and the per-document allowance per Q4; waits on the mockitdown placeholder option if Q4 picks it (mockitdown work item W1.9) | D12 | low |
> | D16 | Interim code area per mockup, with live re-render and diagnostics (only if Q3 = yes) | feature | plain `<textarea>` for the active mockup; re-render 300 ms after typing stops (SRC-2#s9); diagnostic count in a status bar from `mockitdown-diagnostics`; edits mark the document edited; labelled interim; retired by D37 | D12, D8 | medium |
> | D17 | Interim mockup commands: new, rename, delete (only if Q3 = yes) | feature | new mockup in the next free slot; rename refuses a taken name (names unique, case-sensitive, spaces allowed, SRC-2#s10); kept minimal, retired by D38 | D16 | low |
>
> ### S4 Export, autosave and recovery
>
> Goal: everything a document holds can leave the app; nothing is lost in a crash.
> Exit check: Electron tests export Markdown and build it with the Python mockitdown in strict mode (Q9);
> export the folder and compare `index.json`; open the HTML export in a fresh window and see every mockup
> rendered; PNG files at 1x, 2x, 3x have the expected pixel sizes; killing the app after an edit and relaunching
> offers the recovery, and the document file is unchanged.
> Features: F-5 (SRC-2#s11 "Export"), F-6 (SRC-2#s14 "Autosave and recovery").
>
> | Draft | Title | Type | Scope | depends-on | Priority |
> |---|---|---|---|---|---|
> | D18 | Canvas order and Markdown export | feature | core: order top-to-bottom, then left-to-right, within sections; one ```mockitdown fence per mockup with the name in `id` and `title`, a heading per section; export command and Save dialog | D5, D7 | high |
> | D19 | Export to a folder of files with `index.json` | feature | `<name>.mockitdown` per mockup plus `index.json` with names, positions and options; file-name mapping for names that are not safe file names (Q7) | D18 | medium |
> | D20 | Export to standalone HTML | feature | a page with every mockup rendered by `<mockitdown-mockup>` (Q6 decides single file or page plus assets) | D18 | medium |
> | D21 | Export to PNG at 1x, 2x, 3x, with the export dialog | feature | the active mockup (a selection once the canvas exists, D40) captured with `webContents.capturePage` from an offscreen window at the chosen scale; DLG-EXP-01 | D12, D18 | medium |
> | D22 | Autosave to a recovery file every 30 s | feature | `autosave.ts`: dirty documents written to `userData/recovery/` every 30 s, never over the document; removed on save or clean close | D8 | high |
> | D23 | Recovery offered after a crash | feature | at launch, recovery files left over are offered (DLG-DOC-03): restore into an untitled-edited window bound to the original path, or discard | D22 | high |
> | D24 | Electron tests: export and recovery | feature | SRC-2#s16: export to Markdown then a strict build with the Python mockitdown; autosave recovery after a killed process | D18, D23 | medium |
>
> ### S5 Menus and shortcuts
>
> Goal: the full menu bar of SRC-2#s14, every shortcut of SRC-2#s8 and SRC-2#s10 assigned, wired to what exists.
> Exit check: the Electron test drives File New, Open, Save, Save As and Export, View modes and appearance by
> shortcut; every command not yet implemented is present and disabled; Cut, Copy, Paste and Undo still work
> inside text fields.
> Features: F-7 (SRC-2#s14 "Menus", SRC-2#s8, SRC-2#s10).
>
> | Draft | Title | Type | Scope | depends-on | Priority |
> |---|---|---|---|---|---|
> | D25 | Menu bar with the full command and shortcut set | feature | `menu.ts`: File, Edit, Insert, Arrange, View, Mockup, Help as in SRC-2#s14, accelerators from SRC-2#s8 (Del/Backspace, Cmd/Ctrl+D, X/C/V, Alt+Up/Down, Cmd/Ctrl+G, Shift+Cmd/Ctrl+G, Z, Shift+Z) and SRC-2#s10 (Cmd/Ctrl+plus/minus/0/1, Shift+2); unimplemented items disabled; macOS app menu | D8 | medium |
> | D26 | Per-window command state | feature | the focused window's renderer reports which commands are available (mode, active mockup, selection) and the menu enables or disables accordingly; text-field edit roles pass through | D25 | medium |
> | D27 | Wire File, View and Mockup commands to the existing behaviour | feature | File (New, Open, Open Recent, Save, Save As, Export submenu, Close), View (Preview, appearance), Mockup (New, Rename, Delete if D17 exists); Design and Code modes disabled until S7/S8 (or Code to the interim area, Q3) | D26, D18, D12 | medium |
> | D28 | Electron tests: menu shortcuts | feature | SRC-2#s16 "menu shortcuts" for every enabled command | D27 | low |
>
> ### S6 Packaging
>
> Goal: installable builds that open `.mkdesign` files by double-click.
> Exit check: `npm run dist` produces a macOS app that launches (not removed by XProtect), and installers for
> Windows and Linux; double-clicking a `.mkdesign` file opens it in the app; the macOS build passes notarisation
> when the credentials are present (Q10).
> Features: F-9 (SRC-2#s14 "Packaging"), F-3 (file association, SRC-2#s14 "Documents and windows").
>
> | Draft | Title | Type | Scope | depends-on | Priority |
> |---|---|---|---|---|---|
> | D29 | electron-builder configuration for macOS, Windows and Linux | feature | app id, product name, `files` limited to `dist/` and the mockitdown assets, targets (dmg, nsis, AppImage/deb per Q10); latest stable Electron and an upgrade note | D4 | medium |
> | D30 | `.mkdesign` file association and document type | feature | `fileAssociations` (macOS UTI and document type, Windows ProgId, Linux MIME type); opening through D9's handlers | D29, D9 | medium |
> | D31 | macOS hardened runtime, signing and notarisation | feature | entitlements, hardened runtime, notarisation from environment credentials (none in the repo); unsigned local builds still work | D29 | medium |
>
> ### S7 Visual editing, part 1 (mockitdown milestones 2-3)
>
> Goal: Design mode in the app: the outline, the editable view and insertion, hosted from mockitdown.
> Exit check: the Electron test New, insert, save, reopen passes (SRC-2#s16); an edit in the designer shows the
> edited marker and is autosaved.
> Features: F-8 (SRC-2#s3, SRC-2#s12, SRC-3, SRC-4), F-7 (Insert menu).
>
> | Draft | Title | Type | Scope | depends-on | Waits on mockitdown | Priority |
> |---|---|---|---|---|---|---|
> | D32 | Host `<mockitdown-designer>` in the main window | feature | replace the interim preview with the designer element loaded as `pages/designer.html` does (SRC-2#s12), with the document passed by `open(json)` and saved through `toJSON()`; Preview mode passes to its `mode`; panel sizes kept per window | D12, D7 | M2 (`mockitdown-designer`, editor, outline, designer test page) | high |
> | D33 | Document edits from the designer: edited marker and autosave | feature | `mockitdown-change` marks the document edited and schedules the autosave; `mockitdown-rename` updates the mockups list warning | D32, D22 | M2 (events, SRC-2#s12) | high |
> | D34 | Edit menu: Select Parent | feature | menu item and Esc shortcut reach the designer's selection API | D32, D26 | M2 (selection, SRC-2#s5) | medium |
> | D35 | Insert menu by category, mirroring the gallery | feature | menu built from the role categories and the gallery's filter for the selection; disabled entries for what is not allowed | D32, D26 | M3 (gallery `insert` event, role rule table from M1) | medium |
> | D36 | Electron test: New, insert, save, reopen | feature | SRC-2#s16 first application test | D35 | M3 | medium |
>
> ### S8 Visual editing, part 2 (mockitdown milestones 4-6)
>
> Goal: the full editor: structure commands and undo, the code view, the canvas of named mockups; interim parts
> retired.
> Exit check: every menu item of SRC-2#s14 is enabled where its precondition holds; Design, Preview and Code
> modes all come from mockitdown; a three-mockup document with a section saves, reloads and compares equal;
> PNG export of a selection works; the interim code area and mockup commands are gone.
> Features: F-8, F-7, F-5 (PNG of a selection), F-10 retired.
>
> | Draft | Title | Type | Scope | depends-on | Waits on mockitdown | Priority |
> |---|---|---|---|---|---|---|
> | D37 | Edit and Arrange menus to the designer's commands; undo per document | feature | Undo, Redo, Cut, Copy, Paste, Duplicate, Delete, Wrap, Unwrap, Move Up/Down, Convert, Extract Component (SRC-2#s8) | D32, D26 | M4 | high |
> | D38 | Code mode from `mockitdown-code`; retire the interim code area | feature | View Code and the docked code view (SRC-2#s4); removes D16 | D32 | M5 | high |
> | D39 | Canvas: View zoom and Mockup menu to `mockitdown-canvas`; retire the interim mockups list | feature | zoom, fit all, fit selection, 100 % (SRC-2#s10); Mockup New, Rename, Duplicate, Delete, Pack, Device; `view` and `sections` round-trip through `toJSON()`; removes D17 | D32, D27 | M6 | high |
> | D40 | PNG export of a selection of mockups | feature | DLG-EXP-01 "selection" enabled from the canvas selection | D39, D21 | M6 | medium |
> | D41 | README manual review script | feature | SRC-2#s16: Figure 2's flow in each mode, at three zoom levels, in light and dark | D39 | M6 | low |
>
> Totals: 8 stages, 41 issue drafts (39 if Q3 drops D16 and D17).
>
> ## Amendments to open issues
>
> None: the project has no issues yet (`sio issues list` and `sio issues queue` are empty).
>
> ## Reuse
>
> | What | Path | Stage | Basis |
> |---|---|---|---|
> | Template main, preload, renderer and core samples (secure `webPreferences` already set) | `src/main/main.js`, `src/main/preload.js`, `src/renderer/*`, `src/core/title.js` | S1 (D1, converted, not rewritten) | the brief; SRC-2#s14 "Security" |
> | mockitdown package: `<mockitdown-mockup>`, `loadAssetsFromUrl`, `dist/shared/` | `~/Documents/Projects/Dev/DevTools/mockitdown/typescript` (local path dependency) | S1 (D4), S3 | SRC-2#s3, SRC-2#s14 "Dependencies" |
> | mockitdown's designer test page as the model for the host page | `typescript/pages/designer.html` (does not exist yet; M2) | S7 (D32) | SRC-2#s12 last paragraph |
> | Playwright conventions of the mockitdown repository | `~/Documents/Projects/Dev/DevTools/mockitdown/typescript/playwright.config.mjs` | S1 (D2) | SRC-2#s14 "Dependencies" ("the same harness") |
> | Design document and mockups (stay where they are on `main`) | `docs/design/design.src.html`, `docs/design/mockups/*.mockitdown`, `docs/design/build.py` | design tier mockups for SCR-APP-01 and LIB-1 (vibe-plan) | SRC-2#s14 "Structure" |
> | MockItOut presentation decisions (three panes 240/260 px, outline rows, inspector field style, selection token, form factor) | `MockItOut/prototype/MockItOut/designer-py`, `designer/` | not this repo: they go to mockitdown's components (M2-M4); the 240/260 px widths may guide the interim D12 layout | SRC-2#s15 |
> | MockItOut Electron packaging config (hardened runtime, entitlements, dmg layout) | `~/Documents/Projects/Dev/DevTools/MockItOut/prototype/MockItOut/designer/electron-builder.yml`, `build/entitlements.mac.plist` | S6 (D29, D31), **only if Q11 = yes**: SRC-2#s15 drops that prototype's implementation and does not mention its packaging | not in the sources |
>
> Dropped by the sources, not carried: React, zustand, Vite, pywebview, kit CSS, the Claude terminal and
> MockItOut bridge, the edit-mode toggle (SRC-2#s15).
>
> ## Work for the mockitdown queue
>
> Proposed features and issues for mockitdown's vibe-plan (its definition 0.5.0 already has F-17, F-19, F-20,
> source SRC-8). Each issue traces to SRC-2 here and to the mockitdown items named. The milestone each S7/S8
> draft waits on is in its "Waits on mockitdown" column.
>
> | Milestone | Proposed issues | Traces to |
> |---|---|---|
> | M1 Editing core | W1.1 syntax tree keeping positions, whitespace and comments, with stable node ids; W1.2 edit API: insert, remove, move, set argument, set modifier, rename, each returning minimal text edits and the new tree; W1.3 printing rules for new code with conformance cases (Python to follow, SRC-2#s18 Q5); W1.4 edit-mode render option adding `data-mkd-node` and marking derived elements; W1.5 `shared/language/roles.json` (category, accepted child roles, attachment mode) with per-element overrides in `pack.json`; W1.6 typed parameter metadata in `pack.json` and the modifier vocabulary; W1.7 element samples as data (`shared/reference/<pack>.json`; the folder exists and issue #10 declared samples in `pack.json`, so check what remains); W1.8 HANDOFF backlog that affects editing: warn on unknown labelled arguments, parse dotted element names, keep overlay callouts; W1.9 (for this repo's D15) a render option that draws remote images as placeholders; W1.10 node:test conformance for the edit API (SRC-2#s16 "Core tests") | SRC-2#s13, SRC-2#s9, SRC-2#s16; F-19 (prerequisite), F-19.AC5 |
> | M2 Outline and selection | `mockitdown-editor` (hover and selection overlays, inline text edit); `mockitdown-outline` (row anatomy, keyboard, multi-select among siblings); the design session object and the bubbling events (`mockitdown-select`, `-change`, `-rename`, `-diagnostics`); `mockitdown-designer` composite with `document`, `open(json)`, `toJSON()`, `mode` and panel slots (needed by D32; SRC-2#s17 does not say which milestone delivers the composite, so confirm it lands in M2); `pages/designer.html`; Playwright for F-19.AC3 | SRC-2#s5, SRC-2#s12, SRC-2#s17; F-19.C10, F-19.AC3 |
> | M3 Gallery and insertion | `mockitdown-gallery` (pack elements then core vocabulary, role groups, live previews, search, Components group, "Hidden here" footer, `insert` event); Add, drag onto outline, drag onto view, with the role rules; new element gets its sample arguments and opens its first text field; Playwright for F-19.AC1-2 | SRC-2#s6, SRC-2#s6.3, SRC-4; F-19.C3, F-19.AC1, F-19.AC2 |
> | M4 Inspector, structure, undo | `mockitdown-inspector` (Arguments, Variant and state, Modifiers, Identity groups; Mockup tab; 150 ms debounce, invalid values shown not applied); the commands of SRC-2#s8; undo history per document with selection restored; Playwright for F-19.AC4 | SRC-2#s7, SRC-2#s8; F-19.AC4 |
> | M5 Code view | `mockitdown-code` (colouring, line numbers, diagnostics, bracket matching, auto-indent, no editor dependency, SRC-2#s18 Q2); two-way sync with 300 ms re-parse and last-valid-tree read-only fallback; `mockitdown-diagnostics`; Playwright for F-19.AC5 | SRC-2#s9, SRC-2#s12; F-19.AC5 |
> | M6 Canvas | `mockitdown-canvas` (zoom 10-400 %, pan, minimap, frames with name labels, rename with uniqueness, 8 px grid and edge snapping, sections, inactive mockups rendered as preview); `.mkdesign` in the designer's `open`/`toJSON` (agree the schema with this repo's D5, Q1); Playwright for F-20.AC1-4 | SRC-2#s10, SRC-2#s11, SRC-5; F-20.AC1, F-20.AC2, F-20.AC3, F-20.AC4 |
>
> Open for mockitdown, not this repo: code editor depth (SRC-2#s18 Q2), flows between mockups (Q3), the Python
> edit API (Q5).
>
> ## Questions for the developer
>
> 1. **Who owns the `.mkdesign` format in code?** SRC-2#s17 puts ".mkdesign" in mockitdown milestone 6 and
>    SRC-2#s12 gives the designer `open(json)`/`toJSON()`, while S2 here needs to read and write the file now.
>    Options: (a) the shell's core module (D5) owns parse, validation and serialisation, and the designer takes
>    and returns plain objects; (b) D5 is interim and is replaced by a mockitdown core function in M6;
>    (c) mockitdown adds a small design-document module early (before M2), used by both. Blocks D5.
> 2. **Pack per mockup or per document** (SRC-2#s18 Q4). The schema has `defaults.pack` and each mockup's
>    `options.pack`. Options: (a) keep both as SRC-2#s11 shows; (b) one pack per document (drop the per-mockup
>    pack, or reject a document whose mockups differ); (c) both, with a warning when packs are mixed. Affects
>    D5, D6 (Markdown fences carry their own `pack`), D12 and the Mockup ▸ Pack menu.
> 3. **Is the interim editing in S3 wanted?** Options: (a) yes, code area and new/rename/delete (D16, D17,
>    F-10), retired in S8; (b) code area only, no interim mockup commands; (c) no: S3 is a read-only viewer
>    and editing waits for mockitdown M2-M5. Note: interim rename puts a uniqueness rule in the shell that
>    SRC-2#s3 wants in mockitdown.
> 4. **Remote images** (SRC-2#s14 "Security"): placeholders need mockitdown's help (W1.9), and "allow for this
>    document" needs a place to persist that SRC-2#s11 does not have. Options: (a) a new `.mkdesign` key (for
>    example `"remoteImages": true`); (b) per-document setting in app data, keyed by path; (c) defer: blocked
>    images show as broken until mockitdown has placeholders.
> 5. **Window bounds restore** (SRC-2#s14): per document (app data keyed by path) or the last window's bounds
>    for every new window? `.mkdesign` `view` holds zoom and scroll only.
> 6. **Standalone HTML export**: (a) one self-contained file (mockitdown script and pack CSS inlined); (b) a page
>    plus an assets folder; (c) static HTML pre-rendered by `mockitdown/node`, no script (does not match
>    "rendered by `<mockitdown-mockup>`").
> 7. **Folder export file names**: names are case-sensitive and may contain spaces (SRC-2#s10), so "Inbox" and
>    "inbox" collide on macOS and Windows file systems, and `/` or `:` are not file-name safe. Options:
>    (a) escape unsafe characters and add a numeric suffix on collision, with the true name in `index.json`;
>    (b) refuse the export and name the clashing mockups.
> 8. **Unsaved changes on close and quit** are not in the sources. Assumed: the platform's Save / Don't Save /
>    Cancel prompt, with autosave recovery as the backstop. Confirm, or prefer no prompt (recovery only).
> 9. **Python mockitdown in the Electron tests** (SRC-2#s16 "export to Markdown followed by building it with
>    the Python mockitdown in strict mode"): is a Python with `mockitdown[markdown]` installed an accepted test
>    prerequisite? Options: (a) required; (b) the test skips with a message when it is absent; (c) use the
>    local `../mockitdown/python` checkout.
> 10. **Signing and targets**: is an Apple Developer ID with notarisation credentials available, and Windows code
>     signing? Which Linux formats (AppImage, deb, rpm)? Which architectures (arm64 only, or x64 too)?
> 11. **Reuse the MockItOut Electron packaging config** (electron-builder.yml, entitlements) as the S6 starting
>     point? SRC-2#s15 drops that prototype's implementation and is silent on packaging.
> 12. **Stage order**: packaging (S6) before the integration stages, as planned here, or after them as in the brief?
> 13. **Design tier for the editing screens**: record Design mode, inserting and the canvas (SRC-3..5) here only as
>     `LIB-1` component elements that SCR-APP-01 uses (proposed), or as full SCR-EDT items in this repo as well
>     as in mockitdown's design tier?
> 14. **Markdown import names** (SRC-2#s11): a fence without `id` or `title` gets which name: "Mockup n", or
>     the nearest preceding heading?
> 15. **Opening a file that is already open**: focus its window (assumed in D8), or open a second window?
>
> ## Findings
>
> - SRC-2#s17 and the brief differ on who handles `.mkdesign` (mockitdown M6 vs shell S2): Q1.
> - SRC-2#s17 names no milestone for the `mockitdown-designer` composite element that D32 needs; listed in M2.
> - mockitdown loads `dist/shared/` by `fetch` relative to `import.meta.url`, which a sandboxed `file://`
>   renderer may not allow; D3 serves the app over a custom scheme for that reason (to be verified in D3).
> - `.specitout/sdd.json` has all five dependencies at `evaluated: false`; D1 records the evaluations.
> - No instruction-shaped text was found in SRC-1..SRC-5.
