"""Images and icons: classifying references (R-ASSET-001), finding local images (R-ASSET-002),
image-bearing attributes (R-ASSET-004) and the built-in icons (R-ASSET-005).

Each test names the test case (TC-n) and the clauses it verifies.
"""

import base64
import json
import os
import re
import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT, html
from mockitdown import RenderOptions, render
from mockitdown import icons
from mockitdown.assets import AssetResolver
from mockitdown.diagnostics import Diagnostics
from mockitdown.packs import registry

REPO = ROOT.parent
SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><!--{}--></svg>'
PHOTO = icons.ICONS["photo"]


def _found(r) -> list[tuple[str, str, str]]:
    return [(d.severity.value, d.code, d.message) for d in r.diagnostics]


def _uri(text: str) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(text.encode()).decode("ascii")


class ClassifyTests(unittest.TestCase):
    """R-ASSET-001 TC-1."""

    def test_remote_references_pass_through(self):  # TC-1 (C1, V1)
        for ref in ("https://x/y.png", "http://x/y.png", "HTTPS://X/Y.PNG", "//cdn.example/y.png"):
            r = render(f'Image("{ref}")', device="fit")
            self.assertEqual(_found(r), [])
            self.assertIn(f'<img class="mkd-image" data-el="Image" src="{ref}" alt="">', r.html)

    def test_only_image_data_uris(self):  # TC-1 (C2, V1)
        ok = "data:image/png;charset=x;base64,iVBORw0KGgo="
        self.assertIn(f'src="{ok}"', render(f'Image("{ok}")', device="fit").html)
        for ref in ("data:text/html,hi", "DATA:application/json,{}"):
            r = render(f'Image("{ref}")', device="fit")
            self.assertEqual(_found(r), [("warning", "asset", "only data:image/… URIs are accepted")])
            self.assertIn("mkd-image--placeholder", r.html)

    def test_other_schemes_are_refused(self):  # TC-1 (C3, V1)
        for ref in ("javascript:x", "file:///etc/passwd", "ftp://x/y.png", "mailto:a@b"):
            r = render(f'Image("{ref}")', device="fit")
            self.assertEqual(_found(r), [("warning", "asset", f"unsupported asset scheme in {ref!r}")])
            self.assertIn("mkd-image--placeholder", r.html)
            self.assertNotIn(f'src="{ref}"', r.html)

    def test_local_paths_trimmed_and_empty_resolves_to_nothing(self):  # TC-1 (C4)
        with tempfile.TemporaryDirectory() as d:
            Path(d, "pic.svg").write_text(SVG.format("a"), encoding="utf-8")
            diags = Diagnostics()
            res = AssetResolver([Path(d)], None, diags)
            self.assertEqual(res.resolve("  pic.svg \n"), _uri(SVG.format("a")))
            self.assertEqual(res.resolve("  https://x/y.png "), "https://x/y.png")
            self.assertIsNone(res.resolve(""))
            self.assertIsNone(res.resolve("   "))
            self.assertEqual(diags.items, [])

    def test_refused_or_missing_draws_the_placeholder(self):  # TC-1 (C5)
        r = render('Image("javascript:x", alt: "Team")', device="fit")
        self.assertIn(f'<span class="mkd-image mkd-image--placeholder" data-el="Image">'
                      f'<svg class="mkd-icon" data-icon="photo"', r.html)
        self.assertIn('<span class="mkd-image__label">Team</span>', r.html)
        r = render('Image("missing.png")', device="fit")
        self.assertIn('<span class="mkd-image__label">missing.png</span>', r.html)
        self.assertIn(PHOTO, r.html)
        card = render('Card(title: "T", cover: "missing.png")', device="fit").html
        self.assertIn(f'<div class="mkd-card__media mkd-card__media--missing"', card)
        self.assertIn(PHOTO, card)
        row = render('List { ListItem("Ana", image: "javascript:x") }', device="fit").html
        self.assertIn('<span class="mkd-thumb mkd-thumb--missing">', row)


