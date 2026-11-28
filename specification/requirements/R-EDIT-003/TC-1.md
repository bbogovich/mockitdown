---
id: TC-1
title: Argument, modifier and identifier cases
verifies: [C1, C2, C3, C4, C5, C6, C7, C8, C10, C11, C12, C13, C14, C15, C16, C18, C19, C20]
---

Edit corpus cases (run by R-EDIT-002.TC-1) for each operation: add, replace and remove a positional and
a labelled argument; parentheses added to `Divider` and removed from `VStack(spacing: 8) { … }`; a
modifier added to a one-line and to a multi-line chain, replaced, and removed from both; `.id` set,
replaced and removed; `.ref` set and cleared; a comment set, replaced and removed; a name replaced. Each
expected file differs from its source only in the changed span.

As built (#22): 41 cases in `shared/conformance/edit/` (`set-argument-*`, `set-modifier-*`, `rename-*`,
`set-refs-*`, `set-comment-*`, `set-name*` and ten `refuse-*`), each source opening with a `//` line
saying what it exercises, each expected file written by hand. The meta-test of
`typescript/tests/unit/edit-corpus.test.ts` also requires the `covers` tags `setArgument:` `add-` /
`replace-` / `remove-labelled` and `-positional`, `add-parens`, `remove-parens`, `multiline`;
`setModifier:` `add-inline`, `add-line`, `replace`, `occurrence`, `remove-inline`, `remove-line`;
`rename:` `add`, `replace`, `remove`; `setRefs:` `set`, `clear`; `setComment:` `add`, `replace`,
`remove`; `setName`; and the refusals `duplicate-id`, `no-argument`, `no-modifier`, `argument-syntax`,
`position`, `modifier-name`, `element-name`, `not-a-call` and `comment-inline`.
