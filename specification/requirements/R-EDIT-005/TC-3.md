---
id: TC-3
title: Pack per mockup
verifies: [C8, C9, C11]
---

`node:test`: with `defaults.pack` `fluent`, a mockup without a pack resolves to `fluent`, one with
`options.pack` `mui` to `mui`; without defaults, to `base`; `mockupOptions` merges `defaults.appearance`
under the mockup's own options. The module exports no Markdown or file function.
