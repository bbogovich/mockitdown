The demo pages show packs at work in realistic screens; the Reference pages answer the narrower question
"what can I write in this pack, and what does it look like?". They are generated, never hand-written, so
they cannot drift from `pack.json`: the test suite regenerates them in memory and compares.

The documentation (docs branch) and the example site (main branch) remain two Zensical builds published
side by side (`/` and `/demos/`); identical header tabs make them read as one site. The Reference section
lives in the example site because it is generated from code and needs every pack's CSS.

The pack gallery of the web components (R-WEB-004) is published beside them at `/gallery/` and has its
own header tab, Gallery, next to the User guide (formerly Demo) on both sites (SRC-17, SRC-19).
