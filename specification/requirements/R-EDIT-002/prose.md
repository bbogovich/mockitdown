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
