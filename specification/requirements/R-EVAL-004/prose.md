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
