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

The status items follow macOS's own order (battery, Wi-Fi, Control Center, then the clock), and the
standard menus carry the items a SwiftUI app gets on macOS 26 for each placement, so a `CommandGroup`
edits exactly the group it names; an empty `CommandGroup(replacing:)` removes that group without
leaving a doubled separator. Only one menu is drawn open, because macOS shows only one at a time;
the title highlighted in the bar tells the reader which. A mistyped menu title or placement draws the
bar anyway, with a warning, so the mistake is visible rather than silently dropped.
