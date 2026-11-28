Everything that can be set for one mockup, from the site, the fence or the CLI.

`edit` is a library option (R-EDIT-004.C10); the fence and the command line do not offer it.

`default_device`, `window`, `windowed`, `menubar` and `app` were options of the library before this
list named them; they were added as built (#56). `None` for `windowed`, `menubar` and `app` means the
value comes from `@Screen` or the default.
