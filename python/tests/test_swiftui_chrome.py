"""Multi-platform chrome for SwiftUI (R-DEV-010, IT-21): TC-1 and TC-2 in the Python variant.

The same source renders with the chrome of each form: iOS 26 on a phone, iPadOS 26 on a tablet (and as
a window over a wallpaper with ``windowed``), macOS 26 on a desktop. The markup carries what the clauses
name (status bar items, home indicator, traffic lights, the unified title bar, the sidebar toggle, the
window); the geometry (floating sidebar inset under the lights, the window inset from the frame, the
collapsed stack on a phone) is checked by the gallery's browser test, the look by TC-M1.
"""

import json
import re
import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT, diags, html
from mockitdown import cli, fence

SHARED = ROOT.parent / "shared"
PACK = json.loads((SHARED / "packs" / "swiftui" / "pack.json").read_text(encoding="utf-8"))
CSS = (SHARED / "packs" / "swiftui" / "pack.css").read_text(encoding="utf-8")
BASE_CSS = (SHARED / "packs" / "base" / "pack.css").read_text(encoding="utf-8")

V1 = PACK["elements"]["NavigationSplitView"]["sample"]


def sw(src: str, **kw) -> str:
    return html(src, pack="swiftui", **kw)


def frame_tag(markup: str) -> str:
    return re.search(r'<div class="mkd-frame"[^>]*>', markup).group(0)


class ChromePerFormTests(unittest.TestCase):
    """TC-1, C1, V1: the same split view source at phone, tablet and desktop."""

    def test_phone_has_ios_status_bar_island_and_home_indicator(self):
        out = sw(V1, device="phone")
        self.assertIn('data-chrome="ios"', frame_tag(out))
        status = out[out.index('mkd-chrome--status'):out.index('mkd-screen')]
        self.assertIn(">9:41<", status)
        self.assertIn("mkd-chrome__island", status)
        for icon in ("cellularbars", "wifi", "battery"):
            self.assertIn(f'data-icon="{icon}"', status)
        self.assertIn('mkd-chrome--home" data-chrome="ios"', out)

    def test_tablet_has_ipados_status_bar_with_date_and_percentage_and_home_indicator(self):
        out = sw(V1, device="tablet")
        self.assertIn('data-chrome="ipados"', frame_tag(out))
        self.assertIn("9:41 Mon Nov 23", out)
        self.assertIn('mkd-chrome__pct">100%', out)
        self.assertIn('mkd-chrome--home" data-chrome="ipados"', out)

    def test_desktop_and_wide_have_macos_window(self):
        for device in ("desktop", "wide"):
            out = sw(V1, device=device)
            self.assertIn('data-chrome="macos"', frame_tag(out))
            self.assertEqual(out.count("data-light="), 3)

    def test_sidebar_toggle_in_split_view(self):
        """C3, C6: the split view carries a sidebar toggle button (shown with macOS and iPadOS chrome)."""
        out = sw(V1, device="desktop")
        self.assertIn('class="mkd-split__toggle" role="button" aria-label="Toggle Sidebar">', out)
        self.assertIn('data-icon="sidebar.left"', out)
        self.assertRegex(BASE_CSS, r"\.mkd-split__toggle \{ display: none; \}")
        self.assertIn('[data-chrome="macos"] .mkd-split > .mkd-split__toggle', CSS)
        self.assertIn('[data-chrome="ipados"] .mkd-split > .mkd-split__toggle', CSS)


class MacWindowTests(unittest.TestCase):
    """C2: rounded corners, shadow, 12-point lights; unified title bar or a centred title."""

    def test_window_radius_token_and_lights(self):
        self.assertEqual(PACK["tokens"]["light"]["window-radius"], "16px")
        self.assertIn("border-radius: var(--mkd-window-radius, 16px)", BASE_CSS)
        self.assertIn(".mkd-chrome__lights i { display: block; width: 12px; height: 12px;", BASE_CSS)

    def test_plain_root_has_centred_title(self):
        out = sw('VStack { Text("Hello") }', device="desktop", title="Notes")
        self.assertNotIn("data-titlebar", frame_tag(out))
        self.assertIn('mkd-chrome__title">Notes<', out)

    def test_navigation_stack_with_title_is_unified(self):
        out = sw('NavigationStack { List { Text("a") }.navigationTitle("Inbox")'
                 '.toolbar { Button("Add", systemImage: "plus") {} } }', device="desktop")
        self.assertIn('data-titlebar="unified"', frame_tag(out))
        self.assertIn('mkd-navbar__trailing"><span class="mkd-button"', out)

    def test_navigation_stack_without_title_or_toolbar_keeps_title_bar(self):
        out = sw('NavigationStack { List { Text("a") } }', device="desktop")
        self.assertNotIn("data-titlebar", frame_tag(out))

    def test_split_view_and_sidebar_adaptable_tab_view_are_unified(self):
        self.assertIn('data-titlebar="unified"', frame_tag(sw(V1, device="desktop")))
        tabs = PACK["elements"]["TabView"]["sample"] + ".tabViewStyle(.sidebarAdaptable)"
        self.assertIn('data-titlebar="unified"', frame_tag(sw(tabs, device="desktop")))
        self.assertNotIn("data-titlebar", frame_tag(sw(PACK["elements"]["TabView"]["sample"], device="desktop")))

    def test_plain_root_with_title_and_toolbar_draws_them_in_the_title_bar(self):
        out = sw('VStack { Text("Body") }.navigationTitle("Notes")'
                 '.toolbar { Button("New", systemImage: "square.and.pencil") {} }', device="desktop", title="App")
        self.assertIn('data-titlebar="toolbar"', frame_tag(out))
        bar = out[out.index("mkd-chrome--titlebar"):out.index("mkd-screen")]
        self.assertIn('mkd-chrome__title">Notes<', bar)
        self.assertIn('mkd-chrome__toolbar"><span class="mkd-button"', bar)
        self.assertNotIn(">App<", bar)

    def test_title_bar_modes_only_with_macos_chrome(self):
        out = sw('NavigationStack { Text("a").navigationTitle("Inbox") }', device="tablet")
        self.assertNotIn("data-titlebar", frame_tag(out))
        out = sw('NavigationStack { Text("a").navigationTitle("Inbox") }', device="tablet", chrome="macos")
        self.assertIn('data-titlebar="unified"', frame_tag(out))

    def test_split_column_toolbar_items_in_its_header(self):
        out = sw('NavigationSplitView { List { Text("a") } } detail: { Text("d").navigationTitle("Doc")'
                 '.toolbar { Button("Share", systemImage: "square.and.arrow.up") {} } }', device="desktop")
        self.assertRegex(out, r'mkd-split__header"><span class="mkd-split__title">Doc</span>'
                              r'<span class="mkd-split__toolbar"><span class="mkd-button"')


