**Problem.** Writing mockups as code suits developers, not designers. Figma is the most popular web tool, but Axure is the better model here: the element hierarchy must be easy to navigate to insert, remove and edit elements (SRC-8).

**Change.** Design-tool components — gallery, outline, inspector, editable view and code view — that a web application composes into an editor. The outline is the primary means of selection, because a click on nested elements is ambiguous; a click narrows the search by selecting the innermost element there. The components are defined now and built after the developer reviews the designer design document (SRC-8#clar-design).

**Design session, modes and host integration (SRC-12#s4, SRC-12#s5, SRC-12#s12, SRC-13).** The
components share one plain session object, so that the outline, the view, the gallery and the
inspector always agree on the document, the active mockup and the selection. A composite
`mockitdown-designer` lays them out as in the designer's main window (SRC-13: toolbar, outline,
gallery, canvas, properties, status bar) and is what a host such as the MockItDown Designer's
Electron shell embeds: it opens a design document, reports changes so the host can mark the document
edited and autosave it, and returns the document on request. Opening and saving files, menus and
windows stay with the host.

**Structural commands (SRC-12#s8).** Rearranging the hierarchy is the main editing activity, so the
selection has the commands of a structured editor: delete, duplicate, the clipboard as mockitdown text
(which also pastes into a Markdown fence), move, wrap, unwrap, convert and extract component. Each is
one undo step that restores the selection, and a host can put the same commands in its menus.

**Re-checked at definition 0.9.2.** The F-17 clarification changed no obligation; this feature is unaffected.

**Re-checked at 0.10.0.** Its cited items F-17 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.
