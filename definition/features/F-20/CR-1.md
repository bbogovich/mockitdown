---
id: F-20.CR-1
target: F-20
kind: additive
version: 0.9.0
date: 2026-11-26
summary: "the .mkdesign design document: format, pack per mockup with defaults.pack, stable keys, sections, module in the package: C6-C10, AC5-AC7 (ING-1)"
from: 0db357a007c3
to: 0b45edc1cbe4
---

## Clauses

@ meta.source
- [SRC-8]
+ [SRC-8, SRC-12, SRC-15]
@ C6 insert after AC4
+ The canvas document of C4 is one JSON file with the extension `.mkdesign`, holding a format name and version, the document name, the document defaults (among them the default pack), the component files it imports, optional sections, the named mockups (each with its name, position, options and code) and the view (zoom, position and active mockup).
@ C7 insert after C6
+ Each mockup may name its own pack; a mockup that names none uses the document's default pack.
@ C8 insert after C7
+ The document is written with its keys in a stable order and each mockup's code verbatim, and keys that a tool does not know are kept when it writes the document back.
@ C9 insert after C8
+ The canvas can hold optional named sections: rectangles drawn behind groups of mockups.
@ C10 insert after C9
+ The document is read, validated and written by a module of the mockitdown package that needs no browser, so that the composite designer and a desktop shell share one implementation; converting a document to or from Markdown or a folder of files is left to the host.
@ AC5 insert after C10
+ Opening a document of an unknown format or version, or one whose mockup has no code, is refused with a readable message naming the problem.
@ AC6 insert after AC5
+ Opening a document that holds keys the tools do not know and writing it back yields the same document, its keys and their order included.
@ AC7 insert after AC6
+ Saving and reloading a canvas also restores its sections and its view.

## Files

```diff
--- a/prose.md
+++ b/prose.md
@@ -3 +3,8 @@
 **Change.** An infinite canvas that zooms and pans, holding named mockups. The name is the key importing tools use.
+
+**The design document (SRC-12#s10, SRC-12#s11, SRC-15).** A design document is one readable,
+diffable JSON file, `*.mkdesign`, with each mockup's code kept verbatim, so it can be read without the
+designer and imported by SpecItOut tools mockup by mockup. A mockup may use its own pack, which keeps
+side-by-side comparisons possible; the document names the default. One small module in the mockitdown
+package reads and writes the format for the components and for a desktop shell alike; Markdown and
+folder export stay in the shell for now.
```
