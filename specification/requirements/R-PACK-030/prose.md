**Requirement.** The example site is the User guide (formerly "Demo"). It opens with an Installation
page for both variants — the Python package in a Zensical or MkDocs site, and the web components in
a plain HTML page — with tables of every extension option and fence attribute, and says where the
import map is defined in each integration. The Custom components page shows the import map, page
library blocks, qualified library names and templates with slots.

**Rationale.** The developer found terms used but never defined (where `import_paths` was set, how to
use a component from the same page). The option and attribute tables are tested against the code so
they cannot fall behind it; the published URL stays `/demos/` so existing links keep working.

**Verification.** TC-1 and TC-2 automated; TC-M1 a reading of every User guide page.


**Re-checked at specification 0.12.12.** Re-read after the clarification records of the items it cites (#81), which closed the suspect citations left by the test-case backfills (#54 to #60) and the SRC-19 import map (0.12.0). No obligation it rests on changed, and none of its clauses is altered.
