The renderer element of SRC-8, with the script child chosen in place of CDATA (ADR-19).

```html
<script type="module" src="node_modules/mockitdown/dist/mockitdown.js"></script>

<mockitdown-mockup pack="mui" device="phone" import-base="mockups/">
  <script type="text/mockitdown">
    import "components/pill"
    VStack {
      Text("a < b && c > d")
      StatusPill(text: "Online")
    }
  </script>
</mockitdown-mockup>
```

The script's text reaches the element exactly as written, so `<`, `>` and `&` need no escaping. The
line break after `<script …>` and the indentation before `</script>` are dropped, and the indentation
common to the lines is removed, so the code is what a Markdown fence holding the same lines would
contain. The one thing a page cannot put in the script is `</script` — it ends the element. Code that
contains it (in a string, say) is set from a script instead: `element.code = source`.

The attributes are the fence's, with the fence's meanings; as in HTML, a boolean attribute written
without a value (`<mockitdown-mockup elements source>`) is on. Other attributes (`class`, `style`,
`data-*`) belong to the page and are ignored. Note that `id` and `title` are also global HTML
attributes: on a mockup element they name and caption the figure as well as the element.

Every element renders on its own: a syntax error, a bad attribute or a missing import shows the error
box in that element only, and the page hears about it through the `mockitdown-diagnostics` event,
which bubbles out of shadow roots. `await element.rendered` waits for the render a change has
started; it is the hook tests and editors use after setting an attribute or `code`.

Pages that show many mockups can create them on demand: the pack gallery (R-WEB-004) sets `code` on
a new element before inserting it, so each one renders once, and waits on `rendered` to know when a
whole pack is done.

`<mockitdown-mockup edit>` renders the mockup for editing (R-EDIT-004): every element produced from a
call carries `data-mkd-node`. The design tools use it; a page showing a mockup to readers does not.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-19, R-WEB-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
