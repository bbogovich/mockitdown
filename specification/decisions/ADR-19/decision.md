---
id: ADR-19
title: The mockup element carries its code in a script child
status: active
version: 0.10.8
rev: 4
page: ADR.2
slot: decisions
order: 999
hash: 674caaf942d6
source: [SRC-8]
constrains: [R-WEB-002]
refs: [R-WEB-002]
---

D1: A `mockitdown-mockup` element takes its code from a `<script type="text/mockitdown">` child, whose text the HTML parser leaves untouched; the first such child counts and other children are ignored (R-WEB-002.C2).
O1: rejected: a CDATA child (the request's first form) — in an HTML document the parser turns `<![CDATA[` into a bogus comment that ends at the first `>` and parses the rest as markup, corrupting code that contains `>`, `<Name` or `&…;`.
O2: rejected: plain text content — the author would have to escape `<` and `&`.
C1: The only sequence the code cannot contain is `</script`; the element documents this.
