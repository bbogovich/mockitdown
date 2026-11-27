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

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
