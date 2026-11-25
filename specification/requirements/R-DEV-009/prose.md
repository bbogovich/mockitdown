On the Mac, the menu bar's titles and commands are designed text and part of the application's
interface (SRC-9). It is an option because most screens are reviewed without it. Menus are declared
the SwiftUI way, with `.commands`, so the mockup reads like the app's own code.

```swift
import SwiftUI
@Screen(app: "Notes", menubar: "File")
NavigationSplitView { … } detail: { … }
  .commands {
    CommandGroup(after: .newItem) { Button("New Folder").keyboardShortcut("n", modifiers: [.shift, .command]) }
    CommandMenu("Format") { Button("Bold").keyboardShortcut("b"); Divider(); Toggle("Show Ruler", isOn: true) }
  }
```
