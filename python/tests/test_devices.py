"""Device forms, sizes, selection, frame scaling, isolation and chrome (R-DEV-001, R-DEV-002, R-DEV-003,
R-DEV-005, R-DEV-006, R-DEV-007).

Each test names the test case (TC-n) and the clauses it verifies. The browser halves of R-DEV-003 and
R-DEV-006 (TC-2) are in typescript/tests/browser/devices.spec.mjs; R-DEV-004.TC-1 is in test_render.py.
"""

import json
import re
import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT  # noqa: F401  (puts src/ on sys.path)
from mockitdown import RenderOptions, render, stylesheet
from mockitdown.options import DEVICES
from mockitdown.render import chrome as chrome_mod

SHARED = ROOT.parent / "shared"
PAGE_CSS = (SHARED / "css" / "page.css").read_text(encoding="utf-8")


def size(html):
    m = re.search(r'class="mkd-frame"[^>]*style="--mkd-w:(\d+);--mkd-h:(\d+)"', html)
    return (int(m.group(1)), int(m.group(2))) if m else None


def frame_attr(html, name):
    m = re.search(rf'class="mkd-frame"[^>]*\b{name}="([^"]*)"', html)
    return m.group(1) if m else None


def rule(css, selector):
    """The declarations of the first rule whose selector list is exactly ``selector``."""
    m = re.search(rf"(?:^|}})\s*{re.escape(selector)}\s*{{([^}}]*)}}", css, re.M)
    assert m, selector
    return {k.strip(): v.strip() for k, v in (d.split(":", 1) for d in m.group(1).split(";") if ":" in d)}


def selectors(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"@[^{;]*\{", "", css)            # at-rule preludes (@media, @container, @keyframes)
    out = []
    for block in re.findall(r"([^{}]+)\{", css):
        depth, start = 0, 0
        for i, ch in enumerate(block + ","):
            depth += (ch == "(") - (ch == ")")
            if ch == "," and depth == 0:
                if block[start:i].strip():
                    out.append(block[start:i].strip())
                start = i + 1
    return out


