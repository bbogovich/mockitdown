"""Built-in icon set: 24×24 line glyphs drawn for mockitdown, with aliases for the icon names used
by SF Symbols, Material Symbols, Fluent UI System Icons and SAP icons.

Icons are emitted as inline SVG using ``currentColor``; a pack styles them through the
``--mkd-icon-stroke`` token. The glyphs are original drawings (no third-party icon font is
bundled), so names map to the closest glyph rather than to an exact copy of the framework icon.
"""

from __future__ import annotations

import re

_F = ' fill="currentColor" stroke="none"'

ICONS: dict[str, str] = {
    "search": '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    "house": '<path d="M3.5 11L12 3.5l8.5 7.5"/><path d="M5.5 9.5V20.5h4.5v-6h4v6h4.5V9.5"/>',
    "gear": ('<circle cx="12" cy="12" r="3"/><path d="M12 2.8l1.7 2.4 2.9-.7.7 2.9 2.4 1.7-1.4 2.6 1.4 2.6'
             '-2.4 1.7-.7 2.9-2.9-.7L12 21.2l-1.7-2.4-2.9.7-.7-2.9-2.4-1.7 1.4-2.6-1.4-2.6 2.4-1.7.7-2.9'
             ' 2.9.7z"/>'),
    "person": '<circle cx="12" cy="8" r="4"/><path d="M4 20.5c0-4.2 3.6-6.5 8-6.5s8 2.3 8 6.5"/>',
    "person.circle": ('<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="10" r="3.2"/>'
                      '<path d="M6.3 18.3c1.4-2.1 3.4-3.2 5.7-3.2s4.3 1.1 5.7 3.2"/>'),
    "person.2": ('<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c0-3.6 2.9-5.7 6.5-5.7s6.5 2.1 6.5 5.7"/>'
                 '<path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 14.5c2.4.6 4 2.5 4 5.5"/>'),
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "minus": '<path d="M5 12h14"/>',
    "xmark": '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    "checkmark": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "chevron.right": '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    "chevron.left": '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    "chevron.up": '<path d="M5.5 14.5L12 8l6.5 6.5"/>',
    "chevron.down": '<path d="M5.5 9.5L12 16l6.5-6.5"/>',
    "chevron.up.down": '<path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4"/>',
    "arrow.left": '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>',
    "arrow.right": '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    "arrow.up": '<path d="M12 19.5v-15M6 10.5l6-6 6 6"/>',
    "arrow.down": '<path d="M12 4.5v15M6 13.5l6 6 6-6"/>',
    "arrow.clockwise": '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4v4.5H15"/>',
    "arrow.up.arrow.down": '<path d="M7.5 4v16M4 7.5L7.5 4 11 7.5M16.5 20V4M13 16.5l3.5 3.5 3.5-3.5"/>',
    "arrow.down.to.line": '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M4.5 20h15"/>',
    "arrow.up.to.line": '<path d="M12 20V9M7.5 13.5L12 9l4.5 4.5M4.5 4h15"/>',
    "arrowshape.turn.up.left": '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v4.5"/>',
    "ellipsis": f'<circle cx="5.5" cy="12" r="1.6"{_F}/><circle cx="12" cy="12" r="1.6"{_F}/>'
                f'<circle cx="18.5" cy="12" r="1.6"{_F}/>',
    "ellipsis.vertical": f'<circle cx="12" cy="5.5" r="1.6"{_F}/><circle cx="12" cy="12" r="1.6"{_F}/>'
                         f'<circle cx="12" cy="18.5" r="1.6"{_F}/>',
    "line.3.horizontal": '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    "line.3.horizontal.decrease": '<path d="M4 6.5h16M7 12h10M10 17.5h4"/>',
    "list.bullet": (f'<circle cx="5" cy="6.5" r="1.3"{_F}/><circle cx="5" cy="12" r="1.3"{_F}/>'
                    f'<circle cx="5" cy="17.5" r="1.3"{_F}/><path d="M9 6.5h11M9 12h11M9 17.5h11"/>'),
    "square.grid.2x2": ('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" '
                        'height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/>'
                        '<rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'),
    "square.grid.3x3": "".join(f'<circle cx="{x}" cy="{y}" r="1.6"{_F}/>' for y in (6, 12, 18) for x in (6, 12, 18)),
    "trash": '<path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 13.5h10L18 7"/><path d="M10 11v6M14 11v6"/>',
    "pencil": '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    "square.and.pencil": ('<path d="M11 4.5H5.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V13"/>'
                          '<path d="M18.5 3.5l2 2-8.5 8.5-3 1 1-3z"/>'),
    "square.and.arrow.up": '<path d="M12 3.5v11.5M8 7.5l4-4 4 4"/><path d="M8.5 10.5h-2.5v10h12v-10h-2.5"/>',
    "bell": '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 1.8H4.2z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    "envelope": '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.8 7L12 13l8.2-6"/>',
    "tray": '<path d="M3 13l2.5-8h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
    "paperplane": '<path d="M21 3L3 10.5l7 2.5 2.5 7.5z"/><path d="M10 13L21 3"/>',
    "archivebox": '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
    "calendar": '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    "clock": '<circle cx="12" cy="12" r="8.8"/><path d="M12 7v5l3.5 2"/>',
    "star": '<path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    "star.fill": '<path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"'
                 ' fill="currentColor"/>',
    "heart": '<path d="M12 20s-8-4.7-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.3 12 20 12 20z"/>',
    "heart.fill": '<path d="M12 20s-8-4.7-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.3 12 20 12 20z"'
                  ' fill="currentColor"/>',
    "bookmark": '<path d="M6.5 3.5h11v17l-5.5-3.8-5.5 3.8z"/>',
    "folder": ('<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15'
               'A1.5 1.5 0 0 1 3 18.5z"/>'),
    "doc": '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    "doc.on.doc": ('<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V4.5A1.5 1.5 0 0 0 14.5 3h-9'
                   'A1.5 1.5 0 0 0 4 4.5v11A1.5 1.5 0 0 0 5.5 17H8"/>'),
    "photo": '<rect x="3" y="4.5" width="18" height="15" rx="2"/><circle cx="8.5" cy="9.5" r="1.7"/>'
             '<path d="M3.5 17l5-5 4 4 3-3 5 5"/>',
    "camera": ('<path d="M4 7.5h3.5L9 5h6l1.5 2.5H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 '
               '1-1z"/><circle cx="12" cy="13" r="3.5"/>'),
    "video": '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3"/>',
    "phone": ('<path d="M5 3.5h3.5l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.5 1.5C10.6 20.5 3.5 '
              '13.4 3.5 5A1.5 1.5 0 0 1 5 3.5z"/>'),
    "message": '<path d="M4 5h16v11H9.5L4 20z"/>',
    "mappin": '<path d="M12 21s-6.5-6.3-6.5-11.5a6.5 6.5 0 0 1 13 0C18.5 14.7 12 21 12 21z"/>'
              '<circle cx="12" cy="9.5" r="2.3"/>',
    "map": '<path d="M3 6.5l6-2.5 6 2.5 6-2.5v14l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v14M15 6.5v14"/>',
    "lock": '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    "lock.open": '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 7.7-1.5"/>',
    "key": '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l2.5 2.5M14.5 8.5l2 2"/>',
    "shield": '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>',
    "globe": ('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9'
              'c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z"/>'),
    "cart": '<path d="M3 4h2.5l2.2 11h10.6l2-8H6.5"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>',
    "bag": '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    "creditcard": '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    "dollarsign": ('<path d="M12 3v18M16.5 7c-.5-1.5-2.2-2.5-4.5-2.5-2.5 0-4.3 1.3-4.3 3.2 0 4.4 9.1 2.4 9.1 7 '
                   '0 2-2 3.3-4.8 3.3-2.5 0-4.3-1-4.8-2.8"/>'),
    "building": '<path d="M4 21V5l8-2v18M12 8h8v13M2.5 21h19M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/>',
    "briefcase": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
    "cube": '<path d="M12 2.5l8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5z"/><path d="M3.5 7.25L12 12l8.5-4.75M12 12v9.5"/>',
    "truck": ('<path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/>'
              '<circle cx="17" cy="17.5" r="1.8"/>'),
    "airplane": ('<path d="M21 15.5v-2l-8-5V3.5a1 1 0 0 0-2 0v5l-8 5v2l8-2.5v5L9 19.5V21l3-1 3 1v-1.5L13 18'
                 'v-5z"/>'),
    "play": f'<path d="M8 5v14l11-7z"{_F}/>',
    "pause": f'<rect x="6.5" y="5" width="3.5" height="14" rx="1"{_F}/><rect x="14" y="5" width="3.5" '
             f'height="14" rx="1"{_F}/>',
    "stop": f'<rect x="6" y="6" width="12" height="12" rx="1.5"{_F}/>',
    "forward": f'<path d="M4 6v12l8-6zM12 6v12l8-6z"{_F}/>',
    "backward": f'<path d="M20 6v12l-8-6zM12 6v12l-8-6z"{_F}/>',
    "mic": '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    "speaker": '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    "music.note": '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    "wifi": (f'<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.5 15.5a5 5 0 0 1 7 0"/>'
             f'<circle cx="12" cy="18.8" r="1.3"{_F}/>'),
    "battery": f'<rect x="2.5" y="7" width="17" height="10" rx="2.5"/><rect x="4.5" y="9" width="11" height="6" '
               f'rx="1"{_F}/><path d="M21.5 10.5v3"/>',
    "cellularbars": (f'<rect x="3" y="14" width="3" height="5" rx=".8"{_F}/><rect x="8" y="11" width="3" '
                     f'height="8" rx=".8"{_F}/><rect x="13" y="8" width="3" height="11" rx=".8"{_F}/>'
                     f'<rect x="18" y="5" width="3" height="14" rx=".8"{_F}/>'),
    "info.circle": f'<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.8" r="1.1"{_F}/>',
    "exclamationmark.triangle": (f'<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v5"/>'
                                 f'<circle cx="12" cy="17.5" r="1.1"{_F}/>'),
    "exclamationmark.circle": f'<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.3" r="1.1"{_F}/>',
    "xmark.circle": '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    "checkmark.circle": '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.8L16.2 9.5"/>',
    "plus.circle": '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    "minus.circle": '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    "questionmark.circle": (f'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1'
                            f' 1.7v.5"/><circle cx="12" cy="16.8" r="1.1"{_F}/>'),
    "circle": '<circle cx="12" cy="12" r="8.5"/>',
    "circle.fill": f'<circle cx="12" cy="12" r="8.5"{_F}/>',
    "square": '<rect x="4" y="4" width="16" height="16" rx="2.5"/>',
    "cloud": '<path d="M7 18.5h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18.5z"/>',
    "link": ('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 '
             '5.7l1-1"/>'),
    "paperclip": ('<path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7-7L13 4.5a3.3 3.3 0 0 1 4.7 4.7L10 17a1.7 1.7 0 0 1-2.4-'
                  '2.4l7-7"/>'),
    "tag": '<path d="M3.5 12V4h8l9 9-8 8z"/><circle cx="7.8" cy="8.2" r="1.3"/>',
    "flag": '<path d="M5.5 21V4M5.5 4h11l-2 4 2 4h-11"/>',
    "eye": '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "eye.slash": '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
                 '<path d="M4 4l16 16"/>',
    "chart.bar": '<path d="M5 20V12M10 20V5M15 20v-7M20 20V9"/>',
    "chart.line": '<path d="M3 17l5-5 4 3 8-8"/><path d="M15 7h5v5"/>',
    "chart.pie": '<path d="M12 3v9h9a9 9 0 1 1-9-9z"/><path d="M15 2.5A8 8 0 0 1 21.5 9H15z"/>',
    "gauge": '<path d="M3.8 17a8.5 8.5 0 1 1 16.4 0"/><path d="M12 15.5l4-5"/>',
    "bolt": '<path d="M13 2.5L5 13.5h6L10 21.5l8-11h-6z"/>',
    "sun": ('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8'
            'M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'),
    "moon": '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
    "lightbulb": '<path d="M9 18h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.5 1.6-1.5 2.5h-4c0-.9-.6-1.8-1.5-2.5z"/>',
    "printer": '<path d="M7 9V3.5h10V9M7 17H4v-7.5h16V17h-3"/><path d="M7 14h10v7H7z"/>',
    "sidebar.left": '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M9 4.5v15"/>',
    "slider.horizontal.3": ('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/>'
                            '<circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
    "book": '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3"/>',
    "power": '<path d="M12 3v9"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/>',
    "rectangle.portrait.and.arrow.right": '<path d="M14 4H5v16h9M10 12h11M17.5 8.5L21 12l-3.5 3.5"/>',
    "hand.thumbsup": ('<path d="M7 10.5v10H4v-10zM7 10.5l4-7.5c1.5 0 2.5 1 2.5 2.5V9h5a2 2 0 0 1 2 2.3l-1.2 7.4'
                      'a2 2 0 0 1-2 1.8H7"/>'),
    "sparkles": ('<path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z"/>'
                 '<path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>'),
    "number": '<path d="M5 9h15M4 15h15M10 3.5L8 20.5M16 3.5L14 20.5"/>',
    "wrench": '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/>',
    "app": '<rect x="4" y="4" width="16" height="16" rx="4"/>',
    "questionmark": '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/>',
}

