One markup for all packs is what makes packs data: a pack never generates HTML, it only restyles
the roles. The [Role catalogue](roles.md) lists each role with the attributes it reads.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

A few roles keep another root class (the role catalogue lists them): `icon` uses `mkd-symbol` because `mkd-icon` is every glyph's `svg`, and a table's root is the wrapper that scrolls it.
