---
id: F-4.CR-1
target: F-4
kind: revision
version: 0.11.0
date: 2026-11-27
summary: import map replaces import directories; page library blocks; library-qualified names; components as templates with slots (developer prompt 2026-11-27)
from: b1e66bc74654
to: b4da7abe0e66
---

## Clauses

@ C3 edit
~ Components can be declared inside a {+block, in a library +}block{+ on the same page,+} or in a component library file shared by the site.
@ C4 edit
~ An `import "path"` statement at the start of a block names a library [-file -]to [-load,-]{+load; a path that is not relative is+} resolved [-against the importing file's directory and then-]{+through+} the site's [-configured-]{+import map, which maps namespaces (path prefixes) to directories or URLs, like TypeScript's `paths` or a browser+} import [-directories.-]{+map.+}
@ C7 insert after C6
+ The import map is defined in one place per integration — the Markdown extension's configuration for a site, a page-level map for the web components — and replaces the earlier list of import directories.
@ C8 insert after C7
+ A block can declare a named library on its page; later blocks on that page import it by name without a separate file.
@ C9 insert after C8
+ Each imported library has a name (its namespace, or an alias given in the import); a component is referred to as `Library.Name` when two loaded libraries define the same name, and by its plain name when it is unique.
@ C10 insert after C9
+ A component can serve as a template: the design using it overrides its property values and fills its named content slots, and slots it leaves empty show the template's default content or nothing.
@ AC4 insert after AC3
+ A namespace mapped in the site's import map resolves `import "<namespace>/<file>"` to the mapped directory or URL; an unmapped, non-relative import is reported with the mappings that were tried. (UC-1)
@ AC5 insert after AC4
+ A component declared in a library block is usable by a later block on the same page, and not by another page. (UC-2)
@ AC6 insert after AC5
+ With two libraries both defining `Card`, `acme.Card` and `contoso.Card` render their own definitions, and a plain `Card` is reported as ambiguous, naming both libraries. (UC-3)
@ AC7 insert after AC6
+ A template with a default slot and named slots renders the design's content in each slot it fills, the default content in a slot with a default it leaves out, and nothing in an optional slot it leaves out. (UC-4)
@ AC8 insert after AC7
+ A site configuration still using the removed list of import directories fails with a message showing the equivalent import map.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -1,6 +1,16 @@
 **Problem.** Real applications use components that no framework ships — a KPI tile, a person row,
-a status pill. Repeating their layout in every mockup is error-prone.
+a status pill, the application's own window layout. Repeating their layout in every mockup is
+error-prone, and a site that combines a vendor's component library with its own soon meets two
+components of the same name.
 
-**Change.** Components are `struct` views, exactly as in SwiftUI. Declared in a `.mockitdown` file in
-the site's import directory, they are imported by path and used like built-in elements:
+**Change.** Components are `struct` views, exactly as in SwiftUI. They are declared in a block, in a
+named library block on the same page, or in a `.mockitdown` library file. Library files are found
+through the site's import map, which maps namespaces to directories or URLs:
+
+```yaml
+- mockitdown:
+    imports:
+      shared/: docs/mockups/shared/
+      acme/: https://example.com/acme-mockups/
+```
 
@@ -8,3 +18,10 @@
 import "shared/kpi"
+import "acme/cards"
 KPI(label: "Revenue", value: "$48.2k")
+acme.Card(title: "Plan")      // qualified: needed only when another library also has a Card
 ```
+
+A component doubles as a template: properties with defaults are overridden by the caller, and
+view properties (`@ViewBuilder`) are content slots the caller fills — the trailing closure fills
+`content`, labelled closures fill the named ones, and an unfilled slot shows its default content or,
+when optional, nothing.
--- a/usecases/UC-1.md
+++ b/usecases/UC-1.md
@@ -8,3 +8,3 @@
 1. The maintainer writes `docs/mockups/shared/kpi.mockitdown` declaring `struct KPI: View`.
-2. The maintainer sets the extension's import directory to `docs/mockups`.
+2. The maintainer maps the namespace `shared/` to `docs/mockups/shared/` in the extension's import map.
 3. Authors write `import "shared/kpi"` in any block and use `KPI(…)`.
--- /dev/null
+++ b/usecases/UC-2.md
@@ -0,0 +1,12 @@
+---
+id: UC-2
+title: Reuse a component across the blocks of one page
+---
+
+**Actor:** page author.
+
+1. The author writes a block marked as the page's library `cards`, declaring `struct Pill: View`.
+2. Further down the page, the author writes `import "#cards"` in each block that shows pills.
+
+**Outcome:** every block on the page uses the same `Pill`; no file outside the page is needed, and
+other pages are unaffected.
--- /dev/null
+++ b/usecases/UC-3.md
@@ -0,0 +1,13 @@
+---
+id: UC-3
+title: Combine two component libraries with overlapping names
+---
+
+**Actor:** documentation-site maintainer combining a vendor library and the product's own library.
+
+1. The maintainer maps `acme/` to the vendor's library URL and `contoso/` to the product's directory.
+2. An author imports both, `import "acme/cards"` and `import "contoso/cards"`; both declare `Card`.
+3. The author writes `acme.Card(…)` and `contoso.Card(…)` (or imports one `as` a shorter name).
+
+**Outcome:** each call renders its own library's `Card`; a plain `Card` is reported as ambiguous
+rather than silently picking one.
--- /dev/null
+++ b/usecases/UC-4.md
@@ -0,0 +1,14 @@
+---
+id: UC-4
+title: Build screens from a layout template
+---
+
+**Actor:** designer documenting several screens of one application.
+
+1. The designer declares `struct AppShell: View` with a `title` property, a `sidebar` slot with
+   default navigation, an optional `toolbar` slot and a `content` slot.
+2. Each screen's block calls `AppShell(title: "Orders") { … }`, filling `content` with the screen
+   and, where needed, `toolbar:` with its own buttons.
+
+**Outcome:** every screen shares the shell's layout; each shows its own title and content, the
+default sidebar unless it supplies one, and a toolbar only where it gave one.
```
