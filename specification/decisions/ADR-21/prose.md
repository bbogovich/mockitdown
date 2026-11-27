**Context.** SRC-12#s13 wants the same printing rules in both variants, checked by conformance cases,
and SRC-12#s16 says Python runs the same cases "once it implements" the edit API. ADR-18 makes the Python
variant the reference for everything both variants do.

**Decision.** Only TypeScript edits code structurally, for now. The rules it follows are kept as
language-neutral cases (source, operation, expected text), so they are specified once and a Python
implementation can adopt them unchanged.

**Consequences.** The editing core is built in one language; nothing in the Python variant changes for
it, except the edit-mode rendering, which is a rendering change (ADR-22).
