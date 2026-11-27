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
