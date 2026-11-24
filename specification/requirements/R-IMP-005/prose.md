Caching matters for sites where many pages import the same library: each file is parsed once per
build unless it changes, which also keeps `zensical serve` reloads correct.
