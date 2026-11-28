**Requirement.** A block marked `library="name"` declares components for the rest of its page;
later blocks write `import "#name"`:

````markdown
```mockitdown library="cards" source="true"
struct Pill: View {
  var text: String
  var body: some View { Text(text).padding(4).border(.separator) }
}
```

```mockitdown
import "#cards"
HStack { Pill(text: "On"); Pill(text: "Off") }
```
````

The web components use `<mockitdown-library name="cards">` the same way.

**Rationale.** A page often needs one component for several of its mockups without a site-wide
library file. The `#` keeps page libraries apart from the import map's namespaces, and "earlier on
the page" matches how Python-Markdown converts a page, top to bottom, and how a reader reads it.

**Verification.** TC-1 (site pages), TC-2 (web components).


**Re-checked at specification 0.12.10.** Re-read against R-MDX-003 (changed at 0.12.10: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).
