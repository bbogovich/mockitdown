**Problem.** Real applications use components that no framework ships — a KPI tile, a person row,
a status pill, the application's own window layout. Repeating their layout in every mockup is
error-prone, and a site that combines a vendor's component library with its own soon meets two
components of the same name.

**Change.** Components are `struct` views, exactly as in SwiftUI. They are declared in a block, in a
named library block on the same page, or in a `.mockitdown` library file. Library files are found
through the site's import map, which maps namespaces to directories or URLs:

```yaml
- mockitdown:
    imports:
      shared/: docs/mockups/shared/
      acme/: https://example.com/acme-mockups/
```

```swift
import "shared/kpi"
import "acme/cards"
KPI(label: "Revenue", value: "$48.2k")
acme.Card(title: "Plan")      // qualified: needed only when another library also has a Card
```

A component doubles as a template: properties with defaults are overridden by the caller, and
view properties (`@ViewBuilder`) are content slots the caller fills — the trailing closure fills
`content`, labelled closures fill the named ones, and an unfilled slot shows its default content or,
when optional, nothing.
