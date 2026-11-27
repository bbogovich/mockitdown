What control the inspector uses for each argument (SRC-12#s7). Types are kept by role, so the 3132
element definitions need no annotation each; a pack adds `types` only for an element whose parameters
differ from its role's. `params` keeps its meaning — the names of the positional arguments — so nothing
that reads it changes.

```json
"button": {
  "category": "content", "accepts": [], "attach": "child",
  "params": { "label": "text", "role": { "type": "enum", "values": ["cancel", "destructive"] },
              "systemImage": "icon", "disabled": "bool" }
}
```

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items A-REPO-1, R-PACK-016 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.
