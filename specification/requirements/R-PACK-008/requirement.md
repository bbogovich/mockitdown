---
id: R-PACK-008
title: Shipped packs
status: active
version: 0.11.0
rev: 5
page: PACK.1
slot: reqs
order: 8
source: [SRC-2, SRC-4, SRC-5, SRC-6, SRC-7, SRC-18]
realizes: [F-3]
constrained_by: [A-PACK-2]
decisions: [ADR-13]
hash: 05ec55436cf9
refs: [ADR-16, F-14, R-PACK-010, R-PACK-019, R-PACK-022, R-PACK-023, R-PACK-024, R-PACK-025, R-PACK-026, R-PACK-027, R-PACK-028, R-PACK-029]
---

C1: mockitdown MUST ship these packs: `base` (neutral wireframe, the core vocabulary), `swiftui` (SwiftUI on iOS, iPadOS and macOS), `fluent` (Fluent 2 · WinUI 3), `mui` (Material UI v9, React), `angular-material` (Angular Material), `sapui5` (SAPUI5 with the Fiori Horizon theme), `bootstrap` (Bootstrap 5.3), `shadcn` (shadcn/ui), `antd` (Ant Design 5, React), `tailwind` (Tailwind Catalyst, Tailwind Plus), `carbon` (IBM Carbon 11), `primer` (GitHub Primer), `vuetify` (Vuetify 3, Vue), `prime` (PrimeVue 4 / PrimeNG with the Aura theme), `sketch` (hand-drawn wireframe), `android` (Jetpack Compose Material 3), `gtk` (GTK 4 with libadwaita), `qt` (Qt 6 Widgets, Fusion), `avalonia` (Avalonia UI 11, Fluent theme) and `kde-plasma` (KDE Plasma 6, Breeze).
C7: mockitdown MUST ship the retro packs `nls` (Engelbart's NLS, 1968), `xerox-star` (Xerox Star), `lisa` (Lisa Office System), `mac-classic` (Macintosh System 1–6), `win1` (Windows 1.0), `win2` (Windows 2.x), `gsos` (Apple IIgs GS/OS), `nextstep` (NeXTSTEP), `win31` (Windows 3.1.1), `win95` (Windows 95), `macos9` (Mac OS 9, Platinum), `cde` (Solaris CDE), `aqua` (Mac OS X Aqua), `winxp` (Windows XP, Luna) and `vista` (Windows Vista, Aero), and the hidden easter-egg packs `lcars`, `phosphor` and `hologram` (R-PACK-010, ADR-16).
C2: Every shipped pack other than `base` MUST extend `base` directly or indirectly, declare at least one import module, define light and dark tokens, and choose a default device and per-device chrome that match its platform.
C3: The `swiftui` pack MUST be selected by `import SwiftUI`.
C4: Each framework pack SHOULD define elements for as many of its framework's components as practical, under the framework's own names, with `doc` lines and documented `variants`.
C5: Each framework pack MUST map the framework's style modifiers or properties onto attributes its CSS styles (for example a button style onto `variant`), so that the same core elements take on the framework's variants.
C6: The pack's `framework` and `version` keys MUST name the imitated framework and the version whose design it follows.
C8: mockitdown MUST also ship the retro packs `gem` (R-PACK-022), `geos` (R-PACK-023), `amiga` (R-PACK-019), `riscos` (R-PACK-024) and `beos` (R-PACK-025) and the handheld packs `newton` (R-PACK-026), `palm` (R-PACK-027), `wince` (R-PACK-028) and `blackberry` (R-PACK-029), each as its own requirement says.
C9: The Retro group MUST list its packs in this order: `nls`, `xerox-star`, `lisa`, `mac-classic`, `gem`, `win1`, `geos`, `win2`, `amiga`, `gsos`, `nextstep`, `riscos`, `win31`, `win95`, `beos`, `macos9`, `cde`, `aqua`, `winxp`, `vista` (by the year each system first appeared); the Mobile group MUST list `swiftui`, `android`, `newton`, `palm`, `wince`, `blackberry`.
V1: `mockitdown packs` lists the framework and retro identifiers but not the hidden ones; the example site has one page per framework and retro pack, the retro pages listed in chronological order, and one hidden page per easter egg (F-14).
