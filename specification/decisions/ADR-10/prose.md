**Context.** SRC-2: "a site can define custom reusable controls within a doc site; import
statements at the start of the fenced code block can indicate where to retrieve the custom
components from."

**Decision.** Swift's own component mechanism, plus a quoted-path import.

**Consequences.** Components are evaluated per use (no compilation step); a deep or recursive
component is cut off by the nesting limit.
