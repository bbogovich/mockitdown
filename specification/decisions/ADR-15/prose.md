**Context.** Callouts sit on element corners, half outside; lists and cards clip overflow.

**Decision.** Anchor positioning (Chromium 125+, Safari 26) with an inline fallback.

**Consequences.** One extra layer per decorated element; unique anchor names per figure.

Checked at 0.10.1 after R-ANN-003.C6 (marks inside a dialog): the screen-level layer and its inline fallback are kept, only positioned within the dialog; D1, D2 and C1 stand.
