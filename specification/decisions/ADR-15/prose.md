**Context.** Callouts sit on element corners, half outside; lists and cards clip overflow.

**Decision.** Anchor positioning (Chromium 125+, Safari 26) with an inline fallback.

**Consequences.** One extra layer per decorated element; unique anchor names per figure.
