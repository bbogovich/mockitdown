"""External assets (images) referenced from a mockup.

``Image("assets/team.jpg")`` is resolved at build time:

* ``http(s)://``, protocol-relative ``//`` and ``data:image/…`` references pass through unchanged;
* a local path is looked up relative to the block's own file (when known), then each asset path;
* with ``embed`` on (the default) a found file is inlined as a ``data:`` URI, so the rendered page is
  self-contained and the reference works at any page URL; files over ``max_bytes`` are linked instead;
* with ``embed`` off the reference is emitted as written, for the browser to resolve.

A local path is only read when it resolves inside one of the search roots.
"""

from __future__ import annotations

import base64
import mimetypes
import re
from pathlib import Path

from .diagnostics import Diagnostics, Location

_MIME = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
    ".webp": "image/webp", ".svg": "image/svg+xml", ".avif": "image/avif", ".ico": "image/x-icon",
    ".bmp": "image/bmp",
}
_REMOTE = re.compile(r"^(https?:)?//", re.I)
_DATA = re.compile(r"^data:image/[a-z0-9.+-]+(;[a-z0-9=.+-]+)*,", re.I)


class AssetResolver:
    def __init__(self, search_paths: list[Path], base_dir: Path | None, diags: Diagnostics, *, embed: bool = True,
                 max_bytes: int = 2_000_000) -> None:
        self.roots = [p.resolve() for p in ([base_dir] if base_dir else []) + list(search_paths)]
        self.embed = embed
        self.max_bytes = max_bytes
        self.diags = diags
        self._cache: dict[Path, str] = {}

    def _find(self, ref: str) -> Path | None:
        rel = Path(ref.split("?", 1)[0].split("#", 1)[0])
        for root in self.roots:
            cand = (root / rel).resolve() if not rel.is_absolute() else rel.resolve()
            if cand.is_file() and any(cand.is_relative_to(r) for r in self.roots):
                return cand
        return None

    def resolve(self, ref: str, loc: Location | None = None) -> str | None:
        """A URL for ``ref`` to put in ``src``, or None when a local file cannot be found."""
        ref = ref.strip()
        if not ref:
            return None
        if _REMOTE.match(ref):
            return ref
        if ref.lower().startswith("data:"):
            if _DATA.match(ref):
                return ref
            self.diags.warning("only data:image/… URIs are accepted", loc, "asset")
            return None
        if re.match(r"^[a-z][a-z0-9+.-]*:", ref, re.I):  # javascript:, file:, …
            self.diags.warning(f"unsupported asset scheme in {ref!r}", loc, "asset")
            return None
        if not self.embed:
            return ref
        path = self._find(ref)
        if path is None:
            searched = ", ".join(str(r) for r in self.roots) or "(no asset paths)"
            self.diags.warning(f"asset {ref!r} not found (searched {searched})", loc, "asset")
            return None
        if path in self._cache:
            return self._cache[path]
        size = path.stat().st_size
        if size > self.max_bytes:
            self.diags.warning(f"asset {ref!r} is {size} bytes, over the {self.max_bytes}-byte embed limit; "
                               "it is linked instead", loc, "asset")
            return ref
        mime = _MIME.get(path.suffix.lower()) or mimetypes.guess_type(path.name)[0]
        if not mime or not mime.startswith("image/"):
            self.diags.warning(f"asset {ref!r} is not a recognised image type", loc, "asset")
            return None
        uri = f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"
        self._cache[path] = uri
        return uri
