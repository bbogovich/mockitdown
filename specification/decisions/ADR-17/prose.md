Two variants rendering the same packs must not drift apart; keeping the assets once and copying them at build time makes drift a test failure rather than a merge problem (SRC-8).

Checked at 0.10.1 after R-REPO-002.C8 and R-REPO-004.C15: the role rule table (`shared/language/roles.json`) and the edit corpus (`shared/conformance/edit/`) are written only in `shared/` and copied by each build, as D2 requires; the list in D2 is illustrative of that rule, not closed.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
