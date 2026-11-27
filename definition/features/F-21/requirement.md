---
id: F-21
title: Structural editing of mockup source
status: active
version: 0.9.0
rev: 0
page: FEAT.3
slot: features
order: 6
hash: 43496a58b2df
family: design-tools
source: [SRC-12]
requires: [F-16]
---

G1: A visual editor must change a mockup without rewriting it, so that the author's formatting, comments and data-driven constructs survive every edit and the code stays a reviewable, diffable text.
C1: The TypeScript variant edits a mockup's code structurally: it inserts, removes and moves element calls, sets, replaces and removes arguments and modifiers, and sets or renames identifiers.
C2: Every structural edit is a minimal set of text changes; the code outside the changed spans, including its formatting, comments, `let` bindings, `ForEach` loops and `if` conditions, is kept as written.
C3: New code written by an edit follows shared printing rules (indentation from its parent, one call per line, argument order), kept as language-neutral cases so that other variants can follow the same rules.
C4: Every element call of a mockup has a node identity, which stays the same across edits for as long as the call's text survives.
C5: A rendering made for editing ties each rendered element to the call it came from, and marks elements produced by a loop, a condition or a component body as derived from their source call.
C6: The rendering made for editing is optional; without it the rendered output is unchanged.
AC1: Inserting an element into a formatted mockup that has comments changes only the inserted span, and the edited code renders without a new diagnostic.
AC2: Every case of the shared edit corpus produces exactly its expected text.
AC3: In a rendering made for editing, every element produced from a call names its node, and every element produced by a loop, a condition or a component body is marked as derived.
AC4: After an edit, every call whose text the edit did not touch keeps its node identity.
