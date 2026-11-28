The syntax tree the editor works on. The renderer only needs line and column; an editor needs to know
exactly which characters belong to which call, so that an edit can replace a span and leave everything
else as the author wrote it — comments included, which the lexer used to drop.

A *view node* is what a designer selects: an element or struct call, a bare view identifier, or an
`if` statement. Modifier calls are not nodes of their own; they belong to the call they modify. Two
numberings coexist. The *ordinal* (`n1`, `n2`, …) is the node's position in the source and is what any
parser can compute, so the Python variant can put it in an edit-mode rendering too (R-EDIT-004,
ADR-22). The *id* is the TypeScript session's stable name for a node: it survives every edit that does
not touch the node's name, so the selection, the outline's expansion and the undo history keep pointing
at the same node while the code around it changes.

```text
// Sign-in form            ← comment: part of VStack's span (C11)
VStack(spacing: 12) {      ← n1  VStack
  Text("Welcome")          ← n2  Text
    .font(.title)          ←     modifier of n2
  if showHint {            ← n3  if
    Text("Forgot it?")     ← n4  Text
  }
}
```

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-21, R-WEB-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-WEB-001 (changed at 0.12.0: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
