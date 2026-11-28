Lists, cards and scroll areas clip their content, which would cut off a callout sitting on a corner. Anchor positioning draws the marks in an unclipped layer tied to the element; the inline copy keeps older browsers working.

The anchor prefix is derived from the pack and the source text alone, so every variant names anchors
alike (ADR-18) and two different figures on one page do not collide.

**Marks inside a dialog (F-15.C6).** A dialog is its own decoration context: the marks of its
contents are positioned against the dialog, so a callout on a dialog's button sits on that button rather
than at the screen's top-left corner. As built (#46), every overlay layer is followed by the anchored
marks of the views inside it: a presented alert or sheet emitted its contents' marks before its layer, so
in a device frame Chromium could not resolve their anchors and drew them at the screen's corner.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.
