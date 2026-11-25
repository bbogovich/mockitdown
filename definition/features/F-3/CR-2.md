---
id: F-3.CR-2
target: F-3
kind: additive
version: 0.6.0
date: 2026-11-25
summary: "SRC-9: SwiftUI gallery defects, multi-platform chrome, macOS menu bar, meaningful samples"
from: 72d56fe6f9d9
to: f600a5fc06bb
---

## Clauses

@ meta.source
- [SRC-2, SRC-3]
+ [SRC-2, SRC-3, SRC-9]
@ C7 insert after N1
+ The SwiftUI pack follows Apple's current platform design (iOS 26, iPadOS 26, macOS 26) for each style it offers, so that each `.…Style(…)` variant looks like the native style rather than a relabelled default.
@ AC4 insert after C7
+ Every variant of the SwiftUI pack's ControlGroup, DatePicker, Form, Gauge, List, Picker, TabView and Toggle, and its Alert, ConfirmationDialog, NavigationSplitView, Popover, Sheet and Tab, renders recognisably as the native SwiftUI style it names.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -7 +7,4 @@
 on top of a neutral wireframe pack every other pack extends.
+
+**Fidelity of the SwiftUI pack (SRC-9).** Each style variant must look like the native style it
+names; a variant that renders as the default with a different label misleads the reviewer.
```
