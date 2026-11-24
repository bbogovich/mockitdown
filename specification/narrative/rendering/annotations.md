---
title: Annotations and overlays
spec_version: 0.2.1
status: draft
updated: 2026-11-24
page_id: ANN.1
---

# Annotations and overlays

Numbered callouts, pointers, selections, highlights and taps drawn on a mockup to illustrate
workflows (F-15), and the `(#n)` references that tie prose to them. Example, in the base pack:

```mockitdown device="fit" title="Annotated toolbar"
HStack(spacing: 16) {
  Button("New", systemImage: "plus").callout(1)
  Button("Share", systemImage: "square.and.arrow.up").callout(2, "Sends a link", alignment: .topTrailing)
  Button("Delete", systemImage: "trash").pointer(.hand)
}
.padding(24)
```

Create an item (#1), then share it (#2).

<!-- slot: reqs -->

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.3.0 | 2026-11-24 | Page created |