ALIASES: dict[str, str] = {
    # SF Symbols
    "magnifyingglass": "search", "house.fill": "house", "gearshape": "gear", "gearshape.fill": "gear",
    "person.fill": "person", "person.crop.circle": "person.circle", "person.crop.circle.fill": "person.circle",
    "person.circle.fill": "person.circle", "person.3": "person.2", "person.2.fill": "person.2",
    "plus.circle.fill": "plus.circle", "xmark.circle.fill": "xmark.circle",
    "checkmark.circle.fill": "checkmark.circle", "info.circle.fill": "info.circle",
    "exclamationmark.triangle.fill": "exclamationmark.triangle", "trash.fill": "trash",
    "bell.fill": "bell", "envelope.fill": "envelope", "tray.fill": "tray", "tray.full": "tray",
    "paperplane.fill": "paperplane", "calendar.badge.plus": "calendar", "bookmark.fill": "bookmark",
    "folder.fill": "folder", "doc.text": "doc", "doc.fill": "doc", "photo.fill": "photo",
    "photo.on.rectangle": "photo", "camera.fill": "camera", "phone.fill": "phone",
    "message.fill": "message", "bubble.left": "message", "bubble.left.fill": "message",
    "bubble.left.and.bubble.right": "message", "mappin.and.ellipse": "mappin", "location": "mappin",
    "location.fill": "mappin", "lock.fill": "lock", "cart.fill": "cart", "bag.fill": "bag",
    "creditcard.fill": "creditcard", "building.2": "building", "building.2.fill": "building",
    "shippingbox": "cube", "shippingbox.fill": "cube", "play.fill": "play", "pause.fill": "pause",
    "stop.fill": "stop", "forward.fill": "forward", "backward.fill": "backward", "mic.fill": "mic",
    "speaker.wave.2": "speaker", "speaker.wave.2.fill": "speaker", "wifi": "wifi",
    "battery.100": "battery", "battery.75": "battery", "chart.bar.fill": "chart.bar",
    "chart.xyaxis.line": "chart.line", "chart.pie.fill": "chart.pie", "bolt.fill": "bolt",
    "sun.max": "sun", "sun.max.fill": "sun", "moon.fill": "moon", "lightbulb.fill": "lightbulb",
    "line.horizontal.3": "line.3.horizontal", "line.3.horizontal.decrease.circle": "line.3.horizontal.decrease",
    "ellipsis.circle": "ellipsis", "square.and.arrow.down": "arrow.down.to.line",
    "arrow.counterclockwise": "arrow.clockwise", "arrow.triangle.2.circlepath": "arrow.clockwise",
    "clock.fill": "clock", "clock.arrow.circlepath": "clock", "flag.fill": "flag", "tag.fill": "tag",
    "heart.circle": "heart", "star.circle": "star", "hand.thumbsup.fill": "hand.thumbsup",
    "list.dash": "list.bullet", "rectangle.grid.2x2": "square.grid.2x2", "square.grid.2x2.fill": "square.grid.2x2",
    "slider.horizontal.3": "slider.horizontal.3", "books.vertical": "book", "book.fill": "book",
    "globe.americas": "globe", "network": "globe", "wrench.and.screwdriver": "wrench", "hammer": "wrench",
    "questionmark.circle.fill": "questionmark.circle", "keyboard": "app", "app.fill": "app",
    "film": "video", "video.fill": "video", "music.note.list": "music.note", "cloud.fill": "cloud",
    "icloud": "cloud", "printer.fill": "printer", "eye.fill": "eye", "shield.fill": "shield",
    "checkmark.shield": "shield", "key.fill": "key", "sparkle": "sparkles", "wand.and.stars": "sparkles",
    "dollarsign.circle": "dollarsign", "banknote": "dollarsign", "airplane.departure": "airplane",
    "power.circle": "power", "car": "truck", "box.truck": "truck", "speedometer": "gauge",
    "gauge.with.dots.needle.33percent": "gauge", "square.stack": "doc.on.doc", "chevron.forward": "chevron.right",
    "chevron.backward": "chevron.left", "arrow.backward": "arrow.left", "arrow.forward": "arrow.right",
    "plus.app": "plus", "xmark.square": "xmark", "number.circle": "number", "at": "envelope",
    # Material Symbols (normalized: underscores → dots)
    "home": "house", "settings": "gear", "account.circle": "person.circle", "group": "person.2",
    "people": "person.2", "add": "plus", "remove": "minus", "close": "xmark", "check": "checkmark",
    "done": "checkmark", "chevron.right": "chevron.right", "expand.more": "chevron.down",
    "expand.less": "chevron.up", "unfold.more": "chevron.up.down", "arrow.back": "arrow.left",
    "arrow.forward": "arrow.right", "arrow.upward": "arrow.up", "arrow.downward": "arrow.down",
    "refresh": "arrow.clockwise", "sync": "arrow.clockwise", "more.horiz": "ellipsis",
    "more.vert": "ellipsis.vertical", "menu": "line.3.horizontal", "filter.list": "line.3.horizontal.decrease",
    "filter": "line.3.horizontal.decrease", "sort": "arrow.up.arrow.down", "swap.vert": "arrow.up.arrow.down",
    "delete": "trash", "edit": "pencil", "create": "square.and.pencil", "share": "square.and.arrow.up",
    "ios.share": "square.and.arrow.up", "notifications": "bell", "mail": "envelope", "email": "envelope",
    "inbox": "tray", "send": "paperplane", "archive": "archivebox", "calendar.today": "calendar",
    "calendar.month": "calendar", "event": "calendar", "schedule": "clock", "access.time": "clock",
    "favorite": "heart.fill", "favorite.border": "heart", "star.border": "star", "grade": "star.fill",
    "folder.open": "folder", "description": "doc", "article": "doc", "content.copy": "doc.on.doc",
    "image": "photo", "photo.camera": "camera", "videocam": "video", "call": "phone", "chat": "message",
    "chat.bubble": "message", "forum": "message", "place": "mappin", "location.on": "mappin",
    "lock.outline": "lock", "lock.open": "lock.open", "vpn.key": "key", "security": "shield",
    "language": "globe", "public": "globe", "shopping.cart": "cart", "shopping.bag": "bag",
    "credit.card": "creditcard", "payments": "dollarsign", "attach.money": "dollarsign",
    "business": "building", "apartment": "building", "work": "briefcase", "inventory": "cube",
    "inventory.2": "cube", "local.shipping": "truck", "flight": "airplane", "play.arrow": "play",
    "fast.forward": "forward", "fast.rewind": "backward", "volume.up": "speaker", "music": "music.note",
    "battery.full": "battery", "signal.cellular.alt": "cellularbars", "info": "info.circle",
    "warning": "exclamationmark.triangle", "error": "exclamationmark.circle", "cancel": "xmark.circle",
    "check.circle": "checkmark.circle", "add.circle": "plus.circle", "help": "questionmark.circle",
    "help.outline": "questionmark.circle", "cloud.upload": "arrow.up.to.line", "upload": "arrow.up.to.line",
    "download": "arrow.down.to.line", "file.download": "arrow.down.to.line", "attach.file": "paperclip",
    "label": "tag", "local.offer": "tag", "visibility": "eye", "visibility.off": "eye.slash",
    "bar.chart": "chart.bar", "insights": "chart.line", "show.chart": "chart.line", "trending.up": "chart.line",
    "pie.chart": "chart.pie", "dashboard": "square.grid.2x2", "apps": "square.grid.3x3",
    "grid.view": "square.grid.2x2", "view.list": "list.bullet", "list": "list.bullet",
    "light.mode": "sun", "dark.mode": "moon", "lightbulb": "lightbulb", "print": "printer",
    "logout": "rectangle.portrait.and.arrow.right", "thumb.up": "hand.thumbsup", "auto.awesome": "sparkles",
    "tune": "slider.horizontal.3", "build": "wrench", "menu.book": "book", "power.settings.new": "power",
    "person.add": "person", "person.outline": "person", "bookmark.border": "bookmark", "flag": "flag",
    "speed": "gauge", "bolt": "bolt", "link": "link",
    # Fluent UI System Icons (normalized: CamelCase → dots, size/style suffixes dropped)
    "dismiss": "xmark", "checkmark": "checkmark", "navigation": "line.3.horizontal",
    "more.horizontal": "ellipsis", "more.vertical": "ellipsis.vertical", "alert": "bell",
    "people": "person.2", "people.team": "person.2", "document": "doc", "copy": "doc.on.doc",
    "arrow.sync": "arrow.clockwise", "arrow.download": "arrow.down.to.line", "arrow.upload": "arrow.up.to.line",
    "arrow.reply": "arrowshape.turn.up.left", "arrow.sort": "arrow.up.arrow.down", "filter": "line.3.horizontal.decrease",
    "edit": "pencil", "compose": "square.and.pencil", "mail.inbox": "tray", "send": "paperplane",
    "calendar.ltr": "calendar", "chat": "message", "location": "mappin", "lock.closed": "lock",
    "lock.open": "lock.open", "shield": "shield", "globe": "globe", "cart": "cart", "payment": "creditcard",
    "money": "dollarsign", "building": "building", "box": "cube", "vehicle.truck": "truck",
    "airplane": "airplane", "mic": "mic", "speaker.2": "speaker", "info": "info.circle",
    "warning": "exclamationmark.triangle", "error.circle": "exclamationmark.circle",
    "dismiss.circle": "xmark.circle", "checkmark.circle": "checkmark.circle", "add.circle": "plus.circle",
    "question.circle": "questionmark.circle", "attach": "paperclip", "tag": "tag", "eye": "eye",
    "eye.off": "eye.slash", "data.bar.vertical": "chart.bar", "data.trending": "chart.line",
    "data.pie": "chart.pie", "grid": "square.grid.2x2", "apps": "square.grid.3x3", "text.bullet.list": "list.bullet",
    "weather.sunny": "sun", "weather.moon": "moon", "lightbulb": "lightbulb", "print": "printer",
    "sign.out": "rectangle.portrait.and.arrow.right", "panel.left": "sidebar.left", "options": "slider.horizontal.3",
    "settings": "gear", "person": "person", "person.circle": "person.circle", "home": "house", "star": "star",
    "heart": "heart", "bookmark": "bookmark", "folder": "folder", "image": "photo", "camera": "camera",
    "video": "video", "call": "phone", "clock": "clock", "flag": "flag", "link": "link", "power": "power",
    "sparkle": "sparkles", "wrench": "wrench", "book": "book", "gauge": "gauge", "flash": "bolt",
    "chevron.right": "chevron.right", "chevron.left": "chevron.left", "chevron.down": "chevron.down",
    "chevron.up": "chevron.up", "arrow.left": "arrow.left", "arrow.right": "arrow.right", "add": "plus",
    "subtract": "minus", "delete": "trash", "share": "square.and.arrow.up", "search": "search",
    "thumb.like": "hand.thumbsup", "number.symbol": "number",
    # SAP icons (normalized from sap-icon://name)
    "employee": "person", "customer": "person", "account": "person.circle", "group.2": "person.2",
    "action": "square.and.arrow.up", "sys.enter": "checkmark", "accept": "checkmark", "decline": "xmark",
    "sys.cancel": "xmark.circle", "action.settings": "gear", "message.information": "info.circle",
    "message.warning": "exclamationmark.triangle", "message.error": "exclamationmark.circle",
    "message.success": "checkmark.circle", "navigation.right.arrow": "chevron.right",
    "navigation.left.arrow": "chevron.left", "navigation.down.arrow": "chevron.down",
    "navigation.up.arrow": "chevron.up", "slim.arrow.right": "chevron.right", "slim.arrow.down": "chevron.down",
    "slim.arrow.up": "chevron.up", "slim.arrow.left": "chevron.left", "overflow": "ellipsis",
    "menu2": "line.3.horizontal", "favorite": "star.fill", "unfavorite": "star", "attachment": "paperclip",
    "picture": "photo", "product": "cube", "shipping.status": "truck", "money.bills": "dollarsign",
    "wallet": "creditcard", "locked": "lock", "unlocked": "lock.open", "line.chart": "chart.line",
    "bar.chart": "chart.bar", "pie.chart": "chart.pie", "hint": "lightbulb", "log": "rectangle.portrait.and.arrow.right",
    "notification": "bell", "da": "sparkles", "manager": "person", "home": "house", "inbox": "tray",
    "outbox": "paperplane", "document": "doc", "documents": "doc.on.doc", "add.document": "doc",
    "add.product": "cube", "sort": "arrow.up.arrow.down", "filter": "line.3.horizontal.decrease",
    "excel.attachment": "doc", "pdf.attachment": "doc", "nav.back": "arrow.left", "upload": "arrow.up.to.line",
    "download": "arrow.down.to.line", "synchronize": "arrow.clockwise", "refresh": "arrow.clockwise",
    "edit": "pencil", "delete": "trash", "add": "plus", "less": "minus", "search": "search", "map": "map",
    "map.2": "map", "globe": "globe", "phone": "phone", "email": "envelope", "calendar": "calendar",
    "appointment.2": "calendar", "history": "clock", "time.entry.request": "clock", "factory": "building",
    "building": "building", "cart": "cart", "basket": "bag", "lightbulb": "lightbulb", "print": "printer",
    "grid": "square.grid.2x2", "list": "list.bullet", "show": "eye", "hide": "eye.slash", "flag": "flag",
    "tag": "tag", "chain.link": "link", "settings": "gear", "official.service": "wrench",
    "workflow.tasks": "checkmark.circle", "task": "checkmark.circle", "approvals": "checkmark.circle",
    "travel.expense": "dollarsign", "expense.report": "dollarsign", "sales.order": "doc",
    "activity.items": "list.bullet", "business.objects.experience": "square.grid.2x2",
    "electrocardiogram": "chart.line", "kpi.corporate.performance": "gauge", "performance": "gauge",
    "lab": "sparkles", "warning": "exclamationmark.triangle", "alert": "exclamationmark.triangle",
    "error": "exclamationmark.circle", "information": "info.circle", "question.mark": "questionmark.circle",
    "camera": "camera", "video": "video", "microphone": "mic", "headset": "speaker", "feed": "message",
    "discussion": "message", "discussion.2": "message", "comment": "message", "post": "message",
    "visits": "person.2", "group": "person.2", "folder.blank": "folder", "open.folder": "folder",
    "folder": "folder", "copy": "doc.on.doc", "share": "square.and.arrow.up", "share.2": "square.and.arrow.up",
    "sys.help": "questionmark.circle", "close.command.field": "xmark", "begin": "play", "media.play": "play",
    "media.pause": "pause", "stop": "stop", "palette": "sparkles", "shield": "shield", "key": "key",
    "tools.opportunity": "wrench", "menu": "line.3.horizontal", "full.screen": "square",
}

