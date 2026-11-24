---
title: Language reference
spec_version: 0.2.0
status: draft
updated: 2026-11-24
page_id: REF.1
---

# Language reference

A reader's reference for the mockitdown language: the grammar, the values, the modifiers and
worked examples. The normative statements are the requirements on [Syntax](syntax.md) (R-LANG) and
[Semantics](semantics.md) (R-EVAL); where this page and a requirement differ, the requirement wins.

Every example on this page is a live ```` ```mockitdown ```` block rendered by this site with the
neutral `base` pack; open **Source** under a figure to see its code.

## A first example

```mockitdown source="true" device="fit" title="Release notes"
VStack(alignment: .leading, spacing: 10) {
  Text("Release notes").font(.title2)
  Text("Version **2.4** adds *offline mode* and `sync` fixes.")
    .foregroundStyle(.secondary)
  HStack {
    Label("Download", systemImage: "arrow.down.to.line")
    Spacer()
    Button("Install").buttonStyle(.borderedProminent)
    Button("Later")
  }
  ProgressView("Downloading", value: 0.62)
}
.padding()
.frame(width: 420)
```

## Grammar

Informal EBNF; `{ x }` repeats, `[ x ]` is optional, `|` separates alternatives. Line feeds separate
statements; the exceptions are listed after the grammar.

```text
module      := { ( import | directive | struct | preview | statement ) separator }
separator   := NEWLINE | ';'
import      := 'import' ( STRING | IDENT { '.' IDENT } )
directive   := '@' IDENT [ args ]                       -- top level, e.g. @Screen(...)
struct      := { '@' IDENT [ args ] | declmod } 'struct' IDENT [ ':' IDENT { ',' IDENT } ]
               '{' { property separator } '}'
property    := { '@' IDENT [ args ] | declmod } ( 'var' | 'let' ) IDENT
               [ ':' type ] [ '=' expr ] [ block ]
declmod     := 'private' | 'public' | 'fileprivate' | 'internal' | 'static'
preview     := '#' 'Preview' [ args ] block             -- its statements become top-level ones
block       := '{' { statement separator } '}'
statement   := 'if' expr block [ 'else' ( ifstmt | block ) ]
             | ( 'let' | 'var' ) IDENT [ ':' type ] '=' expr
             | [ 'return' ] expr
expr        := or [ '?' expr ':' expr ]
or          := and { '||' and }
and         := cmp { '&&' cmp }
cmp         := range { ( '==' | '!=' | '<' | '>' | '<=' | '>=' ) range }
range       := add { ( '...' | '..<' ) add }
add         := mul { ( '+' | '-' ) mul }
mul         := unary { ( '*' | '/' ) unary }
unary       := ( '!' | '-' ) unary | postfix
postfix     := primary { '.' NAME | args [ trailing ] | trailing | '[' expr ']' | '!' }
trailing    := closure { NAME ':' closure }             -- labelled trailing closures
args        := '(' [ arg { ',' arg } ] ')'
arg         := [ NAME ':' ] expr
closure     := '{' [ params 'in' ] { statement separator } '}'
params      := '_' | IDENT [ ':' TYPE ] { ',' IDENT [ ':' TYPE ] }
             | '(' IDENT { ',' IDENT } ')'
primary     := NUMBER | STRING | 'true' | 'false' | 'nil' | IDENT | '.' NAME
             | '[' [ expr { ',' expr } ] ']' | '[' expr ':' expr { ',' expr ':' expr } ']' | '[' ':' ']'
             | '(' arg { ',' arg } ')' | closure | '\' [ IDENT ] { '.' NAME } | '$' IDENT
