**Problem.** The web components were to be a separate project, but they need the same CSS and the same packs as the Python library; two copies would drift apart (SRC-8).

**Change.** The repository becomes the home of both variants: `python/` (the existing library), `typescript/` (the web components) and `shared/` (what both publish). A shared set of reference mockups keeps the two renderers producing the same markup.
