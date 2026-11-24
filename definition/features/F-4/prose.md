**Problem.** Real applications use components that no framework ships — a KPI tile, a person row,
a status pill. Repeating their layout in every mockup is error-prone.

**Change.** Components are `struct` views, exactly as in SwiftUI. Declared in a `.mockitdown` file in
the site's import directory, they are imported by path and used like built-in elements:

```swift
import "shared/kpi"
KPI(label: "Revenue", value: "$48.2k")
```
