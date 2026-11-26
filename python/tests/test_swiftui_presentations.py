"""SwiftUI presentations and navigation (R-PACK-015, IT-20): TC-1 and TC-2 in the Python variant.

Each element is rendered from the swiftui pack's declared sample (R-PACK-013.C4) at `fit` and the markup
is checked for the parts the clauses name: alert title, message and capsule actions; action-sheet rows
and the cancel action; the popover's arrow and anchor; the sheet's grabber; the lone tab's bar item;
TabView variants; split view columns and titles. The look is the pack's CSS (TC-M1); the boxes at `fit`
(content above the tab bar, a 640 × 360 split view, the detail of `.prominentDetail` spanning the frame)
are checked by the gallery's browser test.
"""

import json
import re
import unittest

from tests.helpers import ROOT, html

PACK = json.loads((ROOT.parent / "shared" / "packs" / "swiftui" / "pack.json").read_text(encoding="utf-8"))
ELEMENTS = PACK["elements"]
CSS = (ROOT.parent / "shared" / "packs" / "swiftui" / "pack.css").read_text(encoding="utf-8")


def sample(name: str, variant: str | None = None, **kw) -> str:
    src = ELEMENTS[name]["sample"] + (f'.variant("{variant}")' if variant else "")
    return html(src, pack="swiftui", device=kw.pop("device", "fit"), **kw)


def sw(src: str, **kw) -> str:
    return html(src, pack="swiftui", device=kw.pop("device", "fit"), **kw)


