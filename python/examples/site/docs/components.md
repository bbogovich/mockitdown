# Custom components

Apps have their own controls. Declare them once as SwiftUI-style `struct` views — inside a block,
or in a `.mockitdown` file that any block can `import` — and use them like built-in elements.

## Declaring a component

A component is a `struct … : View` with properties and a `body`. Properties with defaults are
optional; a property typed `Content`/`some View` (or marked `@ViewBuilder`) receives the trailing
closure, and the body places it by naming it.

```mockitdown source="true" title="Inline component" device="fit"
struct StatusPill: View {
  var text: String
  var color: Color = .green
  var body: some View {
    HStack(spacing: 6) {
      Circle().fill(color).frame(width: 8, height: 8)
      Text(text).font(.footnote)
    }
    .padding(.horizontal, 10).padding(.vertical, 4)
    .background(.surface).border(.separator).cornerRadius(12)
  }
}

HStack(spacing: 8) {
  StatusPill(text: "Online")
  StatusPill(text: "Degraded", color: .orange)
  StatusPill(text: "Offline", color: .red)
}
```

## Importing a component library

Put shared components in a file under an import directory (this site uses `docs/mockups`, set by
the extension's `import_paths`) and import it by path; `.mockitdown` is appended when missing:

```swift
import "shared/kpi"      // docs/mockups/shared/kpi.mockitdown
```

The library on this site defines `KPI` and `PersonRow` with core elements only, so every pack can
use them — the same block renders in the style of whichever pack it is given:

```mockitdown source="true" title="Imported components" device="fit"
import "shared/kpi"

VStack(alignment: .leading, spacing: 16) {
  HStack(spacing: 12) {
    KPI(label: "Revenue", value: "$48.2k", change: "+12%", trend: [3, 4, 3.5, 5, 6, 5.5, 7])
    KPI(label: "Orders", value: "1,204", change: "+4%", trend: [5, 5.5, 5, 6, 6.2, 6, 6.8])
    KPI(label: "Refunds", value: "38", change: "-9%", positive: false)
  }
  PersonRow(name: "Ana Lima", role: "Design lead", photo: "assets/images/avatar-1.svg") {
    Button("Message")
  }
  PersonRow(name: "Ben Okafor", role: "Engineer", photo: "assets/images/avatar-2.svg") {
    Badge("On call")
  }
}
.padding()
.frame(width: 760)
```

```mockitdown pack="fluent" title="The same block, Fluent pack" device="fit"
import "shared/kpi"

HStack(spacing: 12) {
  KPI(label: "Revenue", value: "$48.2k", change: "+12%", trend: [3, 4, 3.5, 5, 6, 5.5, 7])
  KPI(label: "Orders", value: "1,204", change: "+4%", trend: [5, 5.5, 5, 6, 6.2, 6, 6.8])
}
.padding()
.frame(width: 560)
```

## Resolution rules

- `import "path"` is resolved against the directory of the file that contains the import (for
  libraries importing libraries), then each directory in `import_paths`.
- Libraries may import other libraries; each file is loaded once (cycles are ignored).
- A struct declared in the block replaces an imported one of the same name.
- Top-level views in a library file are ignored (with a warning) — libraries only declare.
- Packs can be added the same way: a site can ship its own design pack in a directory listed in
  the extension's `pack_paths` (`<dir>/<id>/pack.json` + `pack.css`).
