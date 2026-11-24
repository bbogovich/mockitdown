# Recommended next packs

mockitdown's primary targets are **macOS and iOS apps**, with a heavy emphasis on **web
development**. These are the packs that would add the most value next, in priority order. Each is a
`pack.json` + `pack.css` extending the base pack, like the packs on this site.

## Apple platforms

| Pack | Why |
|---|---|
| **watchOS, visionOS, tvOS forms of `swiftui`** | The same SwiftUI vocabulary on watch faces, spatial windows (glass ornaments, depth) and the focus-driven TV layout. Device forms `watch`, `vision`, `tv` plus their chrome. |
| **`appkit-classic`** | macOS 13–15 (pre–Liquid Glass) for apps that still support older releases, and AppKit-only controls: `NSTableView` with sortable columns, `NSOutlineView`, source lists, inspectors, `NSToolbar` segmented controls, sheets. |
| **`catalyst`** | Mac Catalyst idioms — iPad apps scaled for the Mac — for teams shipping one codebase to both. |

## Web

| Pack | Why |
|---|---|
| **Ant Design (`antd`)** | The most-used enterprise React kit after MUI; dense admin tables, forms and `ProLayout` are a common mockup target. |
| **Fluent UI React v9 (`fluent-web`)** | Microsoft's *web* Fluent 2 differs from WinUI (density, radii, Teams/Office patterns); needed for Office add-ins and Teams apps. |
| **Tailwind Catalyst / Tailwind Plus (`tailwind`)** | The house style of many Tailwind sites; complements shadcn/ui with marketing sections and application shells. |
| **IBM Carbon (`carbon`)** | Widely used in enterprise and government products; distinctive grid, data tables and notifications. |
| **GitHub Primer (`primer`)** | Developer-tool UIs (issues, PRs, code views) are a frequent subject of technical documentation. |
| **Ionic (`ionic`)** | Hybrid mobile apps; its iOS and Material modes map neatly onto device forms. |
| **Vuetify (`vuetify`)** and **PrimeVue / PrimeNG (`prime`)** | The leading component kits for Vue and a popular alternative for Angular. |
| **Chakra UI v3 / Mantine** | Popular React kits for product teams that do not use MUI or shadcn. |
| **Salesforce Lightning (SLDS 2), Atlassian Design System** | Platform-specific kits for teams building on those ecosystems. |

## Beyond kits

- **Flutter** — Material 3 and Cupertino are already covered by the `android` and `swiftui` packs;
  a thin `flutter` pack would only add Flutter's own names.
- **Wireframe sketch style** — a hand-drawn variant of `base` for early concepts.

---

<small style="opacity:.55">You read the whole thing. Thank you. As a reward, three packs that are not in the
menu: [a starship console](eggs/lcars.md), [a green-screen ship computer](eggs/phosphor.md) and
[a holographic heads-up display](eggs/hologram.md).</small>
