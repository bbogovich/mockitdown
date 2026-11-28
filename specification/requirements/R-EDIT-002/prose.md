The first half of the edit API (SRC-12#s13). Each operation returns the smallest text change that
does the job, so that a host can apply it to its own copy of the code, an undo step can invert it, and a
diff of the document shows only what the designer changed.

```js
const { edits, source, tree } = edit(code, {
  op: "insert", parent: "n1", index: "end", code: 'Toggle("Remember me")',
});
// edits: [{ start: 58, end: 58, text: '  Toggle("Remember me")\n' }]
```

The printing rules for new code — indentation from the parent, one call per line, the indentation unit
of the file — are fixed by the edit corpus rather than by prose alone. The corpus is data (a source, an
operation, the expected text), so the Python variant can run the same cases if it ever gains the edit API
(ADR-21). Node references in a case are ordinals, because ids are not written in the source.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items ADR-21, R-EDIT-001 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
