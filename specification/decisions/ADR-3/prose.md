**Context.** The prototype's plugin copied kit CSS into the site, warned about instant navigation
and failed strict builds. Zensical reads `mkdocs.yml` and runs Python-Markdown extensions and
superfences fences, but not MkDocs plugins.

**Decision.** Move every responsibility into the Markdown layer that both tools share.

**Consequences.** One integration for every Python-Markdown host. The cost is C3: Python-Markdown
does not tell an extension which file it is converting.
