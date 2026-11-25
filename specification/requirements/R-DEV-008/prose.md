**Why.** A `fit` frame was squeezed to its host's width, so wide content (a row of variants) was
drawn over itself, and presentation layers — absolutely positioned over a screen that had no size of
its own — collapsed to a small square (SRC-9#images, SRC-9#scroll).

**What changes.** A `fit` frame is exactly as large as its content, presentations included; when the
page column is narrower, the reader scrolls sideways instead of seeing a squeezed picture.
