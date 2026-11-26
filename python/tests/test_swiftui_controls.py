"""SwiftUI control styles (R-PACK-014, IT-19): TC-1 in the Python variant.

Each variant of ControlGroup, DatePicker, Form, Gauge, List, Picker, Toggle and Button is rendered from
the swiftui pack's declared sample (R-PACK-013.C4) at `fit`, and the markup is checked for the parts
that make the style recognisable (V1). The look itself is the pack's CSS (TC-M1); the gallery's
browser test checks that no row's children overlap (R-REND-013).
"""

import json
import re
import unittest

from tests.helpers import ROOT, html

PACK = json.loads((ROOT.parent / "shared" / "packs" / "swiftui" / "pack.json").read_text(encoding="utf-8"))["elements"]


def sample(name: str, variant: str | None = None, **kw) -> str:
    src = PACK[name]["sample"] + (f'.variant("{variant}")' if variant else "")
    return html(src, pack="swiftui", device=kw.pop("device", "fit"), **kw)


def count(markup: str, pattern: str) -> int:
    return len(re.findall(pattern, markup))


class ControlGroupTests(unittest.TestCase):
    """C1: joined capsule, icon-only capsule, borderless palette, one menu button."""

    def test_automatic_is_the_default_and_joins_its_buttons(self):
        out = sample("ControlGroup")
        self.assertIn('data-variant="automatic"', out)
        self.assertEqual(count(out, r'class="mkd-button"'), 3)
        self.assertIn(">Play<", out)

    def test_navigation_and_palette_keep_the_buttons_with_icons(self):
        for variant in ("navigation", "palette"):
            out = sample("ControlGroup", variant)
            self.assertIn(f'data-variant="{variant}"', out)
            self.assertEqual(count(out, r'class="mkd-button__icon"'), 3, variant)

    def test_menus_are_one_button(self):
        for variant in ("compactMenu", "menu"):
            out = sample("ControlGroup", variant)
            self.assertEqual(count(out, r'class="mkd-toolbar__menu"'), 1, variant)
            self.assertNotIn("mkd-button__label", out)
            self.assertIn("mkd-toolbar__menu-icon", out)  # no label: the ellipsis glyph
            self.assertEqual("mkd-toolbar__menu-chevron" in out, variant == "menu", variant)

    def test_menu_shows_the_group_label(self):
        out = html('ControlGroup("Format") { Button("Bold"); Button("Italic") }.controlGroupStyle(.menu)',
                   pack="swiftui", device="fit")
        self.assertIn('<span class="mkd-toolbar__menu-label">Format</span>', out)
        self.assertNotIn("mkd-toolbar__menu-icon", out)


class DatePickerTests(unittest.TestCase):
    """C2: a selection always, capsules, calendar, wheel, field, stepper field."""

    def test_default_selection_without_selection(self):
        out = html('DatePicker("Starts")', pack="swiftui", device="fit")
        self.assertIn(">Nov 23, 2026<", out)
        self.assertIn(">9:41 AM<", out)

    def test_compact_capsules(self):
        for variant in (None, "automatic", "compact"):
            out = sample("DatePicker", variant)
            self.assertIn('<span class="mkd-datepicker__date">Nov 23, 2026</span>', out)
            self.assertIn('<span class="mkd-datepicker__time">9:41 AM</span>', out)
            self.assertIn(">Starts<", out)

    def test_date_only_and_time_from_selection(self):
        out = html('DatePicker("Due", selection: "2026-03-05", displayedComponents: .date)', pack="swiftui", device="fit")
        self.assertIn(">Mar 5, 2026<", out)
        self.assertNotIn("mkd-datepicker__time", out)
        out = html('DatePicker("Alarm", selection: "2026-03-05T14:05", displayedComponents: .hourAndMinute)',
                   pack="swiftui", device="fit")
        self.assertIn('<span class="mkd-datepicker__time">2:05 PM</span>', out)
        self.assertNotIn("mkd-datepicker__date", out)

    def test_graphical_calendar(self):
        out = sample("DatePicker", "graphical")
        self.assertEqual(count(out, r'class="mkd-calendar__weekday"'), 7)
        self.assertEqual(count(out, r'aria-selected="true"'), 1)
        self.assertIn("November 2026", out)
        self.assertIn("mkd-calendar__nav", out)
        out = html('DatePicker("Starts").datePickerStyle(.graphical)', pack="swiftui", device="fit")
        self.assertEqual(count(out, r'aria-selected="true">23<'), 1)

    def test_wheel_columns_and_band(self):
        out = sample("DatePicker", "wheel")
        self.assertIn('class="mkd-wheel"', out)
        self.assertIn("mkd-wheel__band", out)
        self.assertEqual(count(out, r'class="mkd-wheel__column"'), 4)  # day, hour, minute, AM/PM
        self.assertIn('aria-selected="true">Mon Nov 23<', out)
        self.assertIn('aria-selected="true">41<', out)
        out = html('DatePicker("Due", selection: "2026-11-23", displayedComponents: .date).datePickerStyle(.wheel)',
                   pack="swiftui", device="fit")
        self.assertEqual(count(out, r'class="mkd-wheel__column"'), 3)  # month, day, year
        self.assertIn('aria-selected="true">November<', out)

    def test_field_and_stepper_field(self):
        out = sample("DatePicker", "field")
        self.assertIn("11/23/2026", out)
        self.assertNotIn("mkd-datepicker__stepper", out)
        out = sample("DatePicker", "stepperField")
        self.assertIn("11/23/2026", out)
        self.assertIn("mkd-datepicker__stepper", out)


