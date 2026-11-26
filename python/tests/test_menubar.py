"""The macOS menu bar (R-DEV-009, IT-22): TC-1 and TC-2 in the Python variant.

``menubar`` draws the menu bar above a macOS window: the Apple glyph, the bold application name, the
standard menus merged with ``.commands``, the status items and the fixed clock; a title (or ``.open()``)
draws that menu open as a dropdown. The geometry (the window 24 points below the frame's top, the dropdown
under its title, over the window) is checked by the gallery's browser test, the look by TC-M1.
"""

import json
import re
import tempfile
import unittest
from pathlib import Path

from tests.helpers import ROOT, diags, html
from mockitdown import cli, fence

SHARED = ROOT.parent / "shared"
BASE_CSS = (SHARED / "packs" / "base" / "pack.css").read_text(encoding="utf-8")
BASE = json.loads((SHARED / "packs" / "base" / "pack.json").read_text(encoding="utf-8"))
SWIFTUI = json.loads((SHARED / "packs" / "swiftui" / "pack.json").read_text(encoding="utf-8"))

SPLIT = ('NavigationSplitView {\n  List {\n    Label("Inbox", systemImage: "tray")\n  }.navigationTitle("Mail")\n'
         '} detail: {\n  Text("Select a message")\n}')
V1 = SPLIT + ('\n.commands {\n  CommandMenu("Shapes") {\n'
              '    Button("Circle").keyboardShortcut("c", modifiers: [.shift, .command])\n  }\n}')


def sw(src: str, **kw) -> str:
    kw.setdefault("device", "desktop")
    return html(src, pack="swiftui", **kw)


def frame_tag(markup: str) -> str:
    return re.search(r'<div class="mkd-frame"[^>]*>', markup).group(0)


def bar(markup: str) -> str:
    """The menu bar's markup (up to the window)."""
    return markup[markup.index('<div class="mkd-menubar"'):markup.index('<div class="mkd-window"')]


def titles(markup: str) -> list[str]:
    return re.findall(r'<span class="mkd-menubar__title">([^<]*)</span>', bar(markup))


def dropdown(markup: str) -> str:
    b = bar(markup)
    return b[b.index('<span class="mkd-menubar__dropdown"'):]


def rows(markup: str) -> list[tuple[str, str]]:
    """(label, shortcut) of the open menu's top-level rows, separators as ("-", "")."""
    out = []
    for m in re.finditer(r'<span class="mkd-menubar__(item|sep)"[^>]*>(.*?)(?=<span class="mkd-menubar__(?:item|sep)"|$)',
                         dropdown(markup)):
        if m.group(1) == "sep":
            out.append(("-", ""))
            continue
        label = re.search(r'mkd-menubar__label">([^<]*)<', m.group(2)).group(1)
        key = re.search(r'mkd-menubar__key">([^<]*)<', m.group(2))
        out.append((label, key.group(1) if key else ""))
    return out


