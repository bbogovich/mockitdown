---
title: "Language: semantics"
spec_version: 0.12.9
status: draft
updated: 2026-11-27
page_id: LANG.2
---

# Language: semantics

What a parsed block means: how names resolve, how arguments bind to elements and structs, how `ForEach`, conditions, values and modifiers are evaluated, and how pasted SwiftUI is tolerated. Pack selection is specified in R-PACK-005 and file imports on [Component imports](../imports.md).

### R-EVAL-001 — Evaluation always completes

Evaluation is forgiving by design: the author sees the whole mockup with the problems marked,
instead of the first problem only. Only syntax errors stop processing (R-LANG-009).

**R-EVAL-001.TC-1 — Evaluation always completes**

Python unit tests `python/tests/test_evaluate.py` `CompletionTests`: `evaluate` turns a module into a
`Screen` with its views, the pack chosen by `import SwiftUI`, the `@Screen` metadata and the structs
used, as data (C1). Sixteen sources with semantic problems (unknown elements, names, modifiers and
directives, bad `ForEach`, out-of-range subscripts, missing arguments, recursion, bad operators) each
yield a screen and diagnostics, never an exception (C1, C2). An unknown element renders as an `unknown`
view holding its trailing closure's views and an unknown name as `nil` text, and a block with one
unknown element and one unknown modifier keeps every other view with one error and one warning
(C2, V1). Statements run in order (a `let` rebinds for what follows), an `if` branch's `let` shadows
without leaking, a closure parameter shadows an outer name, and a struct's body does not see the
block's names (C3).

**Realizes.** F-2, F-12

| | Statement |
|---|---|
| C1 | The evaluator MUST turn a parsed module into a screen — the list of top-level views, the selected pack, the directive metadata and the names of the components used — and MUST NOT raise for any semantic problem. |
| C2 | If the evaluator cannot resolve something, then it MUST report a diagnostic and continue, substituting an `unknown` view where a view was expected and `nil` where a value was expected. |
| C3 | The evaluator MUST evaluate statements in source order, and each block (struct body, closure, branch) MUST have its own scope nested in the scope it is evaluated in. |
| V1 | A block with an unknown element and an unknown modifier still yields a screen containing every other view, with one error and one warning. |

---

### R-EVAL-002 — What a block renders

A block that only declares a view renders it, as Xcode's preview canvas would; this lets authors
paste a view struct without writing an extra call. Its required properties show their own names
(`title`), so the preview reads like a template rather than failing.

**R-EVAL-002.TC-1 — What a block renders**

Python unit tests `python/tests/test_evaluate.py` `BlockContentTests`: top-level statements and those of
`#Preview` and `#Preview("Named")` blocks render in source order, and declared structs are not rendered
when there are statements (C1). A block of declarations only renders its last struct, called without
arguments, without diagnostics; its property `title` without a default shows as `title`, `count = 3`
as `3`, while an explicit `Card()` still reports the missing argument (C2, C4, V1). An empty block, a
comment, a lone `let`, a false `if` and a lone import each produce exactly the warning "the mockup has no
views" with code `empty` (C3, V1).

**Realizes.** F-1, F-2

| | Statement |
|---|---|
| C1 | The evaluator MUST render the module's top-level statements, including those from `#Preview` blocks, as the screen's views. |
| C2 | When a module has no top-level statements but declares structs, the evaluator MUST render an instance of the last struct declared in the block, called without arguments. |
| C3 | If the screen has no views, then the evaluator MUST report the warning "the mockup has no views" with code `empty`. |
| C4 | When the evaluator renders that implicit instance (C2), a property with no default and no argument MUST take its own name as placeholder text (a view property: no views), with no diagnostic; structs that instance uses get no placeholders. |
| V1 | A block containing only `struct Login: View { var body: some View { … } }` renders the Login view; an empty block produces the `empty` warning. |

---

### R-EVAL-003 — Name resolution for views

Structs shadow pack elements, so a site can override a pack's element with its own component of
the same name. Literals render as text so that `"Hello"` on its own line is a valid view, as in
a SwiftUI `ViewBuilder`.