class FormTests(unittest.TestCase):
    """C3: grouped sections; columns with every row's label."""

    def test_grouped_sections(self):
        for variant in (None, "automatic", "grouped"):
            out = sample("Form", variant)
            self.assertEqual(count(out, r'class="mkd-section"'), 2, variant)
            self.assertIn("mkd-form__row", out)

    def test_columns_names_text_fields(self):
        out = sample("Form", "columns", device="desktop")
        self.assertIn('data-variant="columns"', out)
        self.assertIn('aria-label="Name"', out)  # the title of a filled text field, shown as its column label


class GaugeTests(unittest.TestCase):
    """C4: the six gauge styles."""

    def test_default_is_automatic_linear_with_bounds(self):
        out = sample("Gauge")
        self.assertIn('data-variant="automatic"', out)
        self.assertIn('data-kind="linear"', out)
        self.assertIn('<span class="mkd-progress__min">0</span>', out)
        self.assertIn('<span class="mkd-progress__max">100</span>', out)
        self.assertIn('<span class="mkd-progress__value">72%</span>', out)

    def test_open_and_closed_rings(self):
        out = sample("Gauge", "accessoryCircular")
        self.assertIn('class="mkd-progress__ring" data-open="true"', out)
        self.assertIn('stroke-dasharray="72.00 100"', out)
        out = sample("Gauge", "accessoryCircularCapacity")
        self.assertIn('data-kind="circular"', out)
        self.assertIn("<circle class=\"mkd-progress__bar\"", out)
        self.assertNotIn("data-open", out)

    def test_linear_styles(self):
        out = sample("Gauge", "accessoryLinear")
        self.assertIn('<span class="mkd-progress__marker" style="left:72.0%"></span>', out)
        for variant in ("accessoryLinearCapacity", "linearCapacity"):
            out = sample("Gauge", variant)
            self.assertIn('style="width:72.0%"', out)
            self.assertNotIn("mkd-progress__marker", out)


class ListTests(unittest.TestCase):
    """C5: every list style keeps its sections; the selection is marked."""

    def test_variants(self):
        for variant in PACK["List"]["variants"]:
            out = sample("List", variant)
            self.assertIn(f'data-variant="{variant}"', out)
            self.assertEqual(count(out, r'class="mkd-section"'), 2, variant)

    def test_selection_marks_its_row(self):
        out = sample("List", "sidebar")
        self.assertEqual(count(out, r'data-selected="true"'), 1)
        self.assertRegex(out, r'data-selected="true"><span class="mkd-label"[^>]*>.*?Inbox')


class PickerTests(unittest.TestCase):
    """C6: options from children, a selection, and never an empty box."""

    def test_menu_label_value_chevron(self):
        for variant in (None, "automatic", "menu"):
            out = sample("Picker", variant)
            self.assertIn('<label class="mkd-field__label">Flavor</label>', out)
            self.assertIn(">Vanilla<", out)
            self.assertIn("M8 9.5l4-4", out)  # chevron.up.down

    def test_selection_defaults_to_the_first_option(self):
        out = html('Picker("Flavor") { Text("Chocolate"); Text("Vanilla") }', pack="swiftui", device="fit")
        self.assertIn('<span class="mkd-field__input">Chocolate</span>', out)

    def test_tagged_options(self):
        out = html('Picker("Size", selection: "m") { Text("Small").tag("s"); Text("Medium").tag("m") }',
                   pack="swiftui", device="fit")
        self.assertIn('<span class="mkd-field__input">Medium</span>', out)
        out = html('Picker("Size", selection: "m") { Text("Small").tag("s"); Text("Medium").tag("m") }'
                   '.pickerStyle(.segmented)', pack="swiftui", device="fit")
        self.assertIn('aria-selected="true">Medium<', out)

    def test_segmented_inline_radio_palette(self):
        out = sample("Picker", "segmented")
        self.assertEqual(count(out, r'class="mkd-segmented__item"'), 3)
        self.assertIn('aria-selected="true">Vanilla<', out)
        for variant in ("inline", "radioGroup"):
            out = sample("Picker", variant)
            self.assertEqual(count(out, r'class="mkd-radio"'), 3, variant)
            self.assertEqual(count(out, r'data-checked="true"'), 1, variant)
        out = sample("Picker", "palette")
        self.assertIn('data-variant="palette"', out)
        self.assertEqual(count(out, r'class="mkd-segmented__item"'), 3)

    def test_wheel_and_navigation_link(self):
        out = sample("Picker", "wheel")
        self.assertIn('class="mkd-wheel"', out)
        self.assertIn("mkd-wheel__band", out)
        self.assertEqual(count(out, r'class="mkd-wheel__item"'), 3)
        self.assertIn('aria-selected="true">Vanilla<', out)
        out = sample("Picker", "navigationLink")
        self.assertIn(">Flavor<", out)
        self.assertIn(">Vanilla<", out)

    def test_no_options_shows_label_and_empty_value(self):
        for variant in PACK["Picker"]["variants"]:
            out = html(f'Picker("Flavor").pickerStyle(.{variant})', pack="swiftui", device="fit")
            self.assertIn(">Flavor<", out, variant)
            self.assertIn('class="mkd-select', out, variant)


class ToggleAndButtonTests(unittest.TestCase):
    """C7, C8."""

    def test_toggle_styles(self):
        for variant in (None, "automatic", "switch"):
            out = sample("Toggle", variant)
            self.assertIn('role="switch"', out)
            self.assertIn('data-on="true"', out)
        self.assertIn('data-pressed="true"', sample("Toggle", "button"))
        self.assertIn('class="mkd-checkbox"', sample("Toggle", "checkbox"))

    def test_glass_buttons(self):
        for variant in ("glass", "glassProminent"):
            self.assertIn(f'data-variant="{variant}"', sample("Button", variant))


if __name__ == "__main__":
    unittest.main()
