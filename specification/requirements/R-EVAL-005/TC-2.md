---
id: TC-2
title: Trailing closure prefers content
verifies: [C2]
---

A struct with `@ViewBuilder var sidebar: some View = Text("Nav")` declared before `@ViewBuilder var content: some View` binds the trailing closure to `content`; a struct with slots `header` (defaulted) and `body2` (no default) and no `content` binds it to `body2`; a struct whose only view property is defaulted binds it there. Automated in both variants.
