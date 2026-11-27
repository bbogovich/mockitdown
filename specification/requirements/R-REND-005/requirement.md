---
id: R-REND-005
title: Text content and inline Markdown
status: active
version: 0.10.7
rev: 1
page: REND.1
slot: reqs
order: 5
source: [SRC-2]
realizes: [F-8]
constrained_by: [A-REND-1]
reverse_engineered: true
hash: a71d15d523e0
---

C1: The renderer MUST HTML-escape all text content before applying inline formatting.
C2: The renderer MUST render, in `Text` and every other text attribute shown as text, `**x**` as `<strong>`, `*x*` as `<em>`, `` `x` `` as `<code class="mkd-code">`, `~~x~~` as `<s>`, and `[label](url)` as `<span class="mkd-link" role="link">label</span>` without the URL.
C3: The renderer MUST render line feeds in text as `<br>`.
C4: An attribute that may hold text or views (for example a `label:` given as `Label(…)`) MUST render the views when it holds views and the formatted text otherwise.
V1: `Text("Version **2.4** adds *offline* `sync` [docs](https://x)")` renders strong, em, code and a non-navigating link span; `Text("a <b>")` renders `a &lt;b&gt;`.
