**Problem.** The web components were to be a separate project, but they need the same CSS and the same packs as the Python library; two copies would drift apart (SRC-8).

**Change.** The repository becomes the home of both variants: `python/` (the existing library), `typescript/` (the web components) and `shared/` (what both publish). A shared set of reference mockups keeps the two renderers producing the same markup.

**Role rules and typed parameters (SRC-12#s6.3, SRC-12#s7).** The design tools must know which
elements may go where and which control edits each argument. Both are kept once, as shared language
data by role, so that the 3132 element definitions need no annotation each: a pack element inherits
the rules and types of its role, and a pack overrides them only where one of its elements differs
(for example a Fiori object page that accepts only sections).
