---
id: TC-3
title: Self-embedding components are rejected
verifies: [C10, C11]
---

**Given** three blocks, each with a `Text("after")` beside the component call:
`struct Row: View { var body: some View { Row() } }`,
`struct Row: View { var body: some View { VStack { Row(); Row() } } }`, and
`struct A: View { var body: some View { B() } }` with `struct B: View { var body: some View { if false { A() } } }`;
**when** each is checked and rendered in both variants, **then** each finishes promptly (well under a second, no memory growth) with exactly one error with code `recursion` whose message names the cycle (`Row → Row`, `Row → Row`, `A → B → A`), the component use renders nothing, and `Text("after")` renders.
**And** a chain of 49 distinct structs, each using the next, reports "nests too deeply" with code `recursion` (C11).

Automated in both variants (Python `tests/`, TypeScript `tests/unit/`); the implementer names the tests here.
