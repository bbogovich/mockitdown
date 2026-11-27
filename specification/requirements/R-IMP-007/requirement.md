---
id: R-IMP-007
title: Library names and qualified references
status: active
version: 0.12.0
rev: 0
page: IMP.1
slot: reqs
order: 7
hash: b4b69abbc5bc
source: [SRC-19]
realizes: [F-4]
requires: [R-IMP-002]
constrained_by: [A-EVAL-1]
decisions: [ADR-24]
---

C1: Every file import MUST belong to a library, named by the first rule that applies: the alias given with `as` (R-LANG-003.C8); for `import "#name"`, `name` (R-IMP-008); for a path beginning with `./` or `../`, the library of the importing component file, or for a block the importing file's base name without extension; otherwise the first segment of the path as written, without a leading `@` (`acme/cards` and `@acme/cards` → `acme`, `kpi` → `kpi`).
C2: If the name C1 gives is not an identifier, then the evaluator MUST warn "library name of 'x' is not an identifier; import it with `as`" with code `import`, and the import's structs MUST be reachable only unqualified.
C3: Structs that a component file loads through its own imports MUST belong to the libraries of those imports, not to the importing file's library.
C4: When `L.Name` is called, or named bare, where views are expected and `L` names a library loaded in the mockup, the evaluator MUST instantiate the struct `Name` of library `L`, even when the pack has an element or the language an enum namespace written `L.Name`; if library `L` has no struct `Name`, then it MUST report the error "library 'L' has no component 'Name'" with code `unknown` and produce an `unknown` view.
C5: The evaluator MUST resolve an unqualified struct name `Name` to, in order: a struct declared in the block; inside the body of a struct of library `L`, `L`'s struct `Name`; the struct `Name` of the one loaded library that declares it.
C6: If several loaded libraries declare `Name` and C5 does not settle it, then the evaluator MUST report the error "'Name' is ambiguous: declared by libraries a, b; write a.Name or b.Name" (the libraries in load order) with code `import` and produce an `unknown` view.
C7: Imports giving the same library name to different files MUST form one library holding the structs of all of them (R-IMP-004.C1).
C8: The screen's list of used components (R-EVAL-005.C9) MUST record a qualified call by its qualified name `L.Name`.
V1: With `acme/cards` and `contoso/cards` imported, both declaring `Card`, `acme.Card()` and `contoso.Card()` render their own bodies, `Card()` is an `import` error naming `acme` and `contoso`, and `import "contoso/cards" as Co` makes the second `Co.Card()`; a `Row` declared only by `acme` is reachable as `Row()`.