def part(markup: str, cls: str) -> str:
    """The inner markup of the first ``<div class="cls">`` (balanced on div tags)."""
    start = markup.index(f'<div class="{cls}"')
    depth, i = 0, start
    for m in re.finditer(r"<(/?)div\b", markup[start:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            i = start + m.start()
            break
    return markup[start:i]


def count(markup: str, pattern: str) -> int:
    return len(re.findall(pattern, markup))


class AlertTests(unittest.TestCase):
    """C1, C9: the iOS 26 alert; Button children are its actions."""

    def test_sample_has_title_message_and_role_actions(self):
        out = sample("Alert")
        self.assertIn('data-variant="alert"', out)
        self.assertIn('class="mkd-dialog__title">Delete this photo?<', out)
        self.assertIn('class="mkd-dialog__message">It will be removed', out)
        actions = part(out, "mkd-dialog__actions")
        self.assertIn('data-role="cancel"', actions)
        self.assertIn('data-role="destructive"', actions)

    def test_button_children_render_as_actions(self):
        out = sw('Alert("Save changes?") { Text("Your edits are not saved."); Button("Save"); '
                 'Button("Discard", role: .destructive); Button("Cancel", role: .cancel) }')
        actions = part(out, "mkd-dialog__actions")
        self.assertEqual(count(actions, r'class="mkd-button"'), 3)
        body = part(out, "mkd-dialog__body")
        self.assertIn("Your edits are not saved.", body)
        self.assertNotIn("mkd-button", body)

    def test_actions_closure_still_wins(self):
        out = sw('Alert("T", actions: { Button("OK") }) { Button("Inline") }')
        self.assertIn(">OK<", part(out, "mkd-dialog__actions"))
        self.assertIn(">Inline<", part(out, "mkd-dialog__body"))

    def test_css_capsules_side_by_side_for_two_stacked_for_more(self):
        self.assertIn('"radius-alert": "34px"', (ROOT.parent / "shared" / "packs" / "swiftui" / "pack.json").read_text())
        self.assertIn("border-radius: var(--mkd-radius-alert)", CSS)
        self.assertRegex(CSS, r'\.mkd-dialog__actions:has\(> :nth-child\(3\)\) \{ flex-direction: column;')
        self.assertRegex(CSS, r'\.mkd-dialog__actions > \[data-role="destructive"\] \{ color: var\(--mkd-danger\); \}')


class ConfirmationDialogTests(unittest.TestCase):
    """C2: an action sheet on a phone, alert-style with iPadOS or macOS chrome."""

    def test_sample_is_an_action_sheet_with_rows_and_cancel(self):
        out = sample("ConfirmationDialog")
        self.assertIn('data-kind="action-sheet"', out)
        actions = part(out, "mkd-dialog__actions")
        self.assertEqual(count(actions, r'class="mkd-button"'), 3)
        self.assertIn('data-role="cancel"', actions)

    def test_button_children_render_as_actions(self):
        out = sw('ConfirmationDialog("Delete note?") { Button("Delete", role: .destructive); Button("Cancel", role: .cancel) }')
        self.assertEqual(count(part(out, "mkd-dialog__actions"), r'class="mkd-button"'), 2)
        self.assertNotIn("mkd-dialog__body", out)

    def test_tablet_and_desktop_chrome_take_the_alert_style(self):
        self.assertIn('data-chrome="ipados"', sample("ConfirmationDialog", device="tablet"))
        self.assertIn('.mkd-frame:is([data-chrome="macos"], [data-chrome="ipados"]) .mkd-dialog[data-variant="action-sheet"]', CSS)


class PopoverTests(unittest.TestCase):
    """C3: a glass bubble with an arrow; alone, a placeholder anchor above it."""

    def test_alone_has_anchor_and_arrow(self):
        out = sample("Popover")
        self.assertIn('class="mkd-popover__anchor"><span class="mkd-button" data-placeholder="true"', out)
        self.assertIn('<span class="mkd-dialog__arrow"></span>', out)
        self.assertLess(out.index("mkd-popover__anchor"), out.index('data-el="Popover"'))

    def test_presented_popover_has_an_arrow(self):
        out = sw('Button("Filter").popover(isPresented: true) { Text("Filters") }')
        self.assertIn('<span class="mkd-presented__arrow"></span>', out)


class SheetTests(unittest.TestCase):
    """C4: a sheet from the bottom with a grabber (the pack's ::before), title and content."""

    def test_sample(self):
        out = sample("Sheet")
        self.assertIn('data-kind="sheet"', out)
        self.assertIn(">New event<", out)
        self.assertIn("mkd-dialog__body", out)
        self.assertRegex(CSS, r'\.mkd-layer\[data-kind="sheet"\] > \.mkd-dialog::before \{ content: "";')


class TabTests(unittest.TestCase):
    """C5: a Tab alone is one tab bar item; C6: TabView variants."""

    def test_lone_tab_is_one_selected_item_in_a_bottom_bar(self):
        out = sw('Tab("Search", systemImage: "magnifyingglass") { Text("Find") }')
        self.assertIn('class="mkd-tabs" data-el="Tab"', out)
        self.assertIn('data-placement="bottom"', out)
        self.assertIn('data-standalone="true"', out)
        self.assertEqual(count(out, r'class="mkd-tabs__tab"'), 1)
        self.assertIn('aria-selected="true"', out)
        self.assertIn('data-icon="search"', out)
        self.assertIn('class="mkd-tabs__label">Search<', out)

    def test_tab_in_a_tabview_is_one_of_its_tabs(self):
        out = sample("Tab")
        self.assertEqual(count(out, r'class="mkd-tabs__tab"'), 3)
        self.assertNotIn("data-standalone", out)

    def test_tabview_variants(self):
        for variant in ELEMENTS["TabView"]["variants"]:
            out = sample("TabView", variant)
            self.assertIn(f'data-variant="{variant}"', out, variant)
            self.assertEqual(count(out, r'class="mkd-tabs__tab"'), 3, variant)
            self.assertIn('class="mkd-tabs__panel"', out, variant)
        # the bar in flow at fit (content never under it); page dots; sidebar on tablet and desktop
        self.assertIn('.mkd-frame[data-fit="true"] .mkd-tabs[data-placement="bottom"] > .mkd-tabs__bar { position: static;', CSS)
        self.assertIn('.mkd-tabs[data-variant="sidebarAdaptable"][data-placement] > .mkd-tabs__bar', CSS)


class SplitViewTests(unittest.TestCase):
    """C7, C8, V1: columns from closures or children, column titles, styles."""

    def test_v1_sidebar_with_title_beside_detail(self):
        out = sw('NavigationSplitView { List { Label("Inbox", systemImage: "tray") } .navigationTitle("Mail") } '
                 'detail: { Text("Select a message") }')
        cols = re.findall(r'class="mkd-split__col" data-col="(\w+)"', out)
        self.assertEqual(cols, ["sidebar", "detail"])
        sidebar = part(out, "mkd-split__col")
        self.assertIn('class="mkd-split__title">Mail<', sidebar)
        self.assertIn(">Inbox<", sidebar)
        self.assertIn("Select a message", out[out.index('data-col="detail"'):])

    def test_unlabelled_children_first_sidebar_last_detail(self):
        out = sw('NavigationSplitView { Text("S"); Text("D") }')
        self.assertEqual(re.findall(r'data-col="(\w+)"', out), ["sidebar", "detail"])
        out = sw('NavigationSplitView { Text("S"); Text("C"); Text("D") }')
        self.assertEqual(re.findall(r'data-col="(\w+)"', out), ["sidebar", "content", "detail"])

    def test_content_closure_and_titles(self):
        out = sw('NavigationSplitView { List { Text("Inbox") }.navigationTitle("Mail") } content: '
                 '{ List { Text("Hello") }.navigationTitle("Inbox") } detail: { Text("Hi").navigationTitle("Message") }')
        self.assertEqual(re.findall(r'data-col="(\w+)"', out), ["sidebar", "content", "detail"])
        self.assertEqual(re.findall(r'class="mkd-split__title">(\w+)<', out), ["Mail", "Inbox", "Message"])
        self.assertIn('data-columns="3"', out)

    def test_a_navigation_stack_column_draws_its_own_bar(self):
        out = sw('NavigationSplitView { NavigationStack { List { Text("A") }.navigationTitle("Side") } } detail: { Text("D") }')
        self.assertNotIn("mkd-split__header", out)
        self.assertIn("mkd-navbar", out)

    def test_styles_and_sizes(self):
        for variant in ELEMENTS["NavigationSplitView"]["variants"]:
            self.assertIn(f'data-variant="{variant}"', sample("NavigationSplitView", variant))
        self.assertIn('.mkd-frame[data-fit="true"] .mkd-split { min-width: 640px; min-height: 360px; }', CSS)
        self.assertIn('.mkd-split__col[data-col="sidebar"] { flex: 0 0 320px;', CSS)
        self.assertIn('.mkd-split__col[data-col="sidebar"] { flex-basis: 220px; }', CSS)
        self.assertIn('.mkd-split[data-variant="prominentDetail"] > .mkd-split__col[data-col="sidebar"] {', CSS)


if __name__ == "__main__":
    unittest.main()
