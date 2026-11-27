The `.mkdesign` format of F-20 (SRC-12#s11, SRC-15) and the one module that reads and writes it. The
composite designer uses it for `open` and `toJSON`; a desktop shell uses the same module in its main
process to read, validate and save files, so the two cannot drift apart.

```json
{
  "format": "mockitdown-design",
  "version": 1,
  "name": "Mail app",
  "defaults": { "pack": "fluent", "appearance": "light" },
  "imports": ["components/cards.mockitdown"],
  "sections": [ { "name": "Onboarding", "x": -40, "y": -60, "w": 1400, "h": 900 } ],
  "mockups": [
    { "name": "Sign in", "x": 0, "y": 0,
      "options": { "device": "desktop", "width": 480, "height": 360, "title": "Sign in" },
      "code": "NavigationStack {\n  VStack(spacing: 12) {\n    Text(\"Welcome back\")\n  }\n}\n" }
  ],
  "view": { "zoom": 0.75, "x": 120, "y": 40, "active": "Sign in" }
}
```

A mockup may name its own pack (to compare Fluent and Material side by side); one that names none uses
`defaults.pack`. The file is meant to be read and diffed without the designer, so the key order is fixed,
code is kept byte for byte, and keys written by a newer tool survive a round trip through an older one.
Markdown, HTML and folder export stay in the shell for now.

Re-checked at 0.10.3 together with the items it cites or is cited by (specification audit, #51): the citations are still accurate and no obligation changed.
