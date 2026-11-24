---
id: UC-1
title: Mock up screens in a corporate design system
---

**Actor:** documentation-site maintainer.

1. The maintainer creates `packs/acme/pack.json` extending `mui` with the corporate colours and a
   few corporate components, and `packs/acme/pack.css`.
2. The maintainer adds `pack_paths: [packs]` to the extension configuration.

**Outcome:** blocks with `pack="acme"` render in the corporate style, including the Material UI
elements the pack inherits.
