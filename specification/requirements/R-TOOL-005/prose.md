The second and third ways to insert (SRC-12#s6, SRC-14#p1.c1): drop onto the outline with a before,
after or inside indicator, or onto the view with an insertion bar along the container's axis — vertical
for a `VStack`, horizontal for an `HStack`. Dragging outline rows reorders and re-parents, refusing a drop
into the row's own descendants as the MockItOut outline did (SRC-12#s15).
