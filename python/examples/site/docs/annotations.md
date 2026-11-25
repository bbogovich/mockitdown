# Annotations and overlays

Documentation often has to point at a part of a screen: *tap here*, *drag across these*, *this
number comes from that field*. mockitdown draws those marks as part of the mockup, so they stay
attached to the element when the layout changes.

## Numbered callouts

Attach `.callout(n)` to any element. A numbered circle sits on the element's corner (choose it with
`alignment:`), optionally with a label. In the surrounding text, write `(#n)` and it renders as the
same circle (#1) — so prose and picture refer to each other. A label points away from the element;
`labelSide: .leading` or `.trailing` turns it when the element sits at the edge of the screen.

```mockitdown pack="swiftui" device="phone" title="Composing a message" source="true"
NavigationStack {
  Form {
    Section {
      TextField("To", text: "ana@example.com").callout(1)
      TextField("Subject", text: "Offline sync")
    }
    Section {
      TextEditor(text: "Hi Ana — the field crews…").callout(2, alignment: .topTrailing)
    }
    Section {
      Toggle("Request read receipt", isOn: true)
        .callout(3, "Off by default", alignment: .bottomTrailing, labelSide: .leading)
    }
  }
  .navigationTitle("New Message")
  .navigationBarTitleDisplayMode(.inline)
  .toolbar {
    ToolbarItem(placement: .cancellationAction) { Button("Cancel") }
    ToolbarItem(placement: .confirmationAction) { Button("Send").callout(4, color: .blue) }
  }
}
```

Enter the recipient (#1) and the body (#2). Read receipts (#3) are optional. **Send** (#4 blue)
stays disabled until both are filled in. A colour after the number, as in `(#4 blue)`, matches a
callout drawn with `color: .blue`.

## Pointers, taps and selections

`.pointer(.arrow | .hand | .ibeam | .grab | .crosshair | .touch, alignment:)` draws a cursor over
an element, `.tap()` a touch indicator, `.dragSelect()` (or `.marquee()`) a selection rectangle with
a tinted fill, and `.highlight()` a focus ring.

```mockitdown pack="mui" device="fit" title="Selecting rows to archive" source="true"
VStack(alignment: .leading, spacing: 0) {
  Toolbar {
    Text("Inbox").font(.title3)
    Spacer()
    Button("Archive", systemImage: "archive", variant: "contained").highlight().callout(2, alignment: .topTrailing)
  }
  List {
    Row("Quarterly report", subtitle: "Ben Okafor · 9:41", checked: false)
    VStack(spacing: 0) {
      Row("Venue options for the offsite", subtitle: "Chen Wu · 9:12", checked: true)
      Row("Design review notes", subtitle: "Ana Lima · Yesterday", checked: true)
    }
    .dragSelect()
    .pointer(.arrow, alignment: .bottomTrailing)
    .callout(1, "Drag to select", alignment: .topLeading, labelSide: .trailing)
    Row("Lunch on Friday?", subtitle: "Dana Kim · Monday", checked: false)
  }
}
.frame(width: 520)
```

Drag across the messages (#1), then choose **Archive** (#2).

## Free placement

`Callout`, `Pointer` and `SelectionRect` are elements too: place them anywhere with
`.position(x:y:)` inside a `Canvas` or `ZStack` — useful for marking a region rather than an
element.

```mockitdown device="fit" title="Rubber-band selection on a canvas" source="true"
Canvas(grid: .dots, height: 260) {
  StickyNote("Interview Ana", color: .yellow).position(x: 110, y: 100)
  StickyNote("Sketch flows", color: .pink, rotation: 3).position(x: 300, y: 120)
  StickyNote("Test with crews", color: .green, rotation: -2).position(x: 480, y: 110)
  SelectionRect().frame(width: 410, height: 200).position(x: 395, y: 120)
  Pointer(.arrow).position(x: 600, y: 222)
  Callout(1, "2 notes selected").position(x: 250, y: 236)
}
.frame(width: 640)
```

## Many steps on one screen

```mockitdown pack="fluent" device="fit" title="Sharing a file" source="true"
VStack(alignment: .leading, spacing: 14) {
  CommandBar {
    AppBarButton("New", icon: "Add")
    AppBarButton("Share", icon: "Share").callout(2, alignment: .bottom)
    AppBarButton("Delete", icon: "Delete")
  }
  ListView {
    Row("Budget 2027.xlsx", subtitle: "Modified today", systemImage: "doc").selected().callout(1, alignment: .leading)
    Row("Roadmap.pptx", subtitle: "Modified yesterday", systemImage: "doc")
  }
  HStack {
    TextBox(placeholder: "Add people", text: "chen@").callout(3, alignment: .leading)
    Button("Send", variant: "accent").pointer(.hand).callout(4, alignment: .topTrailing)
  }
}
.padding()
.frame(width: 520)
```

Select the file (#1), choose **Share** (#2), type a name (#3) and **Send** (#4).
