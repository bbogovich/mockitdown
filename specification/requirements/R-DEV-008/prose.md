**Why.** A `fit` frame was squeezed to its host's width, so wide content (a row of variants) was
drawn over itself, and presentation layers — absolutely positioned over a screen that had no size of
its own — collapsed to a small square (SRC-9#images, SRC-9#scroll).

**What changes.** A `fit` frame is exactly as large as its content, presentations included; when the
page column is narrower, the reader scrolls sideways instead of seeing a squeezed picture.

**As built.** At `fit` the screen that holds a presentation layer becomes a one-column grid: its
content takes the first rows and every layer spans all of them, so the grid — and the frame — is as
large as the larger of the two. The layer is not positioned there, which makes the screen the scrim's
containing block, so the scrim covers the whole screen. A sheet bleeds over the fit screen's padding
(the `--mkd-fit-padding` token, 16 points unless a pack sets it) to reach the frame's edges. A
tooltip's bubble is laid out beside its anchor in a small grid at `fit` (above it for `top`, below for
`bottom`, after it for `trailing`); elsewhere it stays positioned over the content. The arrow is an
element of the bubble (`mkd-tooltip__arrow`); a pack that draws its own (`::after`) hides it. Toasts
keep a pack's framework width where it has one (Material snackbars' 288 or 344 points, Bootstrap's
350) — never narrower than the text.
