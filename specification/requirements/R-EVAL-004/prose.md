Arguments are data: the evaluator does not know what `systemImage` means — the render role does.
That is what lets a pack add framework-native argument names without code: the pack declares the
element's positional `params` and defaults, and the role reads whichever attribute names it
understands (see the role catalogue).

**Unknown labelled arguments (F-12.C6, SRC-12#s13).** A label that nothing reads — a typo such as
`colour:` or an argument another framework has — used to vanish without a word. It is now a warning, in
both variants, so an author learns why the argument had no effect, and the inspector lists it as "not
understood by this pack" (R-TOOL-007.C7). Bindings (`isOn: $flag`) are exempt: pasted SwiftUI is full of
them (R-EVAL-011), and they carry no value a mockup could show.

```text
Text("Hi", colour: .red)
warning [argument] 'colour' is not understood by Text in pack 'base'   (line 1, col 12)
```

What a role reads is data in `shared/language/roles.json`, beside the role rules: the keys of a
top-level `params` for the labels every role reads through the common element markup (`variant`,
`size`, `state`, `disabled`, …) and of a `params` per rule for the rest (`isOn` for a toggle,
`subtitle` and `detail` for a list item); the values are their types (R-PACK-017), and a pack element
that types a label of its own (`types`) understands it too. The lists were taken from what the Python renderer looks up, and a Python test renders the
whole conformance corpus to keep them complete. Keeping the shipped content warning-free meant fixing
what relied on dropped labels: SwiftUI's `destination:` became an alias of the carbon, mui, sapui5 and
tailwind links and `item:` one of the SwiftUI `ShareLink`, mui's `Stepper` takes `value:` as its
active step, the core patterns use `ListItem` where some packs' `Row` is a grid or table row, and the
example site lost the labels that never had an effect.