class LocalImageTests(unittest.TestCase):
    """R-ASSET-002 TC-1."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name).resolve()
        for name in ("src", "one", "two", "outside"):
            (self.root / name).mkdir()
        (self.root / "src" / "page.mockitdown").write_text("", encoding="utf-8")

    def tearDown(self):
        self._tmp.cleanup()

    def put(self, rel: str, tag: str) -> str:
        p = self.root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(SVG.format(tag), encoding="utf-8")
        return _uri(SVG.format(tag))

    def render(self, ref: str, source: bool = True, **kw):
        opts = RenderOptions(device="fit", asset_paths=(self.root / "one", self.root / "two"),
                             source_path=self.root / "src" / "page.mockitdown" if source else None, **kw)
        return render(f'Image("{ref}")', opts)

    def test_search_order_first_existing_file(self):  # TC-1 (C1)
        in_src = self.put("src/pic.svg", "src")
        in_one = self.put("one/pic.svg", "one")
        in_two = self.put("two/other.svg", "two")
        self.assertIn(f'src="{in_src}"', self.render("pic.svg").html)
        self.assertIn(f'src="{in_one}"', self.render("pic.svg", source=False).html)
        self.assertIn(f'src="{in_two}"', self.render("other.svg").html)
        r = self.render("pic.svg?v=2#top")
        self.assertEqual(_found(r), [])
        self.assertIn(f'src="{in_src}"', r.html)

    def test_never_outside_the_search_roots(self):  # TC-1 (C2, V1)
        self.put("outside/secret.svg", "secret")
        refs = ["../outside/secret.svg", str(self.root / "outside" / "secret.svg")]
        try:
            (self.root / "one" / "link.svg").symlink_to(self.root / "outside" / "secret.svg")
            refs.append("link.svg")
        except OSError:  # no symbolic links (Windows without the privilege)
            pass
        for ref in refs:
            r = self.render(ref)
            self.assertNotIn("data:image", r.html, ref)
            self.assertEqual([(s, c) for s, c, _ in _found(r)], [("warning", "asset")], ref)
            self.assertIn("not found", _found(r)[0][2], ref)

    def test_not_found_lists_the_search_roots(self):  # TC-1 (C3)
        r = self.render("nope.png")
        roots = ", ".join(str(self.root / n) for n in ("src", "one", "two"))
        self.assertEqual(_found(r), [("warning", "asset", f"asset 'nope.png' not found (searched {roots})")])

    def test_relative_asset_directories_against_the_working_directory(self):  # TC-1 (C4, V1)
        logo = self.put("docs/assets/images/logo.svg", "logo")
        cwd = os.getcwd()
        os.chdir(self.root)
        try:
            out = html('Image("assets/images/logo.svg")', device="fit", asset_paths=(Path("docs"),))
        finally:
            os.chdir(cwd)
        self.assertIn(f'src="{logo}"', out)


class ImageAttributeTests(unittest.TestCase):
    """R-ASSET-004 TC-1."""

    def test_image_avatar_and_leading_visual_attributes(self):  # TC-1 (C1, V1)
        for attr in ("url", "src", "source"):
            self.assertIn('src="https://x/a.png"', html(f'Image({attr}: "https://x/a.png")', device="fit"), attr)
        self.assertIn('src="https://x/a.png"', html('Image("https://x/a.png")', device="fit"))
        for attr in ("image", "src", "url"):
            out = html(f'Avatar("Ana Lima", {attr}: "https://x/ana.jpg")', device="fit")
            self.assertIn('<img src="https://x/ana.jpg" alt="Ana Lima">', out, attr)
        self.assertIn('data-hue="', html('Avatar("Ana Lima")', device="fit"))
        self.assertIn(">AL</span>", html('Avatar("Ana Lima")', device="fit"))
        for attr in ("image", "thumbnail"):
            out = html(f'List {{ ListItem("Ana", {attr}: "https://x/a.png") }}', device="fit")
            self.assertIn('<img class="mkd-thumb" src="https://x/a.png" alt="">', out, attr)

    def test_card_media(self):  # TC-1 (C2)
        for attr in ("cover", "media", "image"):
            out = html(f'Card(title: "T", {attr}: "https://x/c.png")', device="fit")
            self.assertIn('<img class="mkd-card__media" src="https://x/c.png" alt=""', out, attr)

    def test_system_names_are_icons(self):  # TC-1 (C3)
        for attr in ("systemName", "icon", "symbol"):
            out = html(f'Image({attr}: "star.fill")', device="fit")
            self.assertIn('data-icon="star.fill"', out, attr)
            self.assertNotIn("<img", out, attr)

    def test_img_and_alt(self):  # TC-1 (C4, V1)
        for attr in ("alt", "label", "accessibilityLabel"):
            out = html(f'Image("https://x/a.png", {attr}: "Team")', device="fit")
            self.assertIn('<img class="mkd-image" data-el="Image" src="https://x/a.png" alt="Team">', out, attr)
        self.assertIn('src="https://x/a.png" alt="">', html('Image("https://x/a.png")', device="fit"))


class IconTests(unittest.TestCase):
    """R-ASSET-005 TC-1."""

    def test_own_line_glyphs_and_no_icon_font(self):  # TC-1 (C1)
        data = json.loads((REPO / "shared" / "icons" / "icons.json").read_text(encoding="utf-8"))
        self.assertGreater(len(data["glyphs"]), 100)
        for name, body in data["glyphs"].items():
            self.assertNotRegex(body, r"url\(|<image|<text|href=", name)
        markup, _ = icons.svg("star")
        self.assertIn('viewBox="0 0 24 24"', markup)
        self.assertIn('fill="none" stroke="currentColor"', markup)
        fonts = [p for base in (REPO / "shared", ROOT / "src") for p in base.rglob("*")
                 if p.suffix.lower() in (".woff", ".woff2", ".ttf", ".otf", ".eot")]
        self.assertEqual(fonts, [])
        for path in [*(REPO / "shared" / "packs").rglob("*.css"), REPO / "shared" / "css" / "page.css"]:
            css = path.read_text(encoding="utf-8")
            self.assertNotIn("@font-face", css, path)
            self.assertNotRegex(css, r"@import\s+url|fonts\.googleapis|material-symbols|fluent.*\.woff", path)

    def test_resolution_order(self):  # TC-1 (C2)
        antd = registry(()).get("antd")
        name, glyph = next(iter(antd.icons.items()))
        self.assertIn(f'data-icon="{icons.resolve(glyph)}"', html(f'import antd\nIcon("{name}")', device="fit"))
        self.assertEqual(icons.resolve("star"), "star")                       # glyph name
        alias = next(a for a in icons.ALIASES if a not in icons.ICONS)
        self.assertEqual(icons.resolve(alias), icons.ALIASES[alias])           # alias
        self.assertEqual(icons.resolve("Star24Regular"), "star")               # normalised
        self.assertEqual(icons.resolve("star.circle"), "star")                 # without .circle
        self.assertEqual(icons.resolve("trash.fill"), "trash")                 # without .fill
        self.assertEqual(icons.resolve("trash.slash.fill"), "trash")           # first segment
        self.assertEqual(icons.resolve("more_vert"), icons.ALIASES["more.vert"])  # normalised alias

    def test_normalisation(self):  # TC-1 (C3)
        cases = {
            "sap-icon://favorite": "favorite", "ChevronRight24Regular": "chevron.right",
            "more_vert": "more.vert", "arrow-left": "arrow.left", "folder/open": "folder.open",
            "Add Circle": "add.circle", "ic_home_outlined": "home", "Mail20Filled": "mail",
            "star_rounded": "star", "symbols sharp light color fluent": "", "home48": "home",
        }
        for raw, want in cases.items():
            self.assertEqual(icons.normalize(raw), want, raw)

    def test_framework_aliases(self):  # TC-1 (C4, V1)
        for name in ("star.fill", "square.and.arrow.up", "gearshape", "more_vert", "delete", "home",
                     "Star24Regular", "Delete24Regular", "ChevronRight24Regular",
                     "sap-icon://favorite", "sap-icon://delete", "sap-icon://home", "favorite"):
            self.assertIsNotNone(icons.resolve(name), name)

    def test_unknown_icon(self):  # TC-1 (C5, V1)
        markup, found = icons.svg("xyzzy")
        self.assertFalse(found)
        self.assertIn(icons.ICONS["questionmark"], markup)
        r = render('Icon("xyzzy")', device="fit")
        self.assertEqual(_found(r), [("warning", "icon", "unknown icon 'xyzzy'")])
        self.assertIn('data-icon="unknown"', r.html)

    def test_inline_svg_and_stroke_token(self):  # TC-1 (C6)
        out = html('Icon("star")', device="fit")
        svg = re.search(r"<svg class=\"mkd-icon\"[^>]*>", out).group(0)
        for attr in ('viewBox="0 0 24 24"', 'aria-hidden="true"', 'focusable="false"'):
            self.assertIn(attr, svg)
        base_css = (REPO / "shared" / "packs" / "base" / "pack.css").read_text(encoding="utf-8")
        self.assertRegex(base_css, r"\.mkd-frame \.mkd-icon \{[^}]*stroke-width: var\(--mkd-icon-stroke\)")
        self.assertIn("icon-stroke", registry(()).get("base").tokens["light"])


if __name__ == "__main__":
    unittest.main()
