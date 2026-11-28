Pack CSS keys on these attributes — `.mkd-pack-fluent .mkd-button[data-variant="accent"]` — which
is how one element takes on a framework's variants, sizes and states. The allow-list pattern keeps
arbitrary text out of attribute selectors.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

`appearance` is not copied: a view's `data-appearance` would match the stylesheet's frame selectors (`.mkd-frame[data-appearance="dark"]`), so a field's `.appearance(.outline)` reaches the markup as its variant instead.
