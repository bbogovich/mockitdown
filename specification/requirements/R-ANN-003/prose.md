Lists, cards and scroll areas clip their content, which would cut off a callout sitting on a corner. Anchor positioning draws the marks in an unclipped layer tied to the element; the inline copy keeps older browsers working.

The anchor prefix is derived from the pack and the source text alone, so every variant names anchors
alike (ADR-18) and two different figures on one page do not collide.

**Marks inside a dialog (F-15.C6).** A dialog is its own decoration context: the marks of its
contents are positioned against the dialog, so a callout on a dialog's button sits on that button rather
than at the screen's top-left corner.
