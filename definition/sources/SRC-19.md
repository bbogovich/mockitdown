---
id: SRC-19
title: "Request: User guide with installation, import map, page libraries, qualified library names, component templates"
recorded: 2026-11-27
---

The developer's request of 2026-11-27, verbatim, followed by the answers given in conversation.

<a id="request"></a>

> The "Demo" page in the doc site should be "user guide".  It needs an installation page with instructions for the python and typescript versions, and how to build a resulting page with embedded mockups (mainly for python).  Some things in the current doc are referenced but not defined.  The use of import paths, for example, gives no indication of where the import_paths are defined.  Using a custom component loaded from another file is described, but not how to reference a component defined in the same page.  For import_paths, it makes sense that this be a "virtual file system" definition mapping a URL to the namespace paths used in the actual imports (like typescript config).  For custom components, they should be optionally usable as templates where a design importing the control can override propoperty values and embed content within the layout.  The "@ContentBuilder" parameter attribute appears to be the correct way to handle this in SwiftUI. We need to allow for multiple libraries of custom views to have overlapping view names, so the library name prefix needs to be supported in imports.

<a id="answers"></a>

Answers chosen in conversation:

- Same-page components: a named library block (`library="cards"`), imported by later blocks as `import "#cards"`.
- Overlapping names: `Library.Name`, as in Swift; the library is named by the import's namespace or an `as` alias; an unqualified name works when unique and is an `ambiguous` error otherwise.
- `import_paths`: replaced by the import map (`imports`), not kept as a shorthand.
