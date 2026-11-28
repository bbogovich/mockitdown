One plain object that every component of an editor shares (SRC-12#s12): the document, which mockup
is active, what is selected and hovered, and the parsed tree of each mockup. Because the outline, the view,
the gallery and the inspector read and change the same session, they cannot disagree.

The session notifies its components; the components tell the host through DOM events that bubble out of
their shadow roots. Inside the composite designer only the designer dispatches them, so a host listening
on the designer hears each change once:

```js
designer.addEventListener("mockitdown-change", (e) => {
  markEdited(e.detail.mockup);          // the window's "edited" marker
  scheduleAutosave();                    // e.detail.edits: the text edits made
});
```

Node ids are the session's; ordinals are what an edit-mode rendering carries (R-EDIT-004). `nodeFor`
turns one into the other after every parse.

In Node, without any component, the session is used like this:

```js
import { DesignSession, readDesign, writeDesign } from "mockitdown/design";

const session = new DesignSession(readDesign(text).document);
const off = session.subscribe(({ kind, detail }) => console.log(kind, detail));
session.apply({ op: "remove", nodes: ["n3"] });   // change {kind: "code", mockup, edits, code}
session.setCode("Inbox", typed);                  // change, then diagnostics if they changed
session.select([id]); session.delete();           // change, then select: the next sibling, else previous, else parent
off();
save(writeDesign(session.document));              // the live document, every change applied
```

`delete` is the command behind Delete and Backspace in the composite designer (R-TOOL-003.C11). It
picks the node to select next itself, so that the host hears one `change` and then one `select`, rather
than a `select` that empties the selection followed by another that fills it.

Code typed as text keeps the last valid tree while it does not parse, and is re-parsed from that tree
when it does again, so the nodes the typing did not touch keep their ids and the selection survives.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.7.** Its prerequisites were re-checked after the renderer split (#48, #49) and the gallery spec split (#50) without any change to an obligation; neither is this item changed.

**Re-checked at 0.11.0.** Its cited items R-EDIT-002, R-EDIT-005 changed with SRC-18 (all packs recorded, stylesheet partials, gallery home page and easter eggs, TypeScript release builds, new packs); no obligation of this item changed.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
