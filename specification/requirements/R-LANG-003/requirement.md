---
id: R-LANG-003
title: Module structure
status: active
version: 0.12.0
rev: 1
page: LANG.1
slot: reqs
order: 3
source: [SRC-2]
realizes: [F-2]
constrained_by: [A-SYN-2]
decisions: [ADR-2]
reverse_engineered: true
hash: 0c4ed733d1ab
---

C1: The parser MUST parse a block's source as a module: a sequence of imports, directives, struct declarations, `#Preview` blocks and statements, in any order, separated by line feeds or `;`.
C2: The parser MUST collect imports, directives, struct declarations and top-level statements separately, each in source order.
C3: If two top-level constructs are on one line without `;`, then the parser MUST raise the syntax error "expected a new line or ';' between statements".
C4: The parser MUST parse `import` followed by a quoted string as a file import, and `import` followed by a dotted identifier path (`import SwiftUI`, `import Foo.Bar`) as a module import.
C5: If a file import's string contains an interpolation, then the parser MUST raise a syntax error.
C6: The parser MUST parse a top-level `@Name` or `@Name(arguments)` that is not followed by a declaration as a directive.
C7: The parser MUST parse `#Preview`, an optional argument list and a block, and MUST append the block's statements to the module's top-level statements, discarding the arguments.
C8: The parser MUST parse `import "path" as Name`, `Name` an identifier, as a file import with the alias `Name`.
C9: If `as` follows a module import, then the parser MUST raise the syntax error "only a file import can be renamed with `as`".
V1: A module with `import SwiftUI`, `import "lib/cards"`, `@Screen(id: "S1")`, a struct, a `#Preview { … }` and a statement yields one module import, one file import, one directive, one struct and the preview's statements followed by the statement.
