# mockitdown examples

Every picture on this site is HTML generated at build time from a fenced block of SwiftUI-style
code. Pick a pack in the navigation to see the same notation rendered as SwiftUI, Fluent (WinUI 3),
Material UI, Angular Material, SAPUI5, Bootstrap or shadcn/ui.

```mockitdown source="true"
@Screen(title: "Hello", device: .fit)
VStack(alignment: .leading, spacing: 12) {
  Text("Hello, mockitdown").font(.title2)
  Text("A mockup is a fenced block of SwiftUI-style code.").foregroundStyle(.secondary)
  HStack { Button("Primary").buttonStyle(.borderedProminent); Button("Secondary") }
}
.padding()
```
