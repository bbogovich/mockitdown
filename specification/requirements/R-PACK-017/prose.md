What control the inspector uses for each argument (SRC-12#s7). Types are kept by role, so the 3132
element definitions need no annotation each; a pack adds `types` only for an element whose parameters
differ from its role's, and a label it types that way is understood by the element's calls
(R-EVAL-004.C7). `params` in `pack.json` keeps its meaning — the names of the positional arguments — so
nothing that reads it changes.

As built (#33), the typed maps replaced the `reads` lists of R-EVAL-004.C8: the labels a role reads are
the keys of its `params`, those every role reads the keys of the table's top-level `params`. Each type
was chosen from what the renderer does with the label: `value` is a number for a slider, a progress bar
or a rating and text for a text field; `rows` is a number for a text field and an array of arrays for a
table. An `enum` names its values only where the renderer knows a fixed set (`orientation`,
`titleDisplayMode`, a button's `role`); the rest of the common markup (`size`, `state`, `severity`, …)
is `text`, its values differing from pack to pack. `variant` is `text` in the table, and
`parameterTypes` makes it an `enum` of the element's declared variants (C4).

```json
"params": {"color": "color", "disabled": "bool", "orientation": {"type": "enum", "values": ["horizontal", "vertical"]}, …},
"roles": {
  "button": {"title": "button", "category": "content", "accepts": ["text", "label", "icon", "image", …], "attach": "child",
             "params": {"label": "text", "role": {"type": "enum", "values": ["cancel", "destructive"]}, "systemImage": "icon", "loading": "bool", …}}
}
```

The modifiers are grouped as the renderer's stylesheet builder groups them: `layout` (padding, frame,
offset, position, aspect ratio, …), `typography`, `colour` (colour and shape: fills, strokes, borders,
corner radius, clip shape, shadow, opacity), `presentation` (alert, sheet, popover, overlay, …),
`annotations` (callouts, pointers, marquees, highlights, taps) and `other` (identity, navigation titles,
search, shortcuts, toolbars). An argument without a label is positional:

```json
"padding": {"group": "layout", "args": [{"label": null, "type": {"type": "enum", "values": ["all", "horizontal", "vertical", "top", "bottom", "leading", "trailing"]}}, {"label": null, "type": "number"}]}
```

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items A-REPO-1, R-PACK-016 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.10.** Re-read against R-PACK-016 (changed at 0.12.4: test cases backfilled and as-built clauses recorded by #54 to #60). No obligation this item rests on changed, and none of its clauses is altered (#81).


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
