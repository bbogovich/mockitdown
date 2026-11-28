**Context.** SRC-2 asks for a block structure "similar to SwiftUI view structs" that "follows the
same syntax". The prototype's notation (SRC-3) was brace-delimited but bespoke.

**Decision.** Adopt Swift syntax wholesale for everything declarative, and nothing else: no
functions, initialisers, generics or mutation. Metadata and identifiers become Swift-shaped too
(`@Screen`, `.id()`, `.ref()`).

**Consequences.** The grammar is larger than the prototype's but familiar; the language reference
documents the exact subset, and unsupported Swift fails with a clear syntax error.

Checked at 0.10.1: R-EVAL-011 and R-MDX-004 changed after this decision only by clarifications that dropped known-deviation notes (0.2.1); the decision stands.


**Re-checked at specification 0.12.10.** Re-read against R-EVAL-011, R-LANG-003, R-LANG-004 (changed at 0.12.0, 0.12.9: SRC-19 import map (0.12.0), which changes how imports are found and nothing this item obliges; test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
