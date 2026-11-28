---
id: TC-1
title: Escaping and inert output
verifies: [C1, C2, C3, C4, C5]
---

Python unit tests `python/tests/test_markup.py` `OutputSafetyTests`: script tags, both quotes, `&` and `javascript:` in text, help, id and
button labels come out escaped, with no `<` inside an attribute value (C1, V1); the whole conformance corpus contains no
`<script>`, `<iframe>`, `<object>`, `<form>`, `<a href>` or `on…=` attribute, and a `Link` is a `span` without `href`
(C2); a colour carrying `;background:url(x)` and a font size carrying CSS leave no trace in `style`, while a padding
and an accepted colour do (C3); `javascript:`, `data:text/html`, path-escaping and `file:` image sources render a
placeholder without `<img>`, an `https` source is used (C4, V1); hostile title, id, url, device and chrome options
produce no markup (C5).
