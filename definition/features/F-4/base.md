---
id: F-4
title: Custom reusable components
status: active
version: 0.2.0
rev: 0
page: FEAT.1
slot: features
order: 4
family: authoring
source: [SRC-2, SRC-3]
hash: b1e66bc74654
---

G1: Applications have their own controls; a documentation site must be able to define them once and reuse them in every mockup.
C1: An author declares a custom component as a SwiftUI-style `struct Name: View` with properties (optionally with defaults) and a `body`.
C2: A component can receive content through a trailing closure bound to a view-typed property, and named content through labelled closures.
C3: Components can be declared inside a block or in a component library file shared by the site.
C4: An `import "path"` statement at the start of a block names a library file to load, resolved against the importing file's directory and then the site's configured import directories.
C5: Libraries can import other libraries; each file is loaded once, and cycles do not fail.
C6: A component written with core elements renders in every pack in that pack's style.
AC1: A struct declared in a library under the site's import directory and imported by path renders wherever it is used.
AC2: A missing library is reported with the directories that were searched.
AC3: A block-local struct with the same name as an imported one takes precedence.
<!-- file: prose.md -->
**Problem.** Real applications use components that no framework ships — a KPI tile, a person row,
a status pill. Repeating their layout in every mockup is error-prone.

**Change.** Components are `struct` views, exactly as in SwiftUI. Declared in a `.mockitdown` file in
the site's import directory, they are imported by path and used like built-in elements:

```swift
import "shared/kpi"
KPI(label: "Revenue", value: "$48.2k")
```
<!-- file: usecases/UC-1.md -->
---
id: UC-1
title: Share a component library across a site
---

**Actor:** documentation-site maintainer.

1. The maintainer writes `docs/mockups/shared/kpi.mockitdown` declaring `struct KPI: View`.
2. The maintainer sets the extension's import directory to `docs/mockups`.
3. Authors write `import "shared/kpi"` in any block and use `KPI(…)`.

**Outcome:** every page renders the same KPI component; changing the library changes every mockup
on the next build.
