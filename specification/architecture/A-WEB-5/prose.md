The DOM half of the design tools. Every element renders session state and forwards events, so the same
rules apply whichever components a host composes, and the browser tests drive the components through the
test pages.

The editor, the outline and the gallery, like `mockitdown-mockup`, schedule their renders through one
`RenderScheduler`: changes coalesce into one render per microtask, a render overtaken by a newer change is
dropped, and `rendered` resolves once the element is up to date. `renderFailure` gives the editor and the
mockup the same `cannot render: …` diagnostic.

The canvas, the editor, the outline, the gallery, the inspector and the diagnostics list find their
session in one place, `SessionLink` with `findDesignerSession`: the nearest enclosing designer's session
(walking parents and out of shadow roots), else the one the host set, else one of their own. The link
holds the subscription and dispatches the session's events from the element while the session is its
own; each element keeps its own notification handling and what it resets when the session changes.
