---
id: TC-2
title: Refusals
verifies: [C2, C3, C4, C12, C13, C14]
---

`node:test` (`typescript/tests/unit/design.test.ts`): each fixture of `typescript/tests/fixtures/design/malformed/`
— wrong `format`, `version: 2`, `mockups` as an object, a mockup without `code`, `x` as a string, two
mockups named `Inbox`, text that is not JSON, a list, and one document with a problem of every C12 kind —
is refused with exactly the paths and messages of `malformed/expected.json`, written by hand; a refusal
gives no document. `format` and `version` refusals name the value found (`"1"`, `1.5`).
