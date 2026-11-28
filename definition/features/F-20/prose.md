**Problem.** One page of a design often holds several mockups, and tools that build design and specification projects (SpecItOut) must place each one where it belongs (SRC-8).

**Change.** An infinite canvas that zooms and pans, holding named mockups. The name is the key importing tools use.

**The design document (SRC-12#s10, SRC-12#s11, SRC-15).** A design document is one readable,
diffable JSON file, `*.mkdesign`, with each mockup's code kept verbatim, so it can be read without the
designer and imported by SpecItOut tools mockup by mockup. A mockup may use its own pack, which keeps
side-by-side comparisons possible; the document names the default. One small module in the mockitdown
package reads and writes the format for the components and for a desktop shell alike; Markdown and
folder export stay in the shell for now.

**Re-checked at definition 0.9.1.** F-19.CR-3 only adds F-21 to its prerequisites; the canvas depends on the design tools as before.

**Re-checked at definition 0.9.2.** The F-17 clarification changed no obligation; this feature is unaffected.

**Deliberate constraints (SRC-18#answers).** The format and the place of the module are fixed on
purpose, so that SpecItOut tools and a desktop shell can rely on one readable file and one small module.

**Copies and sections (SRC-21#answers).** A duplicated mockup is named `<name>-copy` for the designer
to rename, as a duplicated element is (F-19.C23). Sections are created and removed on the canvas
itself; removing one never moves or removes the mockups it enclosed.
