---
id: TC-2
title: Data, search and components
verifies: [C2, C4, C5]
---

Browser test: the gallery fetches `dist/shared/reference/<pack>.json` and no file under `shared/`;
`filter = "toggle"` leaves the toggle-like cards; a struct declared in the mockup appears in the
Components group; switching the active mockup to another pack lists that pack's own elements first.

As built (#29): the same spec's TC-2 test records the page's requests: `/dist/shared/reference/base.json`
and no path under `/shared/`; `Badge`, declared in the mockup, is in the Components group; `filter =
"toggle"` sets the search field and leaves only cards whose name, role or doc line contains it; typing
`BADGE` into the field sets `filter` and shows the component; `setActive("Cards")` fetches
`vuetify.json` and, in every group, lists the elements `shared/reference/vuetify.json` marks `own`
before the inherited ones.
