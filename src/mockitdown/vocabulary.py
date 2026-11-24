"""Modifier vocabulary shared by every pack.

* RENDERED: modifiers the HTML renderer interprets (layout, typography, colour, navigation …).
* IGNORED: behaviour-only SwiftUI modifiers accepted silently so real SwiftUI code can be pasted.

A pack adds attribute-setting modifiers in its ``pack.json`` ``modifiers`` map (for instance
``buttonStyle`` → ``variant``). Any other modifier draws a warning and is ignored.
"""

from __future__ import annotations

RENDERED = frozenset({
    # layout
    "padding", "frame", "offset", "zIndex",
    # typography and colour
    "font", "fontWeight", "bold", "italic", "underline", "strikethrough", "monospaced", "fontDesign",
    "foregroundStyle", "foregroundColor", "background", "tint", "accentColor", "opacity",
    "cornerRadius", "clipShape", "shadow", "border", "fill", "stroke", "multilineTextAlignment",
    "textCase", "imageScale", "resizable", "aspectRatio", "scaledToFit", "scaledToFill", "hidden",
    "lineLimit",
    # semantics
    "id", "ref", "class", "badge", "help", "overlay",
    # navigation and presentation
    "navigationTitle", "navigationSubtitle", "navigationBarTitleDisplayMode", "toolbar", "tabItem",
    "searchable", "alert", "sheet", "confirmationDialog", "popover", "fullScreenCover", "inspector",
    "labelsHidden",
})

IGNORED = frozenset({
    "onTapGesture", "onAppear", "onDisappear", "onChange", "onSubmit", "onDelete", "onMove", "task",
    "refreshable", "animation", "transition", "gesture", "simultaneousGesture", "contentShape",
    "accessibilityLabel", "accessibilityHint", "accessibilityIdentifier", "accessibilityElement",
    "keyboardType", "textContentType", "textInputAutocapitalization", "autocorrectionDisabled",
    "submitLabel", "focused", "environment", "environmentObject", "tag", "symbolRenderingMode",
    "symbolVariant", "listRowInsets", "listRowSeparator", "listSectionSeparator", "listRowBackground",
    "scrollContentBackground", "toolbarBackground", "toolbarColorScheme", "toolbarRole",
    "navigationDestination", "navigationBarBackButtonHidden", "presentationDetents",
    "presentationDragIndicator", "interactiveDismissDisabled", "preferredColorScheme", "statusBarHidden",
    "ignoresSafeArea", "safeAreaInset", "layoutPriority", "fixedSize", "contextMenu", "draggable",
    "dropDestination", "swipeActions", "scrollIndicators", "scrollDisabled", "minimumScaleFactor",
    "allowsTightening", "truncationMode", "kerning", "tracking", "baselineOffset", "contentTransition",
    "sensoryFeedback", "hoverEffect", "focusable", "keyboardShortcut", "dynamicTypeSize",
    "privacySensitive", "redacted", "containerRelativeFrame", "scrollTargetBehavior",
    "scrollTargetLayout", "matchedGeometryEffect", "glassEffect", "backgroundStyle", "compositingGroup",
    "drawingGroup", "blur", "saturation", "brightness", "rotationEffect", "scaleEffect", "mask",
})

#: Import names that select no pack but are legal in pasted Swift code.
NEUTRAL_MODULES = frozenset({"Foundation", "Combine", "Observation", "UIKit", "AppKit", "SwiftData",
                             "Charts", "MapKit", "PhotosUI", "WebKit"})
