The second and third ways to insert (SRC-12#s6, SRC-14#p1.c1): drop onto the outline with a before,
after or inside indicator, or onto the view with an insertion bar along the container's axis — vertical
for a `VStack`, horizontal for an `HStack`. Dragging outline rows reorders and re-parents, refusing a drop
into the row's own descendants as the MockItOut outline did (SRC-12#s15).

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-TOOL-001, R-TOOL-002, R-TOOL-004 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.
