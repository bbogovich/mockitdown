---
id: ADR-19
title: The mockup element carries its code in a script child
status: active
version: 0.6.0
rev: 0
page: ADR.2
slot: decisions
order: 999
hash: 5899be2d08c6
source: [SRC-8]
constrains: [R-WEB-002]
---

D1: A `mockitdown-mockup` element takes its code from its only child, a `<script type="text/mockitdown">` element, whose text the HTML parser leaves untouched.
O1: rejected: a CDATA child (the request's first form) — in an HTML document the parser turns `<![CDATA[` into a bogus comment that ends at the first `>` and parses the rest as markup, corrupting code that contains `>`, `<Name` or `&…;`.
O2: rejected: plain text content — the author would have to escape `<` and `&`.
C1: The only sequence the code cannot contain is `</script`; the element documents this.