NAME        := IDENT | keyword                          -- `.default`, `in:` are valid
```

**Line rules** (R-LANG-007):

- A call's `(` and a trailing closure's `{` must be on the same line as what they follow.
- A line that starts with `.name` continues the expression on the previous line (modifier chains).
- `label: {` on a following line continues the trailing closures of the previous call.
- Inside `( … )` and `[ … ]`, and after a binary operator, line feeds are ignored.
- `else` may start the line after an `if` block's closing brace.

**Not in the language**: functions and `init` (a syntax error with an explicit message), generics,
`switch`, `for`/`while` (use `ForEach`), assignment, `guard`, casts, `try`/`await`, custom operators,
extensions and protocols.

## Lexical elements

| Element | Form |
|---|---|
| Comments | `// …` to end of line; `/* … */`, nesting |
| Identifiers | letter or `_`, then letters, digits, `_`; `` `name` `` escapes a keyword |
| Keywords | `import struct var let if else in true false nil some private public fileprivate internal static return` |
| Numbers | `42`, `1_000`, `0.5` (no exponent, hex or leading `.`) |
| Strings | `"…"` single line; `"""` multi-line (Swift indentation rules); escapes `\n \t \r \0 \" \' \\ \u{1F600}`; interpolation `\(expr)` |

## Values

| Written | Value | Notes |
|---|---|---|
| `"text"`, `42`, `0.5`, `true`, `nil` | string, integer, float, boolean, nil | |
| `[a, b]`, `0...4`, `0..<4` | list | ranges need integer bounds |
| `["k": v]`, `[:]` | dictionary | |
| `(a, b)` | tuple | destructured by `ForEach` closure parameters |
| `(name: a, age: b)` | dictionary keyed by label | `.name` accesses a field |
| `.red`, `.title`, `.system(size: 12)` | enum value (symbolic) | interpreted by roles and modifiers |
| `Color.red`, `Font.title` | enum value in a namespace | when the prefix is not a variable, struct or element |
| `.red.opacity(0.3)` | enum value with an argument | colours accept an opacity |
| `.constant(x)`, `$x` | `x` | SwiftUI bindings unwrap to their value |
| `GridItem(.flexible())` | call value | a non-view call used as data |
| `Text("x")` as an argument | list of views | becomes a slot of the element |
| `{ … }` | closure | evaluated where views are expected |

Members and methods: `count`, `isEmpty` (strings, collections); `first`, `last` (lists, tuples);
dictionary keys by name; `uppercased()`, `lowercased()`, `capitalized()`; `joined(separator:)`.
Operators: `+` (adds numbers, concatenates when either side is a string), `- * /` (integer division
for integers), comparisons, `== !=`, `&& || !` (by truthiness), ternary `?:`.

**Truthiness**: `nil`, `false`, `0` and empty strings or collections are false; everything else is
true.

**Interpolation** writes `nil`, `true`/`false`, `3` for `3.0`, enum values by name, and lists as
`[a, b]`.

## Elements and arguments

An element call `Name(positional…, label: value…) { children } label: { slot }` creates a view of the
pack's element `Name`. Positional arguments take the element's parameter names in order (for
example `Button`'s first positional argument is `label`); labelled arguments set attributes of the
same name; the trailing closure gives the children; labelled closures give named slots. Which
attribute and slot names an element understands depends on its **render role** — see the
[Role catalogue](../rendering/roles.md). The core elements every pack has are listed in R-PACK-009;
each pack's full element list is on the [Pack catalogue](../packs/catalogue.md).

## Modifiers

A modifier is resolved in this order (R-EVAL-009):

1. **Pack-mapped** — the pack's `modifiers` map sets an attribute. In every pack (from `base`):

    | Modifier | Sets attribute |
    |---|---|
    | `buttonStyle`, `listStyle`, `pickerStyle`, `toggleStyle`, `textFieldStyle`, `datePickerStyle`, `tabViewStyle`, `progressViewStyle`, `gaugeStyle`, `menuStyle`, `formStyle`, `groupBoxStyle`, `navigationSplitViewStyle` | `variant` |
    | `controlSize` | `size` |
    | `buttonBorderShape` | `shape` |
    | `labelStyle` | `labelStyle` |
    | `variant`, `size`, `severity`, `state`, `selected`, `disabled`, `badge`, `elevation`, `density`, `expanded`, `open`, `color` | the attribute of the same name |

    Framework packs add their own (for example a Fluent `appearance` or a Material `variant`
    vocabulary).

2. **Rendered** — interpreted by the renderer and the style builder:

    | Group | Modifiers |
    |---|---|
    | Layout | `padding`, `frame`, `offset`, `zIndex` |
    | Typography | `font`, `fontWeight`, `bold`, `italic`, `underline`, `strikethrough`, `monospaced`, `fontDesign`, `multilineTextAlignment`, `textCase`, `lineLimit` |
    | Colour and shape | `foregroundStyle`, `foregroundColor`, `background`, `tint`, `accentColor`, `opacity`, `cornerRadius`, `clipShape`, `shadow`, `border`, `fill`, `stroke` |
    | Images | `imageScale`, `resizable`, `aspectRatio`, `scaledToFit`, `scaledToFill` |
    | Visibility and semantics | `hidden`, `id`, `ref`, `class`, `badge`, `help`, `overlay`, `labelsHidden` |
    | Navigation | `navigationTitle`, `navigationSubtitle`, `navigationBarTitleDisplayMode`, `toolbar`, `tabItem`, `searchable` |
    | Presentation | `alert`, `sheet`, `confirmationDialog`, `popover`, `fullScreenCover`, `inspector` |

3. **Ignored** — behaviour-only SwiftUI modifiers, accepted silently: `onTapGesture`, `onAppear`,
   `onDisappear`, `onChange`, `onSubmit`, `onDelete`, `onMove`, `task`, `refreshable`, `animation`,
   `transition`, `gesture`, `simultaneousGesture`, `contentShape`, `accessibilityLabel`,
   `accessibilityHint`, `accessibilityIdentifier`, `accessibilityElement`, `keyboardType`,
   `textContentType`, `textInputAutocapitalization`, `autocorrectionDisabled`, `submitLabel`,
   `focused`, `environment`, `environmentObject`, `tag`, `symbolRenderingMode`, `symbolVariant`,
   `listRowInsets`, `listRowSeparator`, `listSectionSeparator`, `listRowBackground`,
   `scrollContentBackground`, `toolbarBackground`, `toolbarColorScheme`, `toolbarRole`,
   `navigationDestination`, `navigationBarBackButtonHidden`, `presentationDetents`,
   `presentationDragIndicator`, `interactiveDismissDisabled`, `preferredColorScheme`,
   `statusBarHidden`, `ignoresSafeArea`, `safeAreaInset`, `layoutPriority`, `fixedSize`,
   `contextMenu`, `draggable`, `dropDestination`, `swipeActions`, `scrollIndicators`,
   `scrollDisabled`, `minimumScaleFactor`, `allowsTightening`, `truncationMode`, `kerning`,
   `tracking`, `baselineOffset`, `contentTransition`, `sensoryFeedback`, `hoverEffect`, `focusable`,
   `keyboardShortcut`, `dynamicTypeSize`, `privacySensitive`, `redacted`, `containerRelativeFrame`,
   `scrollTargetBehavior`, `scrollTargetLayout`, `matchedGeometryEffect`, `glassEffect`,
   `backgroundStyle`, `compositingGroup`, `drawingGroup`, `blur`, `saturation`, `brightness`,
   `rotationEffect`, `scaleEffect`, `mask`.

4. **Unknown** — anything else draws a `modifier` warning and is ignored.

**Font styles.** `.font(.title)` uses the canonical styles `display`, `largeTitle`, `title`,
`title2`, `title3`, `headline`, `subheadline`, `body`, `callout`, `footnote`, `caption`, `caption2`,
`overline`; framework names are aliased onto them (`h1` → `display`, `h4` → `title2`,
`subtitle1` → `headline`, `body2` → `callout`, `titleMedium` → `headline`, `labelSmall` → `caption`,
…), and a pack may add its own aliases.

**Colours.** Named (`.red`, `.blue`, …), semantic (`.primary`, `.secondary`, `.accentColor`,
`.danger`, `.success`, `.separator`, …), hex strings (`"#3b6fd8"`), `rgb()`/`hsl()` strings and
`Color(red:green:blue:)`, each optionally `.opacity(x)`.

## Imports and directives

```swift
import SwiftUI            // selects a pack by module name (R-PACK-005)
import "shared/kpi"       // loads components from shared/kpi.mockitdown (R-IMP)
@Screen("Checkout", id: "SCR-2", device: .phone, appearance: .both)
```

`@Screen` keys: `title` (also the first unlabelled argument), `id`, `device`, `appearance`,
`chrome`, `url`, `pack`. Fence attributes override them.

## Components

A component is a `struct` view; properties with defaults are optional, a `@ViewBuilder` or
`Content`-typed property receives the trailing closure, and the body places it by name.

```mockitdown source="true" device="fit" title="An inline component"
struct Metric: View {
  var label: String
  var value: String
  var color: Color = .green
  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(label).font(.caption).foregroundStyle(.secondary)
      Text(value).font(.title2).foregroundStyle(color)
    }
    .padding(12)
    .border(.separator)
    .cornerRadius(8)
  }
}

HStack(spacing: 12) {
  Metric(label: "Uptime", value: "99.98%")
  Metric(label: "Errors", value: "12", color: .red)
  Metric(label: "Latency", value: "84 ms", color: .orange)
}
.padding()
```

Components can live in a library file and be imported by path. This site's `import_paths` contains
the directory of a small library declaring `StatusPill` and `Panel`:

```mockitdown source="true" device="fit" title="Imported components"
import "status"

Panel(title: "Services") {
  HStack(spacing: 8) {
    StatusPill(text: "API")
    StatusPill(text: "Search", color: .orange)
    StatusPill(text: "Billing", color: .red)
  }
}
.frame(width: 360)
```

## Data and control flow

```mockitdown source="true" device="fit" title="let, ForEach, if and interpolation"
let team = [("Ana Lima", "Design", true), ("Ben Okafor", "Engineering", false),
            ("Chen Wu", "Research", true)]
let showFooter = true
let updated = "today"

List {
  ForEach(team) { name, dept, online in
    Row(name, subtitle: dept, detail: online ? "Online" : "Away", avatar: name)
  }
  if showFooter {
    Text("\(team.count) people · updated \(updated.uppercased())")
      .font(.footnote).foregroundStyle(.secondary)
  }
}
.frame(width: 420)
```

## Screens, devices and presentations

```mockitdown source="true" device="phone" appearance="both" title="Settings with an alert" id="SCR-SET-1" elements="true"
NavigationStack {
  List {
    Row("Wi-Fi", detail: "Home", systemImage: "wifi", chevron: true).id("wifi")
    Row("Bluetooth", detail: "On", systemImage: "bolt", chevron: true)
    Row("Notifications", systemImage: "bell", chevron: true).badge(2)
  }
  .navigationTitle("Settings")
  .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Edit") } }
  .alert("Sign out?", isPresented: true) {
    Button("Cancel")
    Button("Sign Out", role: .destructive).id("sign-out").ref("UC-ACC-4")
  } message: {
    Text("You will need your password to sign in again.")
  }
}
```

## Revision history

| Version | Date | Change |
|---|---|---|
| 0.2.0 | 2026-11-24 | Page created |
