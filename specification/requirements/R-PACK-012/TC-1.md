---
id: TC-1
title: Header tabs of both sites
verifies: [C6, C8]
---

Python test (`test_site_nav.py`): the top-level `nav` entries of `python/examples/site/mkdocs.yml` are
Demo, Gallery, Definition, Specification, Implementation and Reference in that order, Gallery being the
absolute URL `https://bbogovich.github.io/mockitdown/gallery/`, with `navigation.tabs` and
`navigation.tabs.sticky` enabled. The published-site test of the Pages workflow (R-WEB-004.TC-9, step 5)
checks the same six tabs, in order, in the built pages of both sites.
