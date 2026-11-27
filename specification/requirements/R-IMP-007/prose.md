**Requirement.** Each import belongs to a library named by its first path segment (or an `as` alias),
and components are referred to as `Library.Name` when two libraries both declare `Name`, as Swift
qualifies a type by its module:

```swift
import "acme/cards"
import "contoso/cards" as Co

acme.Card(title: "Vendor")
Co.Card(title: "Ours")
Row()                 // only acme declares Row: no prefix needed
```

**Rationale.** Libraries from different sources are written independently; a later file silently
replacing an earlier one's `Card` (the rule before ADR-24) would make a mockup depend on import order.
An unqualified name stays the convenient default and becomes an error only when it is truly
ambiguous. Inside a library's own structs, its own components win, so a library keeps working when
another library with overlapping names is imported beside it.

**Verification.** TC-1, in both variants.
