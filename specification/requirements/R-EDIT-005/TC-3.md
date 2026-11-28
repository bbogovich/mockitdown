---
id: TC-3
title: Pack per mockup
verifies: [C8, C9, C11]
---

`node:test` (`typescript/tests/unit/design.test.ts`): with `defaults.pack` `fluent`, a mockup without a
pack resolves to `fluent`, one with `options.pack` `mui` to `mui`; without defaults, to `base`; an unknown
name to null; `mockupOptions` merges `defaults.appearance` under the mockup's own options into a new
object. The module exports no Markdown, HTML or file function.
