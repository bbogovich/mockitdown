Presentations and navigation containers are where SwiftUI's look is most distinctive (SRC-9). The
clauses fix the visible structure of each; at `fit` they are drawn whole (R-DEV-008).

SwiftUI writes an alert's and a confirmation dialog's buttons in the closure
(`.alert("Delete?", isPresented: $p) { Button("Delete", role: .destructive) }`), so the `Alert` and
`ConfirmationDialog` elements take their `Button` children as actions (C9); `actions:` still works and
wins when given. Because the dialog role is shared, this holds in every pack whose alert is a dialog, as
do the popover's placeholder anchor (C10) and the one-item tab bar of a lone `Tab` (C11).

As built (#12): the column titles of a split view come from each column's `.navigationTitle`, drawn as a
large title on the sidebar and content columns and inline on the detail; on a desktop the sidebar title
is small and secondary until the macOS floating sidebar of R-DEV-010.C3 replaces it. `.balanced` keeps
the columns side by side as `.automatic` does; `.prominentDetail` floats the sidebar as a glass panel
over the full-width detail. On iPadOS and macOS chrome, a confirmation dialog takes the alert's card.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.

**Re-checked at specification 0.10.6.** A-REND-1 and A-WEB-1 were revised as built by the behaviour-preserving renderer split (#48, #49), and the gallery test cases only renamed their files (#50); no obligation here changed.
