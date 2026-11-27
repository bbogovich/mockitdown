**Problem.** One page of a design often holds several mockups, and tools that build design and specification projects (SpecItOut) must place each one where it belongs (SRC-8).

**Change.** An infinite canvas that zooms and pans, holding named mockups. The name is the key importing tools use.

**The design document (SRC-12#s10, SRC-12#s11, SRC-15).** A design document is one readable,
diffable JSON file, `*.mkdesign`, with each mockup's code kept verbatim, so it can be read without the
designer and imported by SpecItOut tools mockup by mockup. A mockup may use its own pack, which keeps
side-by-side comparisons possible; the document names the default. One small module in the mockitdown
package reads and writes the format for the components and for a desktop shell alike; Markdown and
folder export stay in the shell for now.
