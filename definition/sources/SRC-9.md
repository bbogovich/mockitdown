---
id: SRC-9
title: "Request: SwiftUI gallery defects, desktop/tablet chrome and the macOS menu bar"
recorded: 2026-11-25
---

> SwiftUI ControlGroup and Calendar render incorrectly in the gallery. [Image #4] Also Form and Guage [Image #1]  [Image #2] Alert is just a small gray box [Image #3] same with confirmation dialog.[Image #5] List variants scrambled [Image #6] NavigationSplitView looks strange, compare against SwiftUI frameworks for accuracy.  Picker variants scrambled and example doesn't have any options [Image #7] Popover just small gray box.  Sheet is small white box with gray border showing part of a text.  Tab is empty white box with gray border.  TabView layouts are scrambled [Image #8] Toggle variants overlap [Image #9] BubbleChart, CandlestickChart have no content.  Circle shape shows a capsule, not a circle.  Dialog just shows dialog corner.  Heatmap chart is empty.  ScatterChart is empty.  Toast is just small square.  tooltip shows something like a button with a clipped square at the top.  MessageBubble text overflows its container.
>
> SwiftUI is an unusual case because the framework also supports desktop and tablet, not just iOS.  Additional supporting chrome needed to represent desktop layout and/or tablets.  Examples for SwiftUI should include both mobile and desktop apps.  Desktop SwiftUI apps should also have the MacOS menu bar as an option since it contains text and menus that are part of the UI; the dropdown menus for the menu bar also are needed.
>
> <a id="images"></a>
> - **Screenshots.** The nine images (not kept) are gallery cards of the `swiftui` pack at `device="fit"`:
>   Form and Gauge variants squeezed into one row with labels and switches drawn over each other; Button,
>   ControlGroup, DatePicker, List, Picker, TabView and Toggle variant rows overlapping the same way;
>   Alert and ConfirmationDialog cards showing only a small grey rounded square.
>
> <a id="scroll"></a>
> - **Follow-up, same session (verbatim):** *"For many of the issues, problem is the width of the variants
>   container is too small to fit.  This could be resolved by enabling overflow to scroll horizontally"*
>
> <a id="ellipse"></a>
> - **Follow-up, same session (verbatim):** *"Ellipse is displayed as a capsule (all packs, same with circle)"*