class FloatingSidebarTests(unittest.TestCase):
    """C3, C6: the floating sidebar with macOS and iPadOS chrome (rules in the swiftui pack)."""

    def test_floating_sidebar_rules(self):
        self.assertIn('.mkd-frame[data-chrome="macos"] .mkd-split > .mkd-split__col[data-col="sidebar"]', CSS)
        self.assertIn('.mkd-frame[data-chrome="ipados"] .mkd-split > .mkd-split__col[data-col="sidebar"]', CSS)


class AdaptationTests(unittest.TestCase):
    """C5: split view collapses on a phone; sidebarAdaptable; Form automatic."""

    def test_split_view_collapses_on_a_phone(self):
        self.assertIn('.mkd-frame[data-device^="phone"] .mkd-split > .mkd-split__col:not([data-col="sidebar"])', CSS)

    def test_form_defaults_to_automatic(self):
        self.assertEqual(PACK["elements"]["Form"]["defaults"]["variant"], "automatic")
        out = sw(PACK["elements"]["Form"]["sample"], device="desktop")
        self.assertIn('class="mkd-form" data-el="Form" data-variant="automatic"', out)
        self.assertIn('.mkd-frame:is([data-device="desktop"], [data-device="wide"]) .mkd-form[data-variant="automatic"]',
                      CSS)


class WindowedTests(unittest.TestCase):
    """TC-2, C4: the windowed iPad app — option, fence attribute, @Screen, CLI."""

    def test_windowed_tablet_draws_the_window_lights(self):
        out = sw(V1, device="tablet", windowed=True)
        frame = frame_tag(out)
        self.assertIn('data-chrome="ipados"', frame)
        self.assertIn('data-windowed="true"', frame)
        self.assertIn('<div class="mkd-chrome mkd-chrome--lights" data-chrome="ipados"><span class="mkd-chrome__lights">'
                      '<i data-light="close"></i><i data-light="min"></i><i data-light="max"></i></span></div>', out)
        self.assertIn("--mkd-wallpaper", BASE_CSS)

    def test_not_windowed_by_default(self):
        self.assertNotIn("data-windowed", frame_tag(sw(V1, device="tablet")))
        self.assertNotIn("data-windowed", frame_tag(sw(V1, device="tablet", windowed=False)))

    def test_screen_attribute(self):
        out = sw("@Screen(windowed: true)\n" + V1, device="tablet")
        self.assertIn('data-windowed="true"', frame_tag(out))
        out = sw("@Screen(windowed: true)\n" + V1, device="tablet", windowed=False)
        self.assertNotIn("data-windowed", frame_tag(out))

    def test_fence_attribute(self):
        out = fence.format(V1, "mockitdown", "mockitdown", {"pack": "swiftui", "device": "tablet", "windowed": "true"},
                           None)
        self.assertIn('data-windowed="true"', out)

    def test_cli_flag(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "a.mockitdown"
            src.write_text("import SwiftUI\n" + V1, encoding="utf-8")
            out = Path(tmp) / "a.html"
            self.assertEqual(cli.main(["render", str(src), "--device", "tablet", "--windowed", "-o", str(out)]), 0)
            self.assertIn('data-windowed="true"', out.read_text(encoding="utf-8"))

    def test_windowed_needs_ipados_chrome(self):
        msgs = diags(V1, pack="swiftui", device="desktop", windowed=True)
        self.assertTrue(any("windowed needs iPadOS chrome" in m for m in msgs), msgs)
        self.assertNotIn("data-windowed", frame_tag(sw(V1, device="phone", windowed=False)))


if __name__ == "__main__":
    unittest.main()
