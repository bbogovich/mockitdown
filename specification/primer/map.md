# mockitdown Specification — item map (generated)

id | kind | status | version r# | page | title
---|---|---|---|---|---
A-API-1 | architecture | active | 0.2.0 r0 | ARCH.1 | Library API
A-ASSET-1 | architecture | active | 0.2.0 r0 | ARCH.2 | Asset resolver
A-ASSET-2 | architecture | active | 0.2.0 r0 | ARCH.2 | Icon set
A-CLI-1 | architecture | active | 0.2.0 r0 | ARCH.2 | Command-line interface
A-DIAG-1 | architecture | active | 0.2.0 r0 | ARCH.1 | Diagnostics
A-EVAL-1 | architecture | active | 0.2.0 r0 | ARCH.1 | Evaluator
A-MDX-1 | architecture | active | 0.2.0 r0 | ARCH.2 | Markdown extension
A-MDX-2 | architecture | active | 0.2.0 r0 | ARCH.2 | Superfences fence
A-OPT-1 | architecture | active | 0.2.0 r0 | ARCH.1 | Render options
A-PACK-1 | architecture | active | 0.2.0 r0 | ARCH.1 | Pack registry
A-PACK-2 | architecture | active | 0.11.0 r1 | ARCH.1 | Built-in packs
A-REND-1 | architecture | active | 0.10.5 r2 | ARCH.2 | HTML renderer
A-REND-2 | architecture | active | 0.2.0 r0 | ARCH.2 | Figure assembly and chrome
A-REND-3 | architecture | active | 0.2.0 r0 | ARCH.2 | Style builder
A-REPO-1 | architecture | active | 0.11.0 r2 | ARCH.3 | Shared asset tree
A-STYLE-1 | architecture | active | 0.2.0 r0 | ARCH.2 | Stylesheet assembly
A-SYN-1 | architecture | active | 0.2.0 r0 | ARCH.1 | Lexer
A-SYN-2 | architecture | active | 0.2.0 r0 | ARCH.1 | Parser and syntax tree
A-WEB-1 | architecture | active | 0.10.5 r4 | ARCH.3 | TypeScript core
A-WEB-2 | architecture | active | 0.6.6 r2 | ARCH.3 | Mockup element
A-WEB-3 | architecture | active | 0.6.0 r0 | ARCH.3 | Development server and test pages
A-WEB-4 | architecture | active | 0.10.0 r0 | ARCH.3 | Design document and session module
A-WEB-5 | architecture | active | 0.10.0 r0 | ARCH.3 | Design-tool components
ADR-1 | decisions | active | 0.12.11 r2 | ADR.1 | HTML and CSS is the only renderer; the SVG renderer is retired
ADR-10 | decisions | active | 0.12.11 r2 | ADR.2 | Custom components are structs, imported from files by path
ADR-11 | decisions | active | 0.12.11 r1 | ADR.2 | An original icon set with framework name aliases
ADR-12 | decisions | active | 0.12.11 r1 | ADR.2 | Zero runtime dependencies in the core; Python 3.11 or later
ADR-13 | decisions | active | 0.12.11 r4 | ADR.2 | The shipped packs
ADR-14 | decisions | active | 0.12.11 r1 | ADR.2 | Documentation sites build with Zensical
ADR-15 | decisions | active | 0.10.8 r2 | ADR.1 | Annotation marks use CSS anchor positioning with an inline fallback
ADR-16 | decisions | active | 0.12.11 r3 | ADR.2 | Retro and easter-egg packs are original homages
ADR-17 | decisions | active | 0.12.11 r7 | ADR.2 | One repository for both variants, with shared assets
ADR-18 | decisions | active | 0.12.12 r6 | ADR.2 | The web variant is a TypeScript port held to the Python output
ADR-19 | decisions | active | 0.12.12 r7 | ADR.2 | The mockup element carries its code in a script child
ADR-2 | decisions | active | 0.12.11 r2 | ADR.1 | The notation is a declarative subset of Swift and SwiftUI
ADR-20 | decisions | active | 0.12.12 r6 | ADR.2 | Web development dependencies: typescript and Playwright only
ADR-21 | decisions | active | 0.12.12 r4 | ADR.3 | The edit API is TypeScript-only, with a language-neutral edit corpus
ADR-22 | decisions | active | 0.12.12 r4 | ADR.3 | The edit-mode rendering exists in both variants, with per-parse node ordinals
ADR-23 | decisions | active | 0.12.12 r1 | ADR.3 | TypeScript releases under their own tags, as GitHub release assets
ADR-24 | decisions | active | 0.12.12 r2 | ADR.2 | An import map of named libraries replaces import directories
ADR-3 | decisions | active | 0.12.11 r2 | ADR.1 | Integrate as a Python-Markdown extension and a superfences fence, without a MkDocs plugin
ADR-4 | decisions | active | 0.12.11 r3 | ADR.1 | Packs are data mapped onto a fixed set of render roles
ADR-5 | decisions | active | 0.12.11 r2 | ADR.1 | Static CSS replicas, no framework runtime, no scripts, no network
ADR-6 | decisions | active | 0.12.11 r2 | ADR.1 | Token-driven appearance
ADR-7 | decisions | active | 0.12.11 r1 | ADR.1 | Frame-unit scaling with px rewriting
ADR-8 | decisions | active | 0.12.11 r2 | ADR.2 | CSS delivered inline per page by default, or linked by the site
ADR-9 | decisions | active | 0.12.11 r1 | ADR.2 | Local images are embedded as data URIs at build time
M-API-1 | model | active | 0.2.0 r0 | MODEL.1 | RenderResult
M-DIAG-1 | model | active | 0.2.0 r0 | MODEL.1 | Diagnostic
M-EDIT-1 | model | active | 0.10.0 r0 | MODEL.1 | DesignDocument
M-EDIT-2 | model | active | 0.10.0 r0 | MODEL.1 | DesignMockup
M-EDIT-3 | model | active | 0.10.0 r0 | MODEL.1 | TextEdit
M-OPT-1 | model | active | 0.12.7 r3 | MODEL.1 | RenderOptions
M-PACK-1 | model | active | 0.2.0 r0 | MODEL.1 | Pack
M-PACK-2 | model | active | 0.10.0 r1 | MODEL.1 | ElementDef
M-PACK-3 | model | active | 0.13.7 r1 | MODEL.1 | RoleRule
M-SYN-1 | model | active | 0.2.0 r0 | MODEL.1 | Module
M-VIEW-1 | model | active | 0.10.0 r1 | MODEL.1 | View
M-VIEW-2 | model | active | 0.2.0 r0 | MODEL.1 | Modifier
M-VIEW-3 | model | active | 0.2.0 r0 | MODEL.1 | Screen
M-VIEW-4 | model | active | 0.2.0 r0 | MODEL.1 | Value
R-ANN-001 | requirements | active | 0.10.0 r1 | ANN.1 | Numbered callouts
R-ANN-002 | requirements | active | 0.12.7 r1 | ANN.1 | Pointers, selections, highlights and taps
R-ANN-003 | requirements | active | 0.10.8 r4 | ANN.1 | Overlay placement and free positioning
R-ANN-004 | requirements | active | 0.12.7 r1 | ANN.1 | Callout references in prose
R-API-001 | requirements | active | 0.12.7 r1 | API.1 | render
R-API-002 | requirements | active | 0.12.7 r1 | API.1 | check, evaluate and stylesheet
R-API-003 | requirements | active | 0.12.7 r2 | API.1 | Render options
R-API-004 | requirements | active | 0.12.7 r1 | API.1 | Dependencies and platform
R-APP-001 | requirements | active | 0.12.7 r2 | REND.2 | Appearance selection
R-APP-002 | requirements | active | 0.12.7 r2 | REND.2 | Token application by appearance
R-APP-003 | requirements | active | 0.12.7 r1 | REND.2 | Side-by-side appearances
R-ASSET-001 | requirements | active | 0.12.7 r1 | ASSET.1 | Classifying image references
R-ASSET-002 | requirements | active | 0.12.7 r1 | ASSET.1 | Finding local images
R-ASSET-003 | requirements | active | 0.2.0 r0 | ASSET.1 | Embedding local images
R-ASSET-004 | requirements | active | 0.12.7 r2 | ASSET.1 | Image-bearing attributes
R-ASSET-005 | requirements | active | 0.12.7 r1 | ASSET.1 | Built-in icons
R-CLI-001 | requirements | active | 0.12.8 r1 | CLI.1 | Commands
R-CLI-002 | requirements | active | 0.12.8 r4 | CLI.1 | Rendering options on the command line
R-CLI-003 | requirements | active | 0.12.8 r1 | CLI.1 | render
R-CLI-004 | requirements | active | 0.12.8 r1 | CLI.1 | check
R-CLI-005 | requirements | active | 0.12.8 r1 | CLI.1 | css
R-CLI-006 | requirements | active | 0.12.8 r1 | CLI.1 | packs and elements
R-DEV-001 | requirements | active | 0.12.9 r1 | REND.2 | Device forms and sizes
R-DEV-002 | requirements | active | 0.12.9 r2 | REND.2 | Device selection
R-DEV-003 | requirements | active | 0.12.9 r1 | REND.2 | Frame unit scaling
R-DEV-004 | requirements | active | 0.2.0 r0 | REND.2 | Length rewriting
R-DEV-005 | requirements | active | 0.12.9 r2 | REND.2 | Device chrome
R-DEV-006 | requirements | active | 0.12.9 r1 | REND.2 | Isolation from the host page
R-DEV-007 | requirements | active | 0.12.9 r1 | REND.1 | Additional chrome kinds
R-DEV-008 | requirements | active | 0.12.11 r3 | REND.2 | Fit frames: natural width and presentations
R-DEV-009 | requirements | active | 0.12.12 r3 | REND.2 | The macOS menu bar
R-DEV-010 | requirements | active | 0.12.11 r3 | REND.2 | Multi-platform chrome for SwiftUI
R-DIAG-001 | requirements | active | 0.12.8 r1 | DIAG.1 | Diagnostic content
R-DIAG-002 | requirements | active | 0.12.8 r1 | DIAG.1 | Collecting diagnostics
R-DIAG-003 | requirements | active | 0.12.8 r3 | DIAG.1 | Diagnostic codes
R-DIAG-004 | requirements | active | 0.12.8 r1 | DIAG.1 | The error box
R-DIAG-005 | requirements | active | 0.2.0 r0 | DIAG.1 | Syntax errors and partial rendering
R-EDIT-001 | requirements | active | 0.12.16 r7 | WEB.3 | Source spans and node identities
R-EDIT-002 | requirements | active | 0.12.17 r6 | WEB.3 | Edit API: insert, remove and move
R-EDIT-003 | requirements | active | 0.12.18 r6 | WEB.3 | Edit API: arguments, modifiers and identifiers
R-EDIT-004 | requirements | active | 0.13.2 r7 | WEB.3 | Edit-mode rendering
R-EDIT-005 | requirements | active | 0.13.3 r6 | WEB.3 | The design document module
R-EDIT-006 | requirements | active | 0.13.6 r6 | WEB.3 | The design session and its events
R-EDIT-007 | requirements | active | 0.12.12 r4 | WEB.3 | Undo and redo history
R-EDIT-008 | requirements | active | 0.12.12 r4 | WEB.3 | Commands: duplicate, clipboard, move and multi-select
R-EDIT-009 | requirements | active | 0.12.12 r5 | WEB.3 | Commands: wrap, unwrap, convert and extract component
R-EVAL-001 | requirements | active | 0.12.9 r1 | LANG.2 | Evaluation always completes
R-EVAL-002 | requirements | active | 0.12.9 r1 | LANG.2 | What a block renders
R-EVAL-003 | requirements | active | 0.12.0 r2 | LANG.2 | Name resolution for views
R-EVAL-004 | requirements | active | 0.10.0 r1 | LANG.2 | Binding element arguments
R-EVAL-005 | requirements | active | 0.13.1 r3 | LANG.2 | Instantiating struct components
R-EVAL-006 | requirements | active | 0.2.0 r0 | LANG.2 | ForEach
R-EVAL-007 | requirements | active | 0.2.0 r0 | LANG.2 | Conditionals and local bindings
R-EVAL-008 | requirements | active | 0.12.9 r1 | LANG.2 | Values and operators
R-EVAL-009 | requirements | active | 0.10.8 r1 | LANG.2 | Modifiers
R-EVAL-010 | requirements | active | 0.2.0 r0 | LANG.2 | The @Screen directive
R-EVAL-011 | requirements | active | 0.12.9 r2 | LANG.2 | Tolerance for pasted SwiftUI
R-IMP-001 | requirements | active | 0.12.8 r1 | IMP.1 | File imports load components
R-IMP-002 | requirements | active | 0.12.0 r1 | IMP.1 | Resolving import paths
R-IMP-003 | requirements | active | 0.12.8 r1 | IMP.1 | Nested imports and cycles
R-IMP-004 | requirements | active | 0.12.0 r1 | IMP.1 | Definition precedence
R-IMP-005 | requirements | active | 0.2.0 r0 | IMP.1 | Import errors and caching
R-IMP-006 | requirements | active | 0.12.8 r1 | IMP.1 | Module imports are not file imports
R-IMP-007 | requirements | active | 0.12.0 r0 | IMP.1 | Library names and qualified references
R-IMP-008 | requirements | active | 0.12.11 r1 | IMP.1 | Library blocks on a page
R-IMP-009 | requirements | active | 0.12.0 r0 | IMP.1 | Components as templates with content slots
R-LANG-001 | requirements | active | 0.2.0 r0 | LANG.1 | Lexical structure
R-LANG-002 | requirements | active | 0.2.0 r0 | LANG.1 | String literals and interpolation
R-LANG-003 | requirements | active | 0.12.0 r1 | LANG.1 | Module structure
R-LANG-004 | requirements | active | 0.12.0 r1 | LANG.1 | Struct declarations
R-LANG-005 | requirements | active | 0.2.0 r0 | LANG.1 | Statements
R-LANG-006 | requirements | active | 0.12.9 r2 | LANG.1 | Expressions and operators
R-LANG-007 | requirements | active | 0.10.0 r1 | LANG.1 | Calls, modifier chains and closures
R-LANG-008 | requirements | active | 0.12.9 r1 | LANG.1 | Collection and tuple literals
R-LANG-009 | requirements | active | 0.2.0 r0 | LANG.1 | Syntax errors
R-MDX-001 | requirements | active | 0.12.10 r1 | MDX.1 | Integration points
R-MDX-002 | requirements | active | 0.12.10 r3 | MDX.1 | Extension options
R-MDX-003 | requirements | active | 0.12.10 r2 | MDX.1 | Fence attributes
R-MDX-004 | requirements | active | 0.12.10 r2 | MDX.1 | Per-page CSS delivery
R-MDX-005 | requirements | active | 0.12.10 r1 | MDX.1 | Build log and strict mode
R-MDX-006 | requirements | active | 0.12.10 r3 | MDX.1 | Compatibility with instant navigation
R-PACK-001 | requirements | active | 0.12.10 r2 | PACK.1 | Pack directory layout and lookup
R-PACK-002 | requirements | active | 0.12.10 r2 | PACK.1 | pack.json keys
R-PACK-003 | requirements | active | 0.12.10 r2 | PACK.1 | Pack inheritance
R-PACK-004 | requirements | active | 0.10.8 r2 | PACK.1 | Element definitions
R-PACK-005 | requirements | active | 0.10.8 r1 | PACK.1 | Pack selection
R-PACK-006 | requirements | active | 0.10.8 r1 | PACK.1 | Design tokens
R-PACK-007 | requirements | active | 0.10.8 r1 | PACK.1 | Pack stylesheet rules
R-PACK-008 | requirements | active | 0.12.10 r6 | PACK.1 | Shipped packs
R-PACK-009 | requirements | active | 0.12.10 r3 | PACK.1 | The core vocabulary
R-PACK-010 | requirements | active | 0.12.13 r2 | PACK.1 | Hidden packs
R-PACK-011 | requirements | active | 0.8.1 r1 | PACK.1 | Argument aliases
R-PACK-012 | requirements | active | 0.12.0 r5 | PACK.1 | Pack reference gallery and site sections
R-PACK-013 | requirements | active | 0.12.11 r5 | PACK.1 | Element samples
R-PACK-014 | requirements | active | 0.12.12 r9 | PACK.1 | SwiftUI control styles
R-PACK-015 | requirements | active | 0.12.12 r9 | PACK.1 | SwiftUI presentations and navigation
R-PACK-016 | requirements | active | 0.13.7 r7 | PACK.3 | Role rules
R-PACK-017 | requirements | active | 0.12.12 r5 | PACK.3 | Typed parameters and modifiers
R-PACK-018 | requirements | active | 0.12.12 r5 | PACK.4 | Stylesheet partials
R-PACK-019 | requirements | active | 0.12.12 r5 | PACK.5 | Amiga Workbench pack
R-PACK-020 | requirements | active | 0.12.12 r5 | PACK.5 | Windows 1.0 in its default colours
R-PACK-021 | requirements | active | 0.12.12 r5 | PACK.5 | Apple IIgs GS/OS beyond the Finder window
R-PACK-022 | requirements | active | 0.12.12 r5 | PACK.5 | Atari ST GEM pack
R-PACK-023 | requirements | active | 0.12.12 r5 | PACK.5 | GEOS pack
R-PACK-024 | requirements | active | 0.12.12 r5 | PACK.5 | RISC OS pack
R-PACK-025 | requirements | active | 0.12.12 r5 | PACK.5 | BeOS pack
R-PACK-026 | requirements | active | 0.12.12 r5 | PACK.5 | Apple Newton pack
R-PACK-027 | requirements | active | 0.12.12 r5 | PACK.5 | Palm OS pack
R-PACK-028 | requirements | active | 0.12.12 r5 | PACK.5 | Windows CE (Pocket PC) pack
R-PACK-029 | requirements | active | 0.12.12 r5 | PACK.5 | BlackBerry pack
R-PACK-030 | requirements | active | 0.12.12 r1 | PACK.1 | User guide: installation and defined terms
R-REND-001 | requirements | active | 0.12.10 r2 | REND.1 | Figure structure
R-REND-002 | requirements | active | 0.12.10 r3 | REND.1 | Role markup
R-REND-003 | requirements | active | 0.12.10 r2 | REND.1 | Attributes on the markup
R-REND-004 | requirements | active | 0.2.0 r0 | REND.1 | Modifier rendering
R-REND-005 | requirements | active | 0.10.7 r1 | REND.1 | Text content and inline Markdown
R-REND-006 | requirements | active | 0.12.10 r3 | REND.1 | Output safety
R-REND-007 | requirements | active | 0.12.10 r3 | REND.1 | Static, deterministic output
R-REND-008 | requirements | active | 0.12.10 r2 | REND.1 | Unknown elements and roles
R-REND-009 | requirements | active | 0.10.7 r1 | REND.1 | Presentations and navigation composition
R-REND-010 | requirements | active | 0.2.0 r0 | REND.1 | Elements table and source disclosure
R-REND-011 | requirements | active | 0.12.10 r1 | REND.2 | Non-standard component roles
R-REND-012 | requirements | active | 0.8.3 r2 | REND.2 | Charts
R-REND-013 | requirements | active | 0.10.7 r2 | REND.1 | Rows without overlap
R-REND-014 | requirements | active | 0.10.7 r2 | REND.1 | Shape framing
R-REPO-001 | requirements | active | 0.12.11 r3 | REPO.1 | Repository layout
R-REPO-002 | requirements | active | 0.13.7 r9 | REPO.1 | Shared assets are the single source
R-REPO-003 | requirements | active | 0.12.12 r8 | REPO.1 | The Python variant after the move
R-REPO-004 | requirements | active | 0.12.17 r9 | REPO.1 | Conformance corpus
R-TOOL-001 | requirements | active | 0.13.4 r6 | WEB.4 | The editable view: mockitdown-editor
R-TOOL-002 | requirements | active | 0.13.5 r5 | WEB.4 | The outline: mockitdown-outline
R-TOOL-003 | requirements | active | 0.13.6 r5 | WEB.4 | The composite designer and its test page
R-TOOL-004 | requirements | active | 0.12.12 r5 | WEB.4 | The gallery: mockitdown-gallery
R-TOOL-005 | requirements | active | 0.12.12 r4 | WEB.4 | Drag and drop onto the outline and the view
R-TOOL-006 | requirements | active | 0.12.12 r4 | WEB.4 | New elements: sample arguments and first-text editing
R-TOOL-007 | requirements | active | 0.12.12 r4 | WEB.4 | The inspector: mockitdown-inspector
R-TOOL-008 | requirements | active | 0.12.12 r4 | WEB.4 | The code view: mockitdown-code
R-TOOL-009 | requirements | active | 0.12.12 r4 | WEB.4 | Two-way editing and Code mode
R-TOOL-010 | requirements | active | 0.12.12 r4 | WEB.4 | The diagnostics list: mockitdown-diagnostics
R-TOOL-011 | requirements | active | 0.12.12 r4 | WEB.5 | The canvas: mockitdown-canvas
R-TOOL-012 | requirements | active | 0.12.12 r4 | WEB.5 | Mockup frames: labels, moving, renaming and placement
R-TOOL-013 | requirements | active | 0.12.12 r4 | WEB.5 | The active mockup and inactive previews
R-TOOL-014 | requirements | active | 0.12.12 r4 | WEB.5 | Sections and the canvas round trip
R-WEB-001 | requirements | active | 0.12.12 r8 | WEB.1 | TypeScript package and core
R-WEB-002 | requirements | active | 0.12.12 r9 | WEB.1 | The mockitdown-mockup element
R-WEB-003 | requirements | active | 0.12.12 r7 | WEB.2 | Development server
R-WEB-004 | requirements | active | 0.12.12 r15 | WEB.2 | Pack gallery test page
R-WEB-005 | requirements | active | 0.12.12 r6 | WEB.2 | Web test suites
R-WEB-006 | requirements | active | 0.12.14 r2 | WEB.2 | Gallery home page
R-WEB-007 | requirements | active | 0.12.15 r3 | WEB.1 | TypeScript release builds on GitHub
