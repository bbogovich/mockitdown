---
title: "Web test pages and tests"
spec_version: 0.6.0
status: draft
updated: 2026-11-25
page_id: WEB.2
---

# Web test pages and tests

The TypeScript project serves its test pages with a development server built on `node:http` and
tests them with Playwright (F-18, ADR-20). The first page is the pack gallery: packs on the left,
the selected pack's elements and design patterns on the right.

<!-- slot: reqs -->
