Generated samples (`Picker("Label")`, a lone `Tab`, charts with one-dimensional `values:`) said
nothing about the element (SRC-9). Packs now name a sample where the generic one is empty.

A sample is mockitdown source, written in the pack's own vocabulary, for example the `base` picker:

```
Picker("Size", selection: "Medium") { Text("Small"); Text("Medium"); Text("Large") }
```

The generator takes a declared sample verbatim, so a mistake in it is reported (pack, element and the
diagnostics) rather than quietly simplified away. An element with variants is shown once per variant by
appending `.variant("…")` to its sample, which is why such a sample must be a call of the element itself;
a `Tab`, which has none, may instead be shown inside a `TabView`.

Samples declared by `base` travel with the core vocabulary into every pack, so they are checked in every
pack's style. For the many framework elements that declare none, the generic sample gives the content
their role needs — options and a selection for pickers, a date for date pickers, a `TabView` around a
tab — so that only elements whose job the generic sample cannot show need a declaration.

Checked at 0.10.1 after R-PACK-012.CR-4 (six header tabs, C6): that change concerns the site sections, not samples, so C1 to C8 are unchanged.