class PackDirTest(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def pack(self, pid, **raw):
        d = self.dir / pid
        d.mkdir()
        (d / "pack.json").write_text(json.dumps({"id": pid, "name": pid, "extends": "base", **raw}),
                                     encoding="utf-8")
        (d / "pack.css").write_text("", encoding="utf-8")
        return RenderOptions(pack=pid, pack_paths=(self.dir,))


class DeviceFormTests(PackDirTest):
    """R-DEV-001 TC-1."""

    def test_the_six_forms_and_their_sizes(self):  # TC-1 (C1)
        expected = {"phone": (393, 852), "phone-landscape": (852, 393), "tablet": (1180, 820),
                    "tablet-portrait": (820, 1180), "desktop": (1280, 800), "wide": (1440, 900)}
        self.assertEqual(DEVICES, expected)
        for device, wh in expected.items():
            r = render('Text("x")', device=device)
            self.assertEqual(r.diagnostics, [], device)
            self.assertEqual(size(r.html), wh, device)
            self.assertEqual(frame_attr(r.html, "data-device"), device)

    def test_a_pack_overrides_sizes_and_adds_forms(self):  # TC-1 (C2, V1)
        opts = self.pack("tiny", sizes={"phone": [390, 844], "watch": [198, 242]})
        self.assertIn('style="--mkd-w:390;--mkd-h:844"', render('Text("x")', opts, device="phone").html)
        r = render('Text("x")', opts, device="watch")
        self.assertEqual((r.diagnostics, size(r.html)), ([], (198, 242)))
        # Only for that pack: base keeps the default phone and knows no watch.
        self.assertIn('style="--mkd-w:393;--mkd-h:852"', render('Text("x")', device="phone").html)
        self.assertEqual([d.code for d in render('Text("x")', device="watch").diagnostics], ["device"])
        # A shipped pack's sizes (Android phones are 412 points wide).
        self.assertEqual(size(render('Text("x")', pack="android", device="phone").html), (412, 915))

    def test_fit_sizes_the_frame_to_its_content(self):  # TC-1 (C3)
        r = render('Text("x")', device="fit")
        self.assertEqual(r.diagnostics, [])
        self.assertIsNone(size(r.html))
        self.assertEqual(frame_attr(r.html, "data-fit"), "true")
        self.assertEqual(frame_attr(r.html, "data-device"), "fit")


class DeviceSelectionTests(PackDirTest):
    """R-DEV-002 TC-1."""

    def test_option_over_screen_over_default_over_pack(self):  # TC-1 (C1, V1)
        src = '@Screen(device: .phone)\nText("x")'
        self.assertEqual(frame_attr(render(src, device="wide").html, "data-device"), "wide")
        self.assertEqual(frame_attr(render(src, default_device="tablet").html, "data-device"), "phone")
        self.assertEqual(frame_attr(render('Text("x")', default_device="tablet").html, "data-device"), "tablet")
        self.assertEqual(frame_attr(render('Text("x")').html, "data-device"), "desktop")      # base's device
        self.assertEqual(frame_attr(render('Text("x")', pack="android").html, "data-device"), "phone")
        opts = self.pack("pocket", device="phone-landscape")
        self.assertEqual(frame_attr(render('Text("x")', opts).html, "data-device"), "phone-landscape")

    def test_unknown_device_warns_and_uses_desktop(self):  # TC-1 (C2)
        r = render('@Screen(device: .tv)\nText("x")')
        (d,) = r.diagnostics
        self.assertEqual((d.severity.value, d.code), ("warning", "device"))
        self.assertEqual(d.message, "unknown device 'tv'; using desktop (known: phone, phone-landscape, tablet, "
                                    "tablet-portrait, desktop, wide, fit)")
        self.assertEqual((frame_attr(r.html, "data-device"), size(r.html)), ("desktop", (1280, 800)))
        # Desktop in the pack's own size.
        lisa = json.loads((SHARED / "packs" / "lisa" / "pack.json").read_text(encoding="utf-8"))
        self.assertEqual(size(render('Text("x")', pack="lisa", device="tv").html), tuple(lisa["sizes"]["desktop"]))

    def test_width_and_height(self):  # TC-1 (C2, C3, V1)
        self.assertEqual(size(render('Text("x")', device="phone", width=600).html), (600, 852))
        self.assertEqual(size(render('Text("x")', device="phone", height=500).html), (393, 500))
        self.assertEqual(size(render('Text("x")', device="phone", width=600, height=500).html), (600, 500))
        # Both given: exactly that size; an unknown form is kept as named and not warned about (C2).
        r = render('Text("x")', device="watch", width=200, height=300)
        self.assertEqual((r.diagnostics, size(r.html), frame_attr(r.html, "data-device")),
                         ([], (200, 300), "watch"))


class FrameUnitTests(unittest.TestCase):
    """R-DEV-003 TC-1 (the rules; the measurements are TC-2, in Chromium)."""

    def test_frame_unit_and_size(self):  # TC-1 (C1, C2)
        frame = rule(PAGE_CSS, ".mkd-frame")
        self.assertEqual(frame["--u"], "min(1px, calc(100cqw / var(--mkd-w, 1280)))")
        self.assertEqual(frame["width"], "calc(var(--mkd-w, 1280) * var(--u))")
        self.assertEqual(frame["height"], "calc(var(--mkd-h, 800) * var(--u))")
        # The rule reaches the assembled stylesheet unscaled (R-DEV-004.C4).
        self.assertIn("--u: min(1px, calc(100cqw / var(--mkd-w, 1280)))", stylesheet(["base"], minify=False))

    def test_fit_mode(self):  # TC-1 (C3)
        fit = rule(PAGE_CSS, '.mkd-frame[data-fit="true"]')
        self.assertEqual((fit["--u"], fit["width"], fit["height"]), ("1px", "max-content", "auto"))
        cell = rule(PAGE_CSS, '.mkd-cell:has(> .mkd-frame[data-fit="true"])')
        self.assertEqual((cell["max-width"], cell["overflow-x"], cell["container-type"]), ("100%", "auto", "normal"))

    def test_figure_and_cells_are_size_containers(self):  # TC-1 (C4)
        self.assertEqual(rule(PAGE_CSS, ".mkd-figure")["container-type"], "inline-size")
        self.assertEqual(rule(PAGE_CSS, ".mkd-cell")["container-type"], "inline-size")
        self.assertRegex(render('Text("x")').html,
                         r'^<div class="mkd-figure[^"]*"[^>]*><div class="mkd-stage"[^>]*><div class="mkd-cell">'
                         r'<div class="mkd-frame"')


class IsolationTests(unittest.TestCase):
    """R-DEV-006 TC-1 (the rules; the host-page comparison is TC-2, in Chromium)."""

    def test_frame_resets_host_typography(self):  # TC-1 (C1)
        m = re.search(r"\.mkd-frame :where\(([^)]*)\) \{([^}]*)\}", PAGE_CSS)
        tags = {t.strip() for t in m.group(1).split(",")}
        for decl in ("margin: 0", "padding: 0", "border: 0", "font: inherit", "letter-spacing: inherit",
                     "color: inherit", "background: none", "max-width: none"):
            self.assertIn(decl, m.group(2))
        self.assertIn(".mkd-frame *::after { box-sizing: border-box; }", PAGE_CSS)
        self.assertIn(".mkd-frame table { border-collapse: collapse;", PAGE_CSS)
        # Every HTML element the renderer writes inside a frame (the conformance corpus) is reset.
        used = set()
        for f in sorted((SHARED / "conformance").rglob("*.html")):
            body = f.read_text(encoding="utf-8")
            body = re.sub(r"<svg\b.*?</svg>", "", body, flags=re.S)        # SVG drawing elements
            body = re.sub(r'<div class="mkd-error.*?</div>\s*(?=<div class="mkd-figure|$)', "", body, flags=re.S)
            body = re.sub(r'<details class="mkd-source">.*?</details>', "", body, flags=re.S)  # below the figure
            used |= set(re.findall(r"<([a-z][a-z0-9]*)\b", body))
        self.assertTrue(used)
        self.assertLessEqual(used - {"col", "colgroup"}, tags,  # columns draw nothing themselves
                             "an element without a reset")

    def test_frame_isolates_and_clips(self):  # TC-1 (C2)
        frame = rule(PAGE_CSS, ".mkd-frame")
        self.assertEqual((frame["isolation"], frame["overflow"], frame["position"]), ("isolate", "hidden", "relative"))

    def test_css_is_scoped_to_mockitdown_classes(self):  # TC-1 (C3)
        # Each selector names a mockitdown class, so it matches only that element or what is inside it
        # (a host attribute may come first: `[data-md-color-scheme="slate"] .mkd-pack-base …`, R-APP-002).
        scoped = re.compile(r"\.mkd-[a-z]")
        found = selectors(PAGE_CSS)
        self.assertTrue(found)
        for s in found:
            self.assertRegex(s, scoped)
        for s in selectors(stylesheet(["base", "swiftui", "fluent"], minify=False)):
            if not re.fullmatch(r"from|to|\d+(\.\d+)?%", s):
                self.assertRegex(s, scoped)


class ChromeTests(unittest.TestCase):
    """R-DEV-005 TC-1."""

    def test_the_chrome_kinds(self):  # TC-1 (C1)
        self.assertLessEqual({"none", "ios", "ipados", "macos", "windows", "android", "browser"},
                             set(chrome_mod.CHROME_KINDS))
        for kind in chrome_mod.CHROME_KINDS:
            self.assertEqual(render('Text("x")', chrome=kind).diagnostics, [], kind)

    def test_option_over_screen_over_pack_map(self):  # TC-1 (C2)
        ios = '@Screen(chrome: .ios)\nText("x")'
        self.assertEqual(frame_attr(render(ios, chrome="android").html, "data-chrome"), "android")
        self.assertEqual(frame_attr(render(ios).html, "data-chrome"), "ios")
        self.assertEqual(frame_attr(render(ios, chrome="auto").html, "data-chrome"), "ios")
        auto = '@Screen(chrome: .auto)\nText("x")'
        self.assertEqual(frame_attr(render(auto, pack="swiftui", device="phone").html, "data-chrome"), "ios")
        self.assertEqual(frame_attr(render('Text("x")', pack="swiftui", device="tablet").html, "data-chrome"),
                         "ipados")
        self.assertEqual(frame_attr(render('Text("x")', pack="android", device="desktop").html, "data-chrome"),
                         "none")
        self.assertEqual(frame_attr(render('Text("x")', pack="swiftui", device="fit").html, "data-chrome"),
                         "none")  # unmapped

    def test_unknown_chrome_warns_and_draws_none(self):  # TC-1 (C3)
        for r in (render('Text("x")', chrome="bogus"), render('@Screen(chrome: .bogus)\nText("x")')):
            (d,) = r.diagnostics
            self.assertEqual((d.severity.value, d.code), ("warning", "chrome"))
            self.assertEqual(d.message, f"unknown chrome 'bogus' (known: {', '.join(chrome_mod.CHROME_KINDS)})")
            self.assertEqual(frame_attr(r.html, "data-chrome"), "none")
            self.assertNotIn("mkd-chrome", r.html)

    def test_what_each_kind_draws(self):  # TC-1 (C4, V1)
        ios = render('Text("x")', pack="swiftui", device="phone").html
        for part in ('mkd-chrome__time">9:41<', "mkd-chrome__island", 'data-icon="cellularbars"', 'data-icon="wifi"',
                     'data-icon="battery"', 'class="mkd-chrome mkd-chrome--home" data-chrome="ios"'):
            self.assertIn(part, ios)
        ipad = render('Text("x")', chrome="ipados").html
        self.assertRegex(ipad, r'mkd-chrome__time">9:41 \w{3} \w{3} \d+<')
        self.assertIn('mkd-chrome__pct">100%<', ipad)
        self.assertIn('mkd-chrome--home" data-chrome="ipados"', ipad)
        android = render('Text("x")', chrome="android").html
        self.assertIn('mkd-chrome--status" data-chrome="android"', android)
        self.assertIn('mkd-chrome--home" data-chrome="android"', android)
        mac = render('Text("x")', chrome="macos", title="Notes").html
        self.assertEqual(re.findall(r'data-light="(\w+)"', mac), ["close", "min", "max"])
        self.assertIn('mkd-chrome__title">Notes<', mac)
        win = render('Text("x")', chrome="windows", title="Notes").html
        for part in ('data-icon="app"', 'mkd-chrome__title">Notes<'):
            self.assertIn(part, win)
        self.assertEqual(re.findall(r'data-control="(\w+)"', win), ["min", "max", "close"])
        browser = render('Text("x")', chrome="browser").html
        for part in ('data-light="close"', 'data-icon="chevron.left"', 'data-icon="chevron.right"',
                     'data-icon="arrow.clockwise"', "<span>https://app.example.com</span>",
                     'mkd-chrome__menu"'):
            self.assertIn(part, browser)
        shop = render('Text("x")', chrome="browser", url="https://shop.example.com").html
        self.assertIn("<span>https://shop.example.com</span>", shop)
        self.assertIn("<span>https://from.screen</span>",
                      render('@Screen(url: "https://from.screen")\nText("x")', chrome="browser").html)

    def test_chrome_markup_classes(self):  # TC-1 (C5)
        parts = {"ios": {"status", "home"}, "ipados": {"status", "home"}, "android": {"status", "home"},
                 "macos": {"titlebar"}, "windows": {"titlebar"}, "browser": {"browser"}, "none": set()}
        for kind, expected in parts.items():
            html = render('Text("x")', chrome=kind).html
            found = re.findall(r'class="mkd-chrome mkd-chrome--([a-z]+)[^"]*" data-chrome="([a-z0-9]+)"', html)
            self.assertEqual({c for c, _ in found}, expected, kind)
            self.assertTrue(all(k == kind for _, k in found), kind)
        base = stylesheet(["base"])
        for c in ("status", "titlebar", "browser", "home"):
            self.assertIn(f".mkd-chrome--{c}", base)


class AdditionalChromeTests(unittest.TestCase):
    """R-DEV-007 TC-1."""

    def test_additional_kinds(self):  # TC-1 (C1)
        self.assertLessEqual({"gnome", "kde", "win31", "window"}, set(chrome_mod.CHROME_KINDS))
        self.assertNotIn("mkd-chrome", render('Text("x")', chrome="gnome").html)  # the app draws its header bar
        kde = render('Text("x")', chrome="kde", title="Dolphin").html
        self.assertIn('mkd-chrome--titlebar" data-chrome="kde"', kde)
        self.assertIn('mkd-chrome__title">Dolphin<', kde)
        w31 = render('Text("x")', chrome="win31", title="Program Manager").html
        self.assertIn("mkd-chrome__sysmenu", w31)
        self.assertIn('mkd-chrome__title">Program Manager<', w31)
        self.assertEqual(re.findall(r'data-control="(\w+)"', w31), ["min", "max"])
        self.assertEqual(frame_attr(render('Text("x")', pack="gtk").html, "data-chrome"), "gnome")
        self.assertEqual(frame_attr(render('Text("x")', pack="win31").html, "data-chrome"), "win31")

    def test_window_chrome(self):  # TC-1 (C2, V1)
        html = render('Text("x")', pack="aqua", title="Finder").html
        self.assertEqual(frame_attr(html, "data-chrome"), "window")
        self.assertIn('class="mkd-chrome mkd-chrome--titlebar mkd-chrome--window" data-chrome="window"', html)
        self.assertIn('mkd-chrome__title-text">Finder<', html)
        lead = re.search(r'mkd-chrome__lead">(.*?)</span>', html).group(1)
        trail = re.search(r'mkd-chrome__trail">(.*?)</span>', html).group(1)
        self.assertEqual(re.findall(r'data-btn="(\w+)"', lead), ["close", "menu"])
        self.assertEqual(re.findall(r'data-btn="(\w+)"', trail), ["help", "min", "max", "zoom", "collapse", "close"])
        self.assertIn('class="mkd-chrome mkd-chrome--statusbar" data-chrome="window"><i data-btn="grow"></i>', html)
        base = stylesheet(["base"], minify=False)
        self.assertIn(".mkd-frame .mkd-chrome--window i { display: none;", base)
        self.assertIn(".mkd-frame .mkd-chrome--statusbar { display: none; }", base)


if __name__ == "__main__":
    unittest.main()