**Dotted element names (F-2.C7, SRC-12#s13).** Component libraries name sub-components with a dot
(`Badge.Ribbon`, `Card.Meta`). Packs keep their joined names (`BadgeRibbon`), and a dotted call resolves
to the joined name, so both spellings work and no pack changes. `Color.red` keeps its own meaning (C6).

**R-EVAL-003.TC-1 — Unknown element renders a placeholder**

**Given** `VStack { Foo { Text("in") } }` in the base pack, **when** it is rendered, **then** the
result has one error with code `unknown`, and the HTML contains `<div class="mkd-unknown" data-el="Foo">`
holding the name `Foo` and the `Text` child.

Automated by `tests/test_render.py::EvaluateRenderTests::test_unknown_element_is_an_error_but_renders`.

**R-EVAL-003.TC-2 — Dotted element names**

Conformance cases `eval-dotted-names` in both suites: in a pack with `BadgeRibbon`, `Badge.Ribbon("New")`
renders the same element as `BadgeRibbon("New")` with `data-el="Badge.Ribbon"`; `Color.red` still makes a
colour; `Nope.Thing()` is an `unknown` error naming `Nope.Thing`; a `let` named `Badge` makes
`Badge.Ribbon` a member access, not a dotted name.

**R-EVAL-003.TC-3 — Qualified components in resolution order**

With library `acme` declaring `Card` and the pack also having a `Card` element, `acme.Card()` instantiates the struct, `Card()` instantiates the struct (unique), and a block-local `Card` wins over both for `Card()` but not for `acme.Card()`. Automated in `python/tests/` and the TypeScript unit tests.

**Realizes.** F-2, F-3, F-4

| | Statement |
|---|---|
| C1 | When a call `Name(…)` appears where views are expected, the evaluator MUST resolve `Name` in this order: `ForEach`; a qualified component `L.Name` when `L` names a loaded library (R-IMP-007.C4); a struct declared in the block or imported (R-IMP-007.C5); a variable in scope (calling a view-valued property such as `content()`); an element of the selected pack. |
| C2 | If none matches, then the evaluator MUST report the error "'Name' is not an element of pack '<id>' and no struct of that name is declared or imported" with code `unknown`, and MUST produce an `unknown` view named `Name` whose children are the views of its unlabelled trailing closure. |
| C3 | When a bare identifier appears where views are expected, the evaluator MUST use the variable of that name if one is in scope, else call the struct or element of that name with no arguments; if neither exists, then it MUST report "unknown view or variable" with code `unknown` and produce an `unknown` view. |
| C4 | When a string or number literal, or an interpolated string, appears where views are expected, the evaluator MUST produce a `Text` element with that content. |
| C5 | When a variable holding a string or number is used where views are expected, the evaluator MUST produce a `Text` element with its value; a variable holding `nil` MUST produce no view. |
| C6 | When `Color.<name>` appears where views are expected, the evaluator MUST produce a `Color` element with that colour. |
| C7 | When a member access without parentheses (`view.modifier`) appears where views are expected, the evaluator MUST treat it as a modifier call with no arguments. |
| C8 | If an expression that cannot produce views appears where views are expected, then the evaluator MUST report "this expression does not produce a view" with code `view`. |
| V1 | With a struct `Card` declared in the block, `Card("x")` instantiates the struct even when the pack also has a `Card` element; `Foo()` with no such struct or element is an `unknown` error and an `unknown` view. |
| C9 | When a call's callee is a dotted name `A.B` (or `A.B.C`) whose parts all begin with an uppercase letter and whose first part is neither a variable in scope nor `Color`, the evaluator MUST resolve the call as C1 resolves the joined name (`AB`), so that `Badge.Ribbon(…)` calls the element `BadgeRibbon`. |
| C10 | The view of a dotted call MUST keep the dotted name as written as its name (M-VIEW-1.F1), and an unresolved dotted call MUST be reported by C2 with the dotted name. |

---

### R-EVAL-004 — Binding element arguments

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

**R-EVAL-004.TC-1 — Unknown labelled arguments**

Conformance cases `diag-unknown-label` (a misspelt label on a core element and on a pack element, an
alias, a default, a slot label, an `action:` closure and a binding — only the first two warn) with their
`diag.json`, in both suites; the order and text of the warnings are identical. `test_examples.py`, the
pattern tests (R-WEB-004.TC-7) and `gen_reference.py --check` fail on any `argument` warning in the
example site, the design patterns or the reference samples (F-12.AC5).

**Realizes.** F-2, F-3, F-12

| | Statement |
|---|---|
| C1 | When an element is called, the evaluator MUST start the view's attributes from the element definition's defaults, then set one attribute per labelled argument, named by its label. |
| C2 | The evaluator MUST assign positional arguments to the element definition's `params` in order; positional arguments beyond them MUST be kept as extra arguments. |
| C3 | The evaluator MUST evaluate an element's unlabelled trailing closure as its children and each labelled trailing closure as a named slot. |
| C4 | When a labelled argument's value is a closure, the evaluator MUST evaluate it as views: the argument `content` becomes the children when there are none yet, any other label becomes a slot of that name. |
| C5 | The evaluator MUST discard closure-valued arguments labelled `action`, `onCommit`, `onEditingChanged` or `perform` without evaluating them. |
| C6 | When a labelled argument's value is a list of views (a view call used as an argument, such as `label: Label(…)`), the evaluator MUST also make it the slot of that label unless a slot of that name already exists. |
| V1 | `Button("Save", systemImage: "tray") { … }` with params `["label"]` yields attributes `label="Save"`, `systemImage="tray"`; `Section("A") { X() } footer: { Y() }` yields children `[X]` and slot `footer: [Y]`; `Button("Go", action: { doIt() })` evaluates nothing for `action`. |
| C7 | A labelled argument of an element call is understood when its label is a name in the element definition's `params` or `defaults`, an argument alias of its pack (R-PACK-011), a label its render role reads, a closure or slot label (C3, C4, C6), or a discarded action label (C5). |
| C8 | Each variant MUST hold, for every render role, the labels that role reads, and the two variants' lists MUST be the same. |
| C9 | If a labelled argument of an element call is not understood (C7) and its value is not a binding (`$name`), then the evaluator MUST report the warning "'<label>' is not understood by <Element> in pack '<id>'" with code `argument`, at the argument's location, and still render the element. |
| C10 | The shipped design patterns, the reference samples and the example site MUST render without a warning of C9. |

---

### R-EVAL-005 — Instantiating struct components

Components behave like SwiftUI views: memberwise arguments, defaults, a trailing closure for
content. Struct bodies are isolated from the caller's scope, as Swift's are, so a component behaves
the same wherever it is used. The recursion limit protects the build from a component that
contains itself.

**R-EVAL-005.TC-1 — Component with slot and defaults**

**Given** a struct with a `@ViewBuilder var content: Content` property and a defaulted property,
**when** it is called with a labelled argument and a trailing closure, **then** the closure's views
appear where the body names `content`, the default applies, and the root view carries
`data-component="<struct name>"`.

Automated by `tests/test_render.py::EvaluateRenderTests::test_struct_component_with_slot_and_defaults`.

**R-EVAL-005.TC-2 — Trailing closure prefers content**

A struct with `@ViewBuilder var sidebar: some View = Text("Nav")` declared before `@ViewBuilder var content: some View` binds the trailing closure to `content`; a struct with slots `header` (defaulted) and `body2` (no default) and no `content` binds it to `body2`; a struct whose only view property is defaulted binds it there. Automated in both variants.

**Realizes.** F-4 · **Decisions.** ADR-10

| | Statement |
|---|---|
| C1 | When a struct is instantiated, the evaluator MUST bind labelled arguments to properties of the same name; if a label names no property, then it MUST warn "struct S has no property 'x'" with code `argument`. |
| C2 | The evaluator MUST bind the unlabelled trailing closure to a view-typed, non-computed property that no labelled argument bound: the one named `content` if there is one, else the first in declaration order that has no default, else the first; it MUST bind each labelled trailing closure to the property of its label; if there is no such property, then it MUST warn with code `argument`. |
| C3 | The evaluator MUST bind positional arguments, in order, to the stored properties not already bound, in declaration order. |
| C4 | The evaluator MUST give each remaining property its default value, evaluated in the struct's own scope after the properties declared before it; a property with neither argument nor default MUST be `nil`, and if its type does not end in `?`, then the evaluator MUST report "missing argument 'x' for struct S" with code `argument`. |
| C5 | If positional arguments remain after binding, then the evaluator MUST warn "too many arguments for struct S" with code `argument`. |
| C6 | The evaluator MUST evaluate the struct body in a new scope holding only the struct's properties, so the caller's variables are not visible inside the body; closures passed in MUST keep the caller's scope. |
| C7 | The evaluator MUST make each computed property a deferred view value evaluated in the struct's scope when used. |
| C8 | If the struct has no body, then the evaluator MUST report "struct S has no `var body: some View { … }`" with code `struct` and produce no views. |
| C9 | The evaluator MUST mark every top-level view of the body with the struct's name as its component, unless it already carries an inner component's name, and MUST record the struct in the screen's list of used components. |
| C10 | If struct instantiation nests 48 levels deep, then the evaluator MUST report "struct S nests too deeply (recursive?)" with code `recursion` and produce no views. |
| V1 | `struct Pill: View { var text: String; var color: Color = .green; var body: some View { … } }` called as `Pill(text: "On")` binds `color` to `.green`; `Pill()` reports the missing `text`; a struct that instantiates itself stops at depth 48 with a `recursion` error. |
| V2 | `struct Shell: View { @ViewBuilder var sidebar: some View = Text("Nav"); @ViewBuilder var content: some View; var body: some View { … } }` called as `Shell { Text("Hi") }` binds `content` to the closure and `sidebar` to its default, with no diagnostic. |

---

### R-EVAL-006 — ForEach

`ForEach` is the only loop. Destructuring tuples into closure parameters is a small extension of
Swift (which would need `item.0`) that makes row data easy to write.

**R-EVAL-006.TC-1 — ForEach with tuples and interpolation**

Automated by `tests/test_render.py::EvaluateRenderTests::test_foreach_tuples_and_interpolation`.

**Realizes.** F-2

| | Statement |
|---|---|
| C1 | The evaluator MUST take `ForEach`'s data from its first argument when unlabelled or labelled `data`, and its content from an unlabelled or `content:` trailing closure or a `content:` closure argument; other arguments (such as `id:`) MUST be ignored. |
| C2 | The evaluator MUST iterate an integer `n` as `0 … n-1`, an array or tuple as its items, a dictionary as `(key, value)` pairs, and a string as one item. |
| C3 | The evaluator MUST evaluate the content closure once per item, binding a single parameter to the item; with two or more parameters and a tuple or array item, it MUST bind the parameters to the item's elements in order; `_` MUST bind nothing and missing elements MUST be `nil`. |
| C4 | If the content closure is missing, then the evaluator MUST report "ForEach needs a content closure"; if the data is of another kind, then it MUST report "ForEach needs an array, a range or a count"; both with code `foreach`. |
| C5 | If the data has more than 500 items, then the evaluator MUST render only the first 500 and warn "ForEach truncated to 500 items" with code `foreach`. |
| C6 | A modifier applied to a `ForEach` MUST apply to every view it produced. |
| V1 | `ForEach(team) { name, dept, online in … }` over three 3-tuples renders three rows with the tuple values; `ForEach(0..<3) { i in Text("\(i)") }` renders `0`, `1`, `2`. |

---

### R-EVAL-007 — Conditionals and local bindings

Conditions make one mockup describe a state precisely — `if showBanner { Banner(…) }` — with the
state set by a `let` at the top of the block.

**R-EVAL-007.TC-1 — if and ternary**

Automated by `tests/test_render.py::EvaluateRenderTests::test_if_and_ternary`.

**Realizes.** F-2

| | Statement |
|---|---|
| C1 | The evaluator MUST evaluate `if` by the truthiness of its condition and render only the chosen branch's views; `else if` chains MUST be evaluated in order. |
| C2 | Truthiness MUST be: `nil`, `false`, `0` and `0.0` are false; strings, arrays, dictionaries and tuples are true when non-empty; every other value is true. |
| C3 | The evaluator MUST evaluate a ternary in view position by rendering the chosen operand's views, and in value position by returning the chosen operand's value. |
| C4 | A `let` or `var` statement MUST bind its name in the current block's scope for the statements after it and for closures and nested blocks evaluated from them. |
| V1 | `if items.isEmpty { Text("None") } else { List { … } }` renders the list for a non-empty array; `let n = 3` followed by `Text("\(n)")` renders `3`. |

---

### R-EVAL-008 — Values and operators

Values are deliberately small: enough to compute labels, counts and choices. Enum values
(`.title`, `.borderedProminent`, `Color.red`) are kept symbolic — the renderer and the packs decide
what they mean — so the notation needs no knowledge of SwiftUI's type system.

**R-EVAL-008.TC-1 — Values and operators**

Python unit tests `python/tests/test_evaluate.py` `ValueTests`, evaluating expressions directly and
through interpolation: literals, arrays, dictionaries, `[:]`, tuples and labelled tuples keyed by label
or position (C1); `3 2.5 nil [1, 2]`, `true`, enum names, six significant digits (`0.333333`,
`1.23457e+06`) and empty text for a view (C2, V1); `.red`, `.custom("Inter", size: 12)`, `Color.red`,
`Font.custom("x")`, `.constant(5)` and a variable shadowing a namespace (C3); mapping keys, `count`,
`isEmpty`, `first`, `last` (`nil` when empty), `.1` and members of enum values (C4); `uppercased`,
`lowercased`, `capitalized`, `joined` with and without a separator, `contains`, `hasPrefix`,
`hasSuffix` (C5); concatenation, addition, integer and float division, comparison, truthiness with
short-circuit (unknown names on the skipped side are never looked up), unary minus and its error (C6,
V1); closed, half-open, empty and continuous ranges and the bound error (C7); subscripts on arrays,
tuples, strings and mappings and "subscript out of range" yielding `nil` (C8, V1); `GridItem(.flexible())`
and `URL(string:)` as call values and key paths as `nil` (C9); operator, division-by-zero, member and
name errors with codes `value` and `unknown`, each yielding `nil` (C10). The conformance case
`lang-expressions` holds both variants to the same values.

**Realizes.** F-2

| | Statement |
|---|---|
| C1 | The evaluator MUST evaluate literals to strings, integers, floating-point numbers, booleans and `nil`; arrays to lists; dictionaries to mappings; unlabelled tuples to tuples and labelled tuples to mappings keyed by label (or position for unlabelled members). |
| C2 | The evaluator MUST format interpolated values as: `nil`; `true`/`false`; integral floats without a fraction (`3.0` → `3`); other floats with at most six significant digits, as C's `%g` (`1.0 / 3` → `0.333333`); enum values by name; arrays as `[a, b]`; view values as empty text. |
| C3 | The evaluator MUST evaluate `.name` to an enum value, `.name(args)` to an enum value carrying its arguments, `Type.name` and `Type.name(args)` to an enum value in namespace `Type` when `Type` is not a variable, struct or element, and `.constant(x)` to `x`. |
| C4 | The evaluator MUST support these members: a mapping's keys; `count` and `isEmpty` on strings, arrays, tuples and mappings; `first` and `last` on arrays and tuples (`nil` when empty); `.0`, `.1`, … on tuples; and a member of an enum value as an enum value in that namespace (`.red.opacity(0.3)`). |
| C5 | The evaluator MUST support the methods `uppercased()`, `lowercased()`, `capitalized()`, `hasPrefix(_:)` and `hasSuffix(_:)` on strings, `contains(_:)` on strings, arrays, tuples and mappings (a mapping's keys), and `joined(separator:)` on arrays and tuples (separator `""` when omitted). |
| C6 | The evaluator MUST evaluate `+` as string concatenation when either operand is a string and as addition otherwise; `-`, `*`, comparison and equality as usual; `/` as integer division when both operands are integers; `!` and `&&` and the or-operator (two vertical bars) by truthiness with short-circuit; unary `-` on numbers only. |
| C7 | The evaluator MUST evaluate `a...b` to the integers a through b and `a..<b` to a through b-1 when both bounds are integers, and to the list of its two bounds as floats when either is a float (a continuous range, as in `Slider(in: 0.2...0.8)`); if a bound is not a number, then it MUST report "a range needs numeric bounds" with code `value` and yield an empty list. |
| C8 | The evaluator MUST evaluate subscripts on arrays, tuples, strings and mappings; if the index is absent or invalid, then it MUST report "subscript out of range" with code `value` and yield `nil`. |
| C9 | The evaluator MUST evaluate a call to a name that is not a view, struct, element or view-valued variable as a call value carrying its name and arguments (for example `GridItem(.flexible())`), and a key path to `nil`. |
| C10 | If an operator cannot be applied to its operands, a member does not exist, or a name is unknown, then the evaluator MUST report the problem with code `value` (or `unknown` for names) and yield `nil`. |
| V1 | `"\(3.0) \(2.5) \(nil) \([1, 2])"` evaluates to `3 2.5 nil [1, 2]`; `7 / 2` is `3`; `"a" + 1` is `a1`; `[1][3]` reports `subscript out of range`. |

---

### R-EVAL-009 — Modifiers

Modifiers come in three kinds. Pack-mapped modifiers set attributes the pack's CSS keys on — the
same `.buttonStyle(.bordered)` becomes `data-variant="bordered"` in every pack. Rendered modifiers
are interpreted by the renderer (layout, typography, colour, navigation, presentation). Behaviour
modifiers have no visual effect and are accepted so that real SwiftUI code can be pasted.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**R-EVAL-009.TC-1 — Modifiers become style and data attributes; unknown ones warn**

Automated by `tests/test_render.py::EvaluateRenderTests::test_modifiers_become_style_and_data` and
`test_unknown_modifier_is_a_warning`.

**Realizes.** F-2, F-3 · **Decisions.** ADR-4

| | Statement |
|---|---|
| C1 | When a modifier call `.name(…)` is applied to views, the evaluator MUST evaluate the base expression first and apply the modifier to every view the base produced. |
| C2 | When the selected pack's modifier map has an entry for the modifier, the evaluator MUST set the view attribute the entry names (`attr`, default the modifier's name) to the entry's fixed `value` if it has one, else to the first positional argument, else to the first labelled argument's value, else to `true`; an enum value MUST be stored as its name. |
| C3 | When the modifier is not in the pack's map but is a rendered modifier, the evaluator MUST record it on the view with its positional arguments, labelled arguments, unlabelled trailing-closure content and labelled closure slots. |
| C4 | The rendered modifiers MUST be: `padding` `frame` `offset` `zIndex` `font` `fontWeight` `bold` `italic` `underline` `strikethrough` `monospaced` `fontDesign` `foregroundStyle` `foregroundColor` `background` `tint` `accentColor` `opacity` `cornerRadius` `clipShape` `shadow` `border` `fill` `stroke` `multilineTextAlignment` `textCase` `imageScale` `resizable` `aspectRatio` `scaledToFit` `scaledToFill` `hidden` `lineLimit` `id` `ref` `class` `badge` `help` `overlay` `navigationTitle` `navigationSubtitle` `navigationBarTitleDisplayMode` `toolbar` `tabItem` `searchable` `alert` `sheet` `confirmationDialog` `popover` `fullScreenCover` `inspector` `labelsHidden`. |
| C5 | When the modifier is neither in the pack's map nor rendered but is one of the behaviour-only modifiers listed in the language reference, the evaluator MUST ignore it silently. |
| C6 | If the modifier is unknown, then the evaluator MUST warn "unknown modifier .name() is ignored" with code `modifier` and leave the views unchanged. |
| C7 | For a recorded modifier, a closure-valued labelled argument MUST become a slot of that label (except `action` and `perform`, which are discarded), and when there is no trailing closure, the first view-list positional argument or a view-list `content:` argument MUST become its content. |
| V1 | In a pack whose map has `buttonStyle → {attr: variant}`, `.buttonStyle(.borderedProminent)` sets `variant="borderedProminent"`; `.onTapGesture { }` is silent; `.wobble()` warns; `.padding(8)` is recorded and rendered as padding. |

---

### R-EVAL-010 — The @Screen directive

`@Screen` replaces the prototype's `screen <ID> "title" kit: … form: …` header (SRC-3) with
Swift attribute syntax, so the metadata travels with the code when a block is copied; the fence
can still override it for one rendering.

**R-EVAL-010.TC-1 — Options and the screen directive**

Automated by `tests/test_render.py::EvaluateRenderTests::test_options_and_screen_directive`.

**Realizes.** F-1, F-6 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The evaluator MUST read `@Screen(…)` arguments into the screen's metadata: a labelled argument under its label, the first unlabelled argument as `title`, later unlabelled arguments under `_<position>`; enum values MUST be stored by name. |
| C2 | The metadata keys `title`, `id`, `device`, `appearance`, `chrome`, `url` and `pack` MUST take effect as specified for each (R-PACK-005, R-DEV-002, R-APP-001, R-DEV-006, R-REND-001); other keys MUST be ignored. |
| C3 | If a top-level directive other than `@Screen` is present, then the evaluator MUST warn "unknown directive @Name" with code `directive` and ignore it. |
| C4 | Values given by fence attributes or render options MUST override the corresponding `@Screen` metadata. |
| V1 | `@Screen("Checkout", id: "SCR-2", device: .phone)` with fence `device="tablet"` renders a tablet frame captioned `SCR-2 · Checkout`. |

---

### R-EVAL-011 — Tolerance for pasted SwiftUI

Pasting real code is a primary use case (F-2.UC-1). Everything that only matters at run time is
accepted and dropped; `@State` values become the state the mockup shows.

**R-EVAL-011.TC-1 — A pasted SwiftUI view**

Python unit tests `python/tests/test_evaluate.py` `PastedSwiftUITests`: a pasted settings view with
`@State`, `@Binding`, `@ObservedObject`, `@Environment(\.colorScheme)`, a `public static let`,
`return`, `some View`, type annotations, a force unwrap, `import Combine`, `$wifi`, `.onTapGesture` and
`.onAppear` closures calling unknown functions and an `action:`/`perform:` closure renders an on toggle
and its texts with no diagnostics (C1-C5, V1). `@ViewBuilder` marks view properties, computed and slot,
while another attribute leaves an ordinary property (C1); access and `static` modifiers, conformance
lists, `return`, optional types, force unwraps and key paths are accepted silently (C2); the ten neutral
modules select no pack and draw no warning, alongside `import SwiftUI` too, while an unknown module warns
(C3); `$name` and `.constant(x)` read the value (C4); action closures and behaviour-only modifiers'
closures produce no views and no diagnostics (C5).

**Realizes.** F-2 · **Decisions.** ADR-2

| | Statement |
|---|---|
| C1 | The evaluator MUST ignore property attributes (`@State`, `@Binding`, `@Environment(…)`, `@ObservedObject`, …) other than `@ViewBuilder`, which marks a view property. |
| C2 | The evaluator MUST ignore access and `static` modifiers, conformance lists, `return`, `some`, type annotations, key paths and force unwraps. |
| C3 | When `import` names one of the modules `Foundation`, `Combine`, `Observation`, `UIKit`, `AppKit`, `SwiftData`, `Charts`, `MapKit`, `PhotosUI` or `WebKit`, the evaluator MUST accept it without selecting a pack and without a warning. |
| C4 | The evaluator MUST evaluate `$binding` as the bound value and `.constant(x)` as `x`, so `Toggle("Wi-Fi", isOn: $wifi)` reads `wifi`. |
| C5 | The evaluator MUST NOT evaluate closures passed as action arguments (R-EVAL-004.C5) nor the trailing closures of behaviour-only modifiers (`.onTapGesture { … }`, `.onAppear { … }`), so their contents produce no views and no diagnostics. |
| V1 | A pasted view with `@State private var wifi = true`, `import Combine`, `Toggle("Wi-Fi", isOn: $wifi)` and `.onTapGesture { wifi.toggle() }` renders an on toggle with no diagnostics. |

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.12.9 | 2026-11-27 | test cases backfilled: TC-1 verifies C1-C5 (#58); as built: C4 the implicit preview instance shows a required property's name as placeholder; TC-1 verifies C1-C4 (#58); as built: C2 floats with six significant digits (%g), C5 contains/hasPrefix/hasSuffix, C7 continuous ranges and the numeric-bounds error; TC-1 verifies C1-C10 (#58); test cases backfilled: TC-1 verifies C1-C3 (#58) |
| 0.12.0 | 2026-11-27 | SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.0 | 2026-11-26 | dotted element names resolve to the joined name (F-2.C7): C9, C10, TC-2 (ING-1); unknown labelled arguments are warned (F-12.C6): C7-C10, TC-1 (ING-1) |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
| 0.12.0 | 2026-11-27 | SRC-19: import map replaces import_paths; library names and qualified references; page library blocks; templates with slots; User guide |
| 0.10.8 | 2026-11-27 | re-checked after the renderer split: unaffected (#53) |
| 0.10.0 | 2026-11-26 | dotted element names resolve to the joined name (F-2.C7): C9, C10, TC-2 (ING-1); unknown labelled arguments are warned (F-12.C6): C7-C10, TC-1 (ING-1) |
| 0.2.1 | 2026-11-24 | As built: the implementation now matches the clauses; known-deviation note removed |
| 0.2.0 | 2026-11-24 | Page created |
