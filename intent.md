---
type: Intent
title: Lumenia formal verification foundation
description: Make the lightweight web art runtime design mechanically checkable.
tags: [lumenia, lean, lsp, mcp, verification]
generated:
  by: process:codex-implementation
  at: 2026-09-13T07:36:50.050Z
status: stable
---

# Problem

The Lumenia design combines web rendering, compile-time styling, three-dimensional
asset delivery, and strict performance budgets. Prose alone does not make the
invariants reviewable or reproducible.

# Proposed outcome

Create a small Lean model for deterministic invariants, a boundary validator for
untrusted JSON, a stable verification-result contract, and provenance documents
that can be consumed by humans, language models, and automated gates.

# Constraints

- Lean 4.28.0 and Lake 5.0.0 are pinned.
- The formal model uses the Lean standard library only.
- The core transfer budget is 200 kibibytes with explicit category limits.
- The shipped artifact must pass validation before it can enter the shipped state.
- Files under sources/ are read-only.

# Open questions

The local Next.js application and preview now exist. The user's updated rendering
request replaces SVG, Canvas, and WebGL with Plumeria-generated CSS for all three
artworks. The line, translucent surface, and opaque solid share native CSS motion
and user controls. The original asset-validation workflow remains a separate
reference fixture, not a dependency shipped with the CSS application.

llm machine contract: design foundation -> real local application -> all-CSS
artworks -> revision-bound browser measurements; claim UUIDv5:
2ec9706d-6206-5de2-aaf6-542e7f336b63; execution UUIDv7:
01a09a1a-e883-7d76-b209-e3f58830b29e.

Release still requires measured evidence. Local Chrome diagnostics do not replace
Safari, Firefox, Edge, deployed-network samples, or actual graphics-memory data.
