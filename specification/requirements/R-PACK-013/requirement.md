---
id: R-PACK-013
title: Element samples
status: active
version: 0.12.11
rev: 5
page: PACK.1
slot: reqs
order: 999
source: [SRC-9]
realizes: [F-18, F-14]
constrained_by: [A-PACK-2]
requires: [R-PACK-012]
hash: 89c9b47f5ffb
refs: [R-DEV-008, R-PACK-014, R-PACK-015]
---

C1: An element definition in `pack.json` MAY declare `sample`: mockitdown source of one call in the pack's vocabulary, showing the element doing its job.
C2: `tools/gen_reference.py` MUST use a declared `sample` as the element's sample and build its variants sample from it; it MUST fail, naming the pack and element, when a declared sample renders with a diagnostic, instead of simplifying it.
C3: The `base` pack MUST declare samples that give: charts data suited to their kind (`points:` for scatter, bubble and candlestick, `matrix:` with labels for heatmaps, `labels:` for categorical kinds); presentations (Alert, Dialog, Sheet, Popover, ConfirmationDialog, Toast) a title, a message or content and actions; `Picker` three options and a selection; `Tab` a place inside a `TabView`; `NavigationSplitView` a sidebar list and a detail; `Tooltip` an anchor button; `MessageBubble` a sentence of at least 15 words; `DatePicker` a selection.
C4: Every framework pack MUST declare samples for its own elements whose generic sample would be empty or meaningless (no options, no data, no content); the `swiftui` pack MUST do so for every element of R-PACK-014 and R-PACK-015.
C5: The variants sample MUST keep its variants side by side at their natural size (`HStack(alignment: .top, spacing: 24)`), each captioned; showing them whole relies on R-DEV-008.C1.
C6: When an element with variants declares a `sample`, the sample MUST be a call of that element, and `tools/gen_reference.py` MUST build the variants sample by applying `.variant("…")` to it; otherwise it MUST fail, naming the pack and element.
C7: A declared `sample` MUST be inherited with its element by every pack that extends the declaring pack, and `tools/gen_reference.py` MUST check it in each of those packs as in C2.
C8: Where an element declares no `sample`, the generic sample of `tools/gen_reference.py` MUST give pickers, radio groups and segmented controls three options and a selection (unless a positional argument already gives a list), date pickers a selection, charts values, table rows two cells, and an element of role `tab` a place as one of two tabs inside a `TabView`.
V1: `gen_reference.py --check` passes; a pack whose declared sample emits a diagnostic makes it fail with the pack and element named; the reference JSON of `swiftui` shows `Picker` with three options.
