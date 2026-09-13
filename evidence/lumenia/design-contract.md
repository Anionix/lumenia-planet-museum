---
type: Design Contract
title: Lumenia deterministic verification rules
description: The formal invariants and external gates that define a valid Lumenia artifact.
resource: /spec.md
tags: [lumenia, lean, lsp, mcp, gltf, performance]
generated:
  by: process:codex-implementation
  at: 2026-09-13T00:00:00Z
status: draft
claim_registry: ../../contracts/claims.json
verification_report: ../../reports/proof-report.json
sources:
  - id: lean-lsp-mcp
    resource: https://github.com/oOo0oOo/lean-lsp-mcp
    title: Lean Theorem Prover MCP
  - id: open-knowledge-format
    resource: https://github.com/GoogleCloudPlatform/open-knowledge-format
    title: Open Knowledge Format
  - id: ai-native-sdlc
    resource: https://claude.com/blog/the-ai-native-sdlc-playbook
    title: The AI-Native SDLC playbook
  - id: plumeria
    resource: https://plumeria.dev/docs
    title: Plumeria documentation
  - id: next-server-client
    resource: https://nextjs.org/docs/app/getting-started/server-and-client-components
    title: Next.js Server and Client Components
  - id: next-static-export
    resource: https://nextjs.org/docs/app/guides/single-page-applications
    title: Next.js static export guide
  - id: react-compiler
    resource: https://react.dev/learn/react-compiler/introduction
    title: React Compiler introduction
  - id: three-gltf-loader
    resource: https://threejs.org/docs/pages/GLTFLoader.html
    title: Three.js GLTFLoader
  - id: khronos-meshopt
    resource: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_meshopt_compression/README.md
    title: KHR meshopt compression specification
  - id: khronos-texture-basisu
    resource: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_texture_basisu/README.md
    title: KHR texture Basis Universal specification
  - id: gltfpack
    resource: https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md
    title: gltfpack documentation
  - id: gltf-validator
    resource: https://github.com/KhronosGroup/glTF-Validator
    title: glTF Validator
---

# Deterministic rules

The current, authoritative rules and trust boundary are in [spec.md](../../spec.md).
The checker is proved equivalent to an independently written requirement predicate.
Acceptance preserves the exact flags and pipeline options. All finite shipment
histories reaching shipped are characterized, including rejection and terminal stages.

The Lean project proves that the two Meshopt encodings cannot be selected by
the same validated asset, that shipping requires the validated stage, that
static export rejects server-only capability, that server placement rejects
browser capability, and that the five core transfer categories fit within the
200 kibibyte budget.

# Boundary rules

Untrusted JSON is converted to a validated asset only when encoding choices,
decoder availability, loader availability, and preservation options agree.
The boundary validator is intentionally stricter than the Khronos local
buffer-view exclusion: a shipped Lumenia asset selects one Meshopt variant for
the whole asset.

Different textures may use KTX2 and WebP; different primitives may use Meshopt
and Draco. These combinations are not globally banned by the Lumenia contract.
Pure rendering is allowed on server or client; request-time server-only features
are forbidden in static export and in client components.

# Measurement rules

Generated JavaScript, compressed transfer size, largest contentful paint,
artwork readiness, decode time, and GPU memory are receipts. They are not
claimed as Lean theorems.
