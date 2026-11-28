"""Collects, from rendered mockup HTML, the parts and data attributes each render role emits
(R-REND-002.C5, R-REND-003.C5), for comparison with the role catalogue."""

import re
from html.parser import HTMLParser

_ROOT = re.compile(r"^mkd-([a-z]+)$")
_BLOCK = re.compile(r"^mkd-([a-z-]+?)(?:__[\w-]+)?$")   # any mkd- block: a role, or presentation and chrome markup
_PART = re.compile(r"^mkd-([a-z]+)__([\w-]+)$")
_VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


class RoleMarkup(HTMLParser):
    def __init__(self, roles, common):
        super().__init__(convert_charrefs=True)
        self.roles = set(roles)
        self.common = {c.lower() for c in common}   # attribute names arrive lower-cased
        self.parts: dict[str, set[str]] = {}
        self.data: dict[str, set[str]] = {}
        self.stack: list[str] = []      # the role each open element belongs to ("" outside every role)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = (a.get("class") or "").split()
        owner, root = None, False
        for c in classes:
            m = _ROOT.match(c)
            if m and m.group(1) in self.roles:
                owner, root = m.group(1), True
                break
        if owner is None:
            for c in classes:
                m = _PART.match(c)
                if m and m.group(1) in self.roles:
                    owner = m.group(1)
                    break
        for c in classes:
            m = _PART.match(c)
            if m and m.group(1) in self.roles:
                self.parts.setdefault(m.group(1), set()).add(m.group(2))
        if owner is None and any(_BLOCK.match(c) for c in classes if c.startswith("mkd-")):
            owner = ""                  # presentation, chrome or figure markup: not a role's
        if owner is None:
            owner = self.stack[-1] if self.stack else ""
        if owner:
            names = {k[5:] for k in a if k.startswith("data-")}
            if root:
                names -= self.common
            if names:
                self.data.setdefault(owner, set()).update(names)
        if tag not in _VOID:
            self.stack.append(owner)

    def handle_endtag(self, tag):
        if tag not in _VOID and self.stack:
            self.stack.pop()


def collect(htmls, roles, common):
    """(parts, data): per role, the part names and the data attribute names (lower-cased; on a role's
    root, those common to every role left out) in ``htmls``."""
    p = RoleMarkup(roles, common)
    for h in htmls:
        p.feed(h)
        p.stack.clear()
    return p.parts, p.data
