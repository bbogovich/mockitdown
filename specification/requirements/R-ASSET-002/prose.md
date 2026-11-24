The containment rule matters because documentation builds run on CI with access to the whole
repository: a mockup may only embed files the site deliberately exposes.

**Known gap.** A fenced block in a Markdown page has no known file (Python-Markdown does not tell
the fence which page it is rendering), so in a site build only the configured asset directories are
searched; resolution against the block's own directory applies to the command line and the library
API when a source path is given.