_DROP = {"16", "20", "24", "28", "32", "48", "regular", "filled", "outline", "outlined", "rounded", "sharp",
         "ic", "fluent", "symbol", "symbols", "light", "color"}


def normalize(name: str) -> str:
    """``ChevronRight24Regular`` → ``chevron.right``; ``more_vert`` → ``more.vert``."""
    s = name.strip()
    if s.lower().startswith("sap-icon://"):
        s = s[len("sap-icon://"):]
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", ".", s)
    s = re.sub(r"(?<=[A-Za-z])(?=\d)", ".", s)
    tokens = [t for t in re.split(r"[._\-\s/]+", s.lower()) if t and t not in _DROP]
    return ".".join(tokens)


def resolve(name: str) -> str | None:
    """The canonical glyph for ``name``, or None when nothing matches."""
    if name in ICONS:
        return name
    if name in ALIASES:
        return ALIASES[name]
    key = normalize(name)
    for cand in (key, key.removesuffix(".fill"), key.removesuffix(".circle"), key.removesuffix(".fill.circle")):
        if cand in ICONS:
            return cand
        if cand in ALIASES:
            return ALIASES[cand]
    head = key.split(".")[0] if key else ""
    if head in ICONS:
        return head
    if head in ALIASES:
        return ALIASES[head]
    return None


def svg(name: str, cls: str = "mkd-icon") -> tuple[str, bool]:
    """``(<svg …>, found)``. An unknown name renders a neutral placeholder glyph."""
    glyph = resolve(name)
    body = ICONS[glyph] if glyph else ICONS["questionmark"]
    return (
        f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" '
        f'stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">{body}</svg>',
        glyph is not None,
    )
