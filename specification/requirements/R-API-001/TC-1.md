---
id: TC-1
title: render and its result
verifies: [C1, C2, C3, C4]
---

Python unit tests `python/tests/test_api.py` `RenderTests`:
`render('import SwiftUI\nText("Hello")', device="phone")` returns a `RenderResult` that is `ok`, with
`packs` `["base", "swiftui"]`, a phone figure without CSS and the evaluated screen (C1, V1); a syntax
error gives empty `packs` and no screen (C1).
`render(src, RenderOptions(pack="fluent", device="tablet"), device="phone", pack=None, nope=1)` renders
fluent on a phone without an error, and every render option can be given as an override, `source`
included (C2). An unknown element puts one error in `errors` and makes `ok` false, while warnings stay
out of `errors`; warnings alone leave `ok` true (C3). With `source=True` and an error the HTML is the
error box, then the figure, then the source disclosure; warnings show a box only with `show_warnings`; a
syntax error is the error box alone, even with `source=True` (C4).
