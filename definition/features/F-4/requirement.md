---
id: F-4
title: Custom reusable components
status: active
version: 0.11.1
rev: 2
page: FEAT.1
slot: features
order: 4
family: authoring
source: [SRC-2, SRC-3]
hash: 92a7b9d431dd
refs: [UC-1, UC-2, UC-3, UC-4]
requires: [F-2]
---

G1: Applications have their own controls; a documentation site must be able to define them once and reuse them in every mockup.
C1: An author declares a custom component as a SwiftUI-style `struct Name: View` with properties (optionally with defaults) and a `body`.
C2: A component can receive content through a trailing closure bound to a view-typed property, and named content through labelled closures.
C3: Components can be declared inside a block, in a library block on the same page, or in a component library file shared by the site.
C4: An `import "path"` statement at the start of a block names a library to load; a path that is not relative is resolved through the site's import map, which maps namespaces (path prefixes) to directories or URLs, like TypeScript's `paths` or a browser import map.
C5: Libraries can import other libraries; each file is loaded once, and cycles do not fail.
C6: A component written with core elements renders in every pack in that pack's style.
C7: The import map is defined in one place per integration — the Markdown extension's configuration for a site, a page-level map for the web components — and replaces the earlier list of import directories.
C8: A block can declare a named library on its page; later blocks on that page import it by name without a separate file.
C9: Each imported library has a name (its namespace, or an alias given in the import); a component is referred to as `Library.Name` when two loaded libraries define the same name, and by its plain name when it is unique.
C10: A component can serve as a template: the design using it overrides its property values and fills its named content slots, and slots it leaves empty show the template's default content or nothing.
AC1: A struct declared in a library under the site's import directory and imported by path renders wherever it is used.
AC2: A missing library is reported with the directories that were searched.
AC3: A block-local struct with the same name as an imported one takes precedence.
AC4: A namespace mapped in the site's import map resolves `import "<namespace>/<file>"` to the mapped directory or URL; an unmapped, non-relative import is reported with the mappings that were tried. (UC-1)
AC5: A component declared in a library block is usable by a later block on the same page, and not by another page. (UC-2)
AC6: With two libraries both defining `Card`, `acme.Card` and `contoso.Card` render their own definitions, and a plain `Card` is reported as ambiguous, naming both libraries. (UC-3)
AC7: A template with a default slot and named slots renders the design's content in each slot it fills, the default content in a slot with a default it leaves out, and nothing in an optional slot it leaves out. (UC-4)
AC8: A site configuration still using the removed list of import directories fails with a message showing the equivalent import map.
