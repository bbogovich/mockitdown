# Conventions (agent form)

**IDs.** `R-<AREA>-<n>` requirement · `A-<AREA>-<n>` architecture element · `M-<AREA>-<n>` model entity ·
`ADR-<n>` decision. Item-local: `CR-<n>` change, `TC-<n>` automated test, `TC-M<n>` manual test, cited
qualified (`R-WS-002.TC-1`). IDs are permanent: retire, never reuse or renumber.

**Clauses.** One obligation per line, `<label>: <text>`; continuation lines start with two spaces.
Labels never change or get reused. Prefixes by kind:

| Kind | Prefixes |
|---|---|
| requirement | `C` normative clause · `V` verification (what fails if violated) |
| element | `P` provides · `U` uses (`uses A-…`) · `K` constraint |
| entity | `F` field (`name: type · key/optional — note`) · `R` relation (`name: → M-… (0..*)`) · `I` invariant · `E` enum value |
| decision | `D` decision · `O` rejected option · `C` consequence |

RFC 2119 keywords (MUST, MUST NOT, SHOULD, MAY) only in clauses. Cross-references by ID only, no paths.

**Front matter** is flat: `key: value` or `key: [a, b]`. Authored: title, status, page, slot, order,
source, uses, realizes, constrained_by, scope. Written by the tool: version, rev, hash, refs.

**Changing an item** (never edit `requirement.md` in place):
`sio-docs draft <ID>` → edit `<ID>/.draft/` (clauses AND prose.md, keep them saying the same thing) →
`sio-docs record <ID> --kind revision|correction|clarification|editorial|retire --summary "…" --issue "#n"`.
A new item: `sio-docs new <ID> --title … --page … --slot …`; edit freely until released.

**Releasing.** `sio-docs release --bump minor|patch --summary "…"` stamps every pending change with the new
version. patch: wording only · minor: a requirement added, changed or removed, or a new page ·
major: only on a person's direction. One bump per change set.

**After any change:** `sio-docs build` then `sio-docs check` (replay, hashes, slots, navigation, docs freshness).
