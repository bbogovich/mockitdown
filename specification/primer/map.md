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
A-PACK-2 | architecture | active | 0.2.0 r0 | ARCH.1 | Built-in packs
A-REND-1 | architecture | active | 0.2.0 r0 | ARCH.2 | HTML renderer
A-REND-2 | architecture | active | 0.2.0 r0 | ARCH.2 | Figure assembly and chrome
A-REND-3 | architecture | active | 0.2.0 r0 | ARCH.2 | Style builder
A-REPO-1 | architecture | active | 0.6.1 r1 | ARCH.3 | Shared asset tree
A-STYLE-1 | architecture | active | 0.2.0 r0 | ARCH.2 | Stylesheet assembly
A-SYN-1 | architecture | active | 0.2.0 r0 | ARCH.1 | Lexer
A-SYN-2 | architecture | active | 0.2.0 r0 | ARCH.1 | Parser and syntax tree
A-WEB-1 | architecture | active | 0.6.4 r2 | ARCH.3 | TypeScript core
A-WEB-2 | architecture | active | 0.6.6 r2 | ARCH.3 | Mockup element
A-WEB-3 | architecture | active | 0.6.0 r0 | ARCH.3 | Development server and test pages
ADR-1 | decisions | active | 0.2.0 r0 | ADR.1 | HTML and CSS is the only renderer; the SVG renderer is retired
ADR-10 | decisions | active | 0.2.0 r0 | ADR.2 | Custom components are structs, imported from files by path
ADR-11 | decisions | active | 0.2.0 r0 | ADR.2 | An original icon set with framework name aliases
ADR-12 | decisions | active | 0.2.0 r0 | ADR.2 | Zero runtime dependencies in the core; Python 3.11 or later
ADR-13 | decisions | active | 0.4.0 r1 | ADR.2 | The shipped packs
ADR-14 | decisions | active | 0.2.0 r0 | ADR.2 | Documentation sites build with Zensical
ADR-15 | decisions | active | 0.3.0 r0 | ADR.1 | Annotation marks use CSS anchor positioning with an inline fallback
ADR-16 | decisions | active | 0.3.0 r0 | ADR.2 | Retro and easter-egg packs are original homages
ADR-17 | decisions | active | 0.6.0 r0 | ADR.2 | One repository for both variants, with shared assets
ADR-18 | decisions | active | 0.6.0 r0 | ADR.2 | The web variant is a TypeScript port held to the Python output
ADR-19 | decisions | active | 0.6.7 r1 | ADR.2 | The mockup element carries its code in a script child
ADR-2 | decisions | active | 0.2.0 r0 | ADR.1 | The notation is a declarative subset of Swift and SwiftUI
ADR-20 | decisions | active | 0.6.0 r0 | ADR.2 | Web development dependencies: typescript and Playwright only
ADR-3 | decisions | active | 0.2.0 r0 | ADR.1 | Integrate as a Python-Markdown extension and a superfences fence, without a MkDocs plugin
ADR-4 | decisions | active | 0.2.0 r0 | ADR.1 | Packs are data mapped onto a fixed set of render roles
ADR-5 | decisions | active | 0.2.0 r0 | ADR.1 | Static CSS replicas, no framework runtime, no scripts, no network
ADR-6 | decisions | active | 0.2.0 r0 | ADR.1 | Token-driven appearance
ADR-7 | decisions | active | 0.2.0 r0 | ADR.1 | Frame-unit scaling with px rewriting
ADR-8 | decisions | active | 0.2.0 r0 | ADR.2 | CSS delivered inline per page by default, or linked by the site
ADR-9 | decisions | active | 0.2.0 r0 | ADR.2 | Local images are embedded as data URIs at build time
M-API-1 | model | active | 0.2.0 r0 | MODEL.1 | RenderResult
M-DIAG-1 | model | active | 0.2.0 r0 | MODEL.1 | Diagnostic
M-OPT-1 | model | active | 0.2.0 r0 | MODEL.1 | RenderOptions
M-PACK-1 | model | active | 0.2.0 r0 | MODEL.1 | Pack
M-PACK-2 | model | active | 0.2.0 r0 | MODEL.1 | ElementDef
M-SYN-1 | model | active | 0.2.0 r0 | MODEL.1 | Module
M-VIEW-1 | model | active | 0.2.0 r0 | MODEL.1 | View
M-VIEW-2 | model | active | 0.2.0 r0 | MODEL.1 | Modifier
M-VIEW-3 | model | active | 0.2.0 r0 | MODEL.1 | Screen
M-VIEW-4 | model | active | 0.2.0 r0 | MODEL.1 | Value
R-ANN-001 | requirements | active | 0.3.0 r0 | ANN.1 | Numbered callouts
R-ANN-002 | requirements | active | 0.3.0 r0 | ANN.1 | Pointers, selections, highlights and taps
R-ANN-003 | requirements | active | 0.6.2 r1 | ANN.1 | Overlay placement and free positioning
R-ANN-004 | requirements | active | 0.3.0 r0 | ANN.1 | Callout references in prose
R-API-001 | requirements | active | 0.2.0 r0 | API.1 | render
R-API-002 | requirements | active | 0.2.0 r0 | API.1 | check, evaluate and stylesheet
R-API-003 | requirements | active | 0.2.0 r0 | API.1 | Render options
R-API-004 | requirements | active | 0.2.0 r0 | API.1 | Dependencies and platform
R-APP-001 | requirements | active | 0.2.0 r0 | REND.2 | Appearance selection
R-APP-002 | requirements | active | 0.2.0 r0 | REND.2 | Token application by appearance
R-APP-003 | requirements | active | 0.2.0 r0 | REND.2 | Side-by-side appearances
R-ASSET-001 | requirements | active | 0.2.0 r0 | ASSET.1 | Classifying image references
R-ASSET-002 | requirements | active | 0.2.0 r0 | ASSET.1 | Finding local images
R-ASSET-003 | requirements | active | 0.2.0 r0 | ASSET.1 | Embedding local images
R-ASSET-004 | requirements | active | 0.2.0 r0 | ASSET.1 | Image-bearing attributes
R-ASSET-005 | requirements | active | 0.2.0 r0 | ASSET.1 | Built-in icons
R-CLI-001 | requirements | active | 0.2.0 r0 | CLI.1 | Commands
R-CLI-002 | requirements | active | 0.2.0 r0 | CLI.1 | Rendering options on the command line
R-CLI-003 | requirements | active | 0.2.0 r0 | CLI.1 | render
R-CLI-004 | requirements | active | 0.2.0 r0 | CLI.1 | check
R-CLI-005 | requirements | active | 0.2.0 r0 | CLI.1 | css
R-CLI-006 | requirements | active | 0.2.0 r0 | CLI.1 | packs and elements
R-DEV-001 | requirements | active | 0.2.0 r0 | REND.2 | Device forms and sizes
R-DEV-002 | requirements | active | 0.2.1 r1 | REND.2 | Device selection
R-DEV-003 | requirements | active | 0.2.0 r0 | REND.2 | Frame unit scaling
R-DEV-004 | requirements | active | 0.2.0 r0 | REND.2 | Length rewriting
R-DEV-005 | requirements | active | 0.2.0 r0 | REND.2 | Device chrome
R-DEV-006 | requirements | active | 0.2.0 r0 | REND.2 | Isolation from the host page
R-DEV-007 | requirements | active | 0.3.0 r0 | REND.1 | Additional chrome kinds
R-DEV-008 | requirements | active | 0.7.0 r0 | REND.2 | Fit frames: natural width and presentations
R-DEV-009 | requirements | active | 0.7.0 r0 | REND.2 | The macOS menu bar
R-DEV-010 | requirements | active | 0.7.0 r0 | REND.2 | Multi-platform chrome for SwiftUI
R-DIAG-001 | requirements | active | 0.2.0 r0 | DIAG.1 | Diagnostic content
R-DIAG-002 | requirements | active | 0.2.0 r0 | DIAG.1 | Collecting diagnostics
R-DIAG-003 | requirements | active | 0.2.0 r0 | DIAG.1 | Diagnostic codes
R-DIAG-004 | requirements | active | 0.2.0 r0 | DIAG.1 | The error box
R-DIAG-005 | requirements | active | 0.2.0 r0 | DIAG.1 | Syntax errors and partial rendering
R-EVAL-001 | requirements | active | 0.2.0 r0 | LANG.2 | Evaluation always completes
R-EVAL-002 | requirements | active | 0.2.0 r0 | LANG.2 | What a block renders
R-EVAL-003 | requirements | active | 0.2.0 r0 | LANG.2 | Name resolution for views
R-EVAL-004 | requirements | active | 0.2.0 r0 | LANG.2 | Binding element arguments
R-EVAL-005 | requirements | active | 0.2.0 r0 | LANG.2 | Instantiating struct components
R-EVAL-006 | requirements | active | 0.2.0 r0 | LANG.2 | ForEach
R-EVAL-007 | requirements | active | 0.2.0 r0 | LANG.2 | Conditionals and local bindings
R-EVAL-008 | requirements | active | 0.2.0 r0 | LANG.2 | Values and operators
R-EVAL-009 | requirements | active | 0.2.0 r0 | LANG.2 | Modifiers
R-EVAL-010 | requirements | active | 0.2.0 r0 | LANG.2 | The @Screen directive
R-EVAL-011 | requirements | active | 0.2.1 r1 | LANG.2 | Tolerance for pasted SwiftUI
R-IMP-001 | requirements | active | 0.2.0 r0 | IMP.1 | File imports load components
R-IMP-002 | requirements | active | 0.2.0 r0 | IMP.1 | Resolving import paths
R-IMP-003 | requirements | active | 0.2.0 r0 | IMP.1 | Nested imports and cycles
R-IMP-004 | requirements | active | 0.2.0 r0 | IMP.1 | Definition precedence
R-IMP-005 | requirements | active | 0.2.0 r0 | IMP.1 | Import errors and caching
R-IMP-006 | requirements | active | 0.2.0 r0 | IMP.1 | Module imports are not file imports
R-LANG-001 | requirements | active | 0.2.0 r0 | LANG.1 | Lexical structure
R-LANG-002 | requirements | active | 0.2.0 r0 | LANG.1 | String literals and interpolation
R-LANG-003 | requirements | active | 0.2.0 r0 | LANG.1 | Module structure
R-LANG-004 | requirements | active | 0.2.0 r0 | LANG.1 | Struct declarations
R-LANG-005 | requirements | active | 0.2.0 r0 | LANG.1 | Statements
R-LANG-006 | requirements | active | 0.2.1 r1 | LANG.1 | Expressions and operators
R-LANG-007 | requirements | active | 0.2.0 r0 | LANG.1 | Calls, modifier chains and closures
R-LANG-008 | requirements | active | 0.2.0 r0 | LANG.1 | Collection and tuple literals
R-LANG-009 | requirements | active | 0.2.0 r0 | LANG.1 | Syntax errors
R-MDX-001 | requirements | active | 0.2.0 r0 | MDX.1 | Integration points
R-MDX-002 | requirements | active | 0.2.0 r0 | MDX.1 | Extension options
R-MDX-003 | requirements | active | 0.2.0 r0 | MDX.1 | Fence attributes
R-MDX-004 | requirements | active | 0.2.1 r1 | MDX.1 | Per-page CSS delivery
R-MDX-005 | requirements | active | 0.2.0 r0 | MDX.1 | Build log and strict mode
R-MDX-006 | requirements | active | 0.2.0 r0 | MDX.1 | Compatibility with instant navigation
R-PACK-001 | requirements | active | 0.2.0 r0 | PACK.1 | Pack directory layout and lookup
R-PACK-002 | requirements | active | 0.2.0 r0 | PACK.1 | pack.json keys
R-PACK-003 | requirements | active | 0.2.0 r0 | PACK.1 | Pack inheritance
R-PACK-004 | requirements | active | 0.2.0 r0 | PACK.1 | Element definitions
R-PACK-005 | requirements | active | 0.2.0 r0 | PACK.1 | Pack selection
R-PACK-006 | requirements | active | 0.2.0 r0 | PACK.1 | Design tokens
R-PACK-007 | requirements | active | 0.2.0 r0 | PACK.1 | Pack stylesheet rules
R-PACK-008 | requirements | active | 0.5.0 r4 | PACK.1 | Shipped packs
R-PACK-009 | requirements | active | 0.2.0 r0 | PACK.1 | The core vocabulary
R-PACK-010 | requirements | active | 0.3.0 r0 | PACK.1 | Hidden packs
R-PACK-011 | requirements | active | 0.3.0 r0 | PACK.1 | Argument aliases
R-PACK-012 | requirements | active | 0.5.0 r2 | PACK.1 | Pack reference gallery and site sections
R-PACK-013 | requirements | active | 0.7.0 r0 | PACK.1 | Element samples
R-PACK-014 | requirements | active | 0.7.0 r0 | PACK.1 | SwiftUI control styles
R-PACK-015 | requirements | active | 0.7.0 r0 | PACK.1 | SwiftUI presentations and navigation
R-REND-001 | requirements | active | 0.2.0 r0 | REND.1 | Figure structure
R-REND-002 | requirements | active | 0.2.0 r0 | REND.1 | Role markup
R-REND-003 | requirements | active | 0.2.0 r0 | REND.1 | Attributes on the markup
R-REND-004 | requirements | active | 0.2.0 r0 | REND.1 | Modifier rendering
R-REND-005 | requirements | active | 0.2.0 r0 | REND.1 | Text content and inline Markdown
R-REND-006 | requirements | active | 0.2.0 r0 | REND.1 | Output safety
R-REND-007 | requirements | active | 0.2.0 r0 | REND.1 | Static, deterministic output
R-REND-008 | requirements | active | 0.2.0 r0 | REND.1 | Unknown elements and roles
R-REND-009 | requirements | active | 0.2.0 r0 | REND.1 | Presentations and navigation composition
R-REND-010 | requirements | active | 0.2.0 r0 | REND.1 | Elements table and source disclosure
R-REND-011 | requirements | active | 0.3.0 r0 | REND.2 | Non-standard component roles
R-REND-012 | requirements | active | 0.7.0 r1 | REND.2 | Charts
R-REND-013 | requirements | active | 0.7.0 r0 | REND.1 | Rows without overlap
R-REND-014 | requirements | active | 0.7.0 r0 | REND.1 | Shape framing
R-REPO-001 | requirements | active | 0.6.0 r0 | REPO.1 | Repository layout
R-REPO-002 | requirements | active | 0.6.1 r1 | REPO.1 | Shared assets are the single source
R-REPO-003 | requirements | active | 0.6.1 r2 | REPO.1 | The Python variant after the move
R-REPO-004 | requirements | active | 0.6.2 r1 | REPO.1 | Conformance corpus
R-WEB-001 | requirements | active | 0.6.4 r2 | WEB.1 | TypeScript package and core
R-WEB-002 | requirements | active | 0.6.7 r2 | WEB.1 | The mockitdown-mockup element
R-WEB-003 | requirements | active | 0.6.5 r1 | WEB.2 | Development server
R-WEB-004 | requirements | active | 0.7.0 r2 | WEB.2 | Pack gallery test page
R-WEB-005 | requirements | active | 0.6.5 r2 | WEB.2 | Web test suites