class OptionTests(unittest.TestCase):
    """C1, C4: the option, its values and its spellings; the application name."""

    def test_off_by_default(self):
        out = sw(SPLIT)
        self.assertNotIn("mkd-menubar", out)
        self.assertNotIn("data-menubar", frame_tag(out))
        self.assertNotIn("mkd-window", out)
        self.assertNotIn("mkd-menubar", sw(SPLIT, menubar=False))
        self.assertNotIn("mkd-menubar", sw(SPLIT, menubar="false"))

    def test_true_draws_the_bar_with_no_menu_open(self):
        for value in (True, "true", ""):
            out = sw(SPLIT, menubar=value)
            self.assertIn('data-menubar="true"', frame_tag(out))
            self.assertIn('<div class="mkd-menubar" role="menubar">', out)
            self.assertNotIn("mkd-menubar__dropdown", out)

    def test_title_opens_that_menu(self):
        out = sw(SPLIT, menubar="Edit")
        self.assertIn('<span class="mkd-menubar__menu" data-open="true"><span class="mkd-menubar__title">Edit</span>', out)
        self.assertEqual(out.count('data-open="true"'), 1)
        self.assertEqual(rows(out)[0], ("Undo", "⌘Z"))

    def test_screen_attribute(self):
        out = sw('@Screen(app: "Notes", menubar: "File")\n' + SPLIT)
        self.assertEqual(titles(out)[0], "Notes")
        self.assertEqual(rows(out)[0], ("New", "⌘N"))
        self.assertNotIn("mkd-menubar", sw('@Screen(menubar: true)\n' + SPLIT, menubar=False))
        self.assertIn("mkd-menubar", sw('@Screen(menubar: true)\n' + SPLIT))

    def test_fence_attributes(self):
        out = fence.format(SPLIT, "mockitdown", "mockitdown",
                           {"pack": "swiftui", "device": "desktop", "menubar": "File", "app": "Mail"}, None)
        self.assertIn('data-menubar="true"', out)
        self.assertIn('<span class="mkd-menubar__title">Mail</span>', out)
        self.assertIn('data-open="true"><span class="mkd-menubar__title">File<', out)

    def test_cli_flags(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "a.mockitdown"
            src.write_text("import SwiftUI\n" + SPLIT, encoding="utf-8")
            out = Path(tmp) / "a.html"
            self.assertEqual(cli.main(["render", str(src), "--device", "desktop", "--menubar", "--app", "Mail",
                                       "-o", str(out)]), 0)
            text = out.read_text(encoding="utf-8")
            self.assertIn('data-menubar="true"', text)
            self.assertIn('<span class="mkd-menubar__title">Mail</span>', text)
            self.assertNotIn("mkd-menubar__dropdown", text)
            self.assertEqual(cli.main(["render", str(src), "--device", "desktop", "--menubar", "View",
                                       "-o", str(out)]), 0)
            self.assertIn('data-open="true"><span class="mkd-menubar__title">View<', out.read_text(encoding="utf-8"))

    def test_app_name_defaults_to_the_title_then_app(self):
        self.assertEqual(titles(sw(SPLIT, menubar=True, title="Mail"))[0], "Mail")
        self.assertEqual(titles(sw(SPLIT, menubar=True))[0], "App")
        self.assertEqual(titles(sw(SPLIT, menubar=True, title="Mail", app="Post"))[0], "Post")
        self.assertIn('<span class="mkd-menubar__menu" data-menu="app"><span class="mkd-menubar__title">App</span>',
                      sw(SPLIT, menubar=True))


class BarTests(unittest.TestCase):
    """TC-1, C3, C5, C6, V1: the bar's items in order, the standard menus, the clock."""

    def test_v1_bar_in_order(self):
        out = sw(V1, menubar="File")
        b = bar(out)
        self.assertTrue(b.startswith('<div class="mkd-menubar" role="menubar"><span class="mkd-menubar__apple">'
                                     '<svg class="mkd-icon" data-icon="apple.logo"'), b[:200])
        self.assertEqual(titles(out), ["App", "File", "Edit", "View", "Shapes", "Window", "Help"])
        self.assertIn('<span class="mkd-menubar__gap"></span><span class="mkd-menubar__status">', b)
        status = b[b.index("mkd-menubar__status"):]
        # macOS order: battery, Wi-Fi, Control Center, then the clock
        self.assertLess(status.index('data-icon="battery"'), status.index('data-icon="wifi"'))
        self.assertLess(status.index('data-icon="wifi"'), status.index('data-icon="switch.2"'))
        self.assertIn('<span class="mkd-menubar__clock">Mon Nov 23  9:41 AM</span>', status)
        self.assertEqual(rows(out)[0], ("New", "⌘N"))

    def test_standard_menus(self):
        """C6: the standard items named by the clause."""
        def menu(name):
            return rows(sw(SPLIT, menubar=name, app="Notes"))
        app = menu("Notes")
        for row in (("About Notes", ""), ("Settings…", "⌘,"), ("Hide Notes", "⌘H"), ("Quit Notes", "⌘Q")):
            self.assertIn(row, app)
        file = menu("File")
        for row in (("New", "⌘N"), ("Open…", "⌘O"), ("Close", "⌘W"), ("Save", "⌘S")):
            self.assertIn(row, file)
        edit = menu("Edit")
        for row in (("Undo", "⌘Z"), ("Redo", "⇧⌘Z"), ("Cut", "⌘X"), ("Copy", "⌘C"), ("Paste", "⌘V"),
                    ("Select All", "⌘A")):
            self.assertIn(row, edit)
        self.assertTrue(menu("View"))
        self.assertIn(("Minimize", "⌘M"), menu("Window"))
        self.assertTrue(menu("Help"))

    def test_command_menu_before_window(self):
        out = sw(SPLIT + '\n.commands { CommandMenu("Format") { Button("Bold") {} }\n'
                 'CommandMenu("Shapes") { Button("Circle") {} } }', menubar=True)
        self.assertEqual(titles(out), ["App", "File", "Edit", "View", "Format", "Shapes", "Window", "Help"])

    def test_command_group_replacing_before_after(self):
        src = SPLIT + ('\n.commands {\n'
                       '  CommandGroup(replacing: .newItem) { Button("New Note").keyboardShortcut("n") }\n'
                       '  CommandGroup(before: .saveItem) { Button("Export…") {} }\n'
                       '  CommandGroup(after: .saveItem) { Button("Share…") {} }\n'
                       '}')
        r = rows(sw(src, menubar="File"))
        labels = [x[0] for x in r]
        self.assertEqual(r[0], ("New Note", "⌘N"))
        self.assertNotIn("Open…", labels)
        self.assertLess(labels.index("Export…"), labels.index("Save"))
        self.assertGreater(labels.index("Share…"), labels.index("Save"))

    def test_empty_replacement_leaves_no_double_separator(self):
        out = sw(SPLIT + '\n.commands { CommandGroup(replacing: .newItem) {} }', menubar="File")
        r = rows(out)
        self.assertNotEqual(r[0], ("-", ""))
        self.assertFalse(any(a == b == ("-", "") for a, b in zip(r, r[1:])))

    def test_every_clause_placement_is_known(self):
        for placement in ("appInfo", "appSettings", "newItem", "saveItem", "printItem", "undoRedo", "pasteboard",
                          "textEditing", "sidebar", "toolbar", "windowSize", "windowArrangement", "help"):
            src = SPLIT + f'\n.commands {{ CommandGroup(after: .{placement}) {{ Button("Mine {placement}") {{}} }} }}'
            msgs = diags(src, pack="swiftui", device="desktop", menubar=True)
            self.assertEqual(msgs, [], placement)
            self.assertIn(f"Mine {placement}", _all_menus(src))

    def test_unknown_placement_warns(self):
        src = SPLIT + '\n.commands { CommandGroup(after: .frobnicate) { Button("X") {} } }'
        msgs = diags(src, pack="swiftui", device="desktop", menubar=True)
        self.assertTrue(any("frobnicate" in m and "[chrome]" in m for m in msgs), msgs)

    def test_unknown_title_warns(self):
        msgs = diags(SPLIT, pack="swiftui", device="desktop", menubar="Frobnicate")
        self.assertTrue(any("Frobnicate" in m and "[chrome]" in m for m in msgs), msgs)
        self.assertNotIn("mkd-menubar__dropdown", html(SPLIT, pack="swiftui", device="desktop", menubar="Frobnicate"))

    def test_vocabulary_has_no_unknown_elements_or_modifiers(self):
        self.assertEqual(diags(V1, pack="swiftui", device="desktop", menubar=True), [])
        self.assertEqual(SWIFTUI["elements"]["CommandMenu"]["role"], "menu")
        self.assertIn("CommandGroup", SWIFTUI["elements"])

    def test_commands_on_a_window_group(self):
        out = sw('WindowGroup {\n' + SPLIT + '\n}\n.commands { CommandMenu("Shapes") { Button("Circle") {} } }',
                 menubar=True)
        self.assertIn("Shapes", titles(out))


def _all_menus(src: str) -> str:
    """Every standard and custom menu of ``src`` drawn open, concatenated."""
    out = []
    for name in ("App", "File", "Edit", "View", "Window", "Help"):
        out.append(dropdown(sw(src, menubar=name)))
    return "".join(out)


class OpenMenuTests(unittest.TestCase):
    """TC-1, C7, C8: the dropdown's rows."""

    SRC = SPLIT + ('\n.commands {\n  CommandMenu("Format") {\n'
                   '    Button("Bold").keyboardShortcut("b")\n'
                   '    Button("Strikethrough").keyboardShortcut("x", modifiers: [.command, .control, .option, .shift])\n'
                   '    Divider()\n'
                   '    Toggle("Show Ruler", isOn: true)\n'
                   '    Toggle("Show Grid", isOn: false)\n'
                   '    Button("Unavailable") {}.disabled(true)\n'
                   '    Menu("Font") { Button("Bigger") {} }\n'
                   '  }\n}')

    def test_rows(self):
        out = sw(self.SRC, menubar="Format")
        self.assertEqual(rows(out), [("Bold", "⌘B"), ("Strikethrough", "⌃⌥⇧⌘X"), ("-", ""), ("Show Ruler", ""),
                                     ("Show Grid", ""), ("Unavailable", ""), ("Font", "")])
        d = dropdown(out)
        self.assertIn('<span class="mkd-menubar__dropdown" role="menu">', d)
        self.assertIn('<span class="mkd-menubar__sep" role="separator"></span>', d)
        self.assertRegex(d, r'<span class="mkd-menubar__item" role="menuitem" data-checked="true">'
                            r'<span class="mkd-menubar__check"><svg class="mkd-icon" data-icon="checkmark"')
        self.assertIn('<span class="mkd-menubar__item" role="menuitem"><span class="mkd-menubar__check"></span>'
                      '<span class="mkd-menubar__label">Show Grid<', d)
        self.assertIn('<span class="mkd-menubar__item" role="menuitem" data-state="disabled">', d)
        self.assertRegex(d, r'<span class="mkd-menubar__item" role="menuitem" data-submenu="true">'
                            r'<span class="mkd-menubar__check"></span><span class="mkd-menubar__label">Font</span>'
                            r'<span class="mkd-menubar__chevron"><svg class="mkd-icon" data-icon="chevron.right"')
        self.assertNotIn("Bigger", d)

    def test_title_highlighted_and_dropdown_inside_it(self):
        out = sw(self.SRC, menubar="Format")
        self.assertIn('<span class="mkd-menubar__menu" data-open="true"><span class="mkd-menubar__title">Format</span>'
                      '<span class="mkd-menubar__dropdown" role="menu">', out)

    def test_submenu_chevron_in_a_standard_menu(self):
        self.assertIn('data-submenu="true"', dropdown(sw(SPLIT, menubar="File")))

    def test_open_modifier_and_is_presented(self):
        out = sw(SPLIT + '\n.commands { CommandMenu("Format") { Button("Bold") {} }.open() }', menubar=True)
        self.assertIn('data-open="true"><span class="mkd-menubar__title">Format<', out)
        out = sw(SPLIT + '\n.commands { CommandMenu("Format", isPresented: true) { Button("Bold") {} } }', menubar=True)
        self.assertIn('data-open="true"><span class="mkd-menubar__title">Format<', out)

    def test_open_submenu_opens_its_menu_and_cascades(self):
        out = sw(SPLIT + '\n.commands { CommandMenu("Format") { Button("Bold") {}\n'
                 'Menu("Font") { Button("Bigger") {} }.open() } }', menubar=True)
        self.assertIn('data-open="true"><span class="mkd-menubar__title">Format<', out)
        self.assertRegex(out, r'<span class="mkd-menubar__item" role="menuitem" data-submenu="true" data-open="true">'
                              r'.*?<span class="mkd-menubar__dropdown mkd-menubar__dropdown--sub" role="menu">'
                              r'.*?Bigger')

    def test_at_most_one_open_the_first(self):
        out = sw(SPLIT + '\n.commands { CommandMenu("Format") { Button("Bold") {} }.open()\n'
                 'CommandMenu("Shapes") { Button("Circle") {} }.open() }', menubar="Shapes")
        self.assertEqual(out.count('class="mkd-menubar__menu" data-open="true"'), 1)
        self.assertIn('data-open="true"><span class="mkd-menubar__title">Format<', out)

    def test_open_without_menubar_draws_nothing(self):
        out = sw(SPLIT + '\n.commands { CommandMenu("Format") { Button("Bold") {} }.open() }')
        self.assertNotIn("mkd-menubar", out)


class ChromeTests(unittest.TestCase):
    """TC-2, C2, C9: macOS only; the window under the bar keeps its form."""

    def test_menubar_needs_macos_chrome(self):
        msgs = diags(SPLIT, pack="swiftui", device="phone", menubar=True)
        self.assertTrue(any(m.startswith("warning [chrome]") and m.endswith(": menubar needs macOS chrome") for m in msgs), msgs)
        out = html(SPLIT, pack="swiftui", device="phone", menubar=True)
        self.assertNotIn("mkd-menubar", out)
        self.assertNotIn("data-menubar", frame_tag(out))

    def test_macos_chrome_on_another_pack(self):
        out = html('VStack { Text("Hi") }', device="desktop", chrome="macos", menubar=True)
        self.assertIn('data-menubar="true"', frame_tag(out))

    def test_window_wraps_the_window_chrome_and_screen(self):
        out = sw(SPLIT, menubar=True)
        self.assertIn('data-chrome="macos" data-titlebar="unified" data-menubar="true"', frame_tag(out))
        win = out[out.index('<div class="mkd-window"'):]
        self.assertTrue(win.startswith('<div class="mkd-window" data-titlebar="unified">'
                                       '<div class="mkd-chrome mkd-chrome--titlebar" data-chrome="macos">'), win[:200])
        self.assertIn('<div class="mkd-screen">', win)

    def test_window_form_rules(self):
        """C9: the bar 24 points tall over the frame; the window's radius and shadow move to .mkd-window."""
        self.assertRegex(BASE_CSS, r"\.mkd-frame \.mkd-menubar \{[^}]*height: 24px;[^}]*background: var\(--mkd-menubar-bg\)")
        self.assertRegex(BASE_CSS, r"\.mkd-frame \.mkd-window \{[^}]*border-radius: var\(--mkd-window-radius, 16px\)")
        self.assertIn(':is(.mkd-frame, .mkd-window)[data-titlebar="unified"] > .mkd-chrome--titlebar', BASE_CSS)
        for mode in ("light", "dark"):
            self.assertIn("menubar-bg", BASE["tokens"][mode])


if __name__ == "__main__":
    unittest.main()
