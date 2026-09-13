---
type: Reference
title: Lumenia primary source register
description: Authoritative sources used to classify the Lumenia design claims.
tags: [primary-source, provenance, lumenia]
generated:
  by: process:codex-implementation
  at: 2026-09-13T00:00:00Z
status: stable
sources:
  - id: lean-lsp-mcp
    resource: https://github.com/oOo0oOo/lean-lsp-mcp
    title: Lean Theorem Prover MCP
  - id: open-knowledge-format
    resource: https://github.com/GoogleCloudPlatform/open-knowledge-format
    title: Open Knowledge Format
  - id: next-server-client
    resource: https://nextjs.org/docs/app/getting-started/server-and-client-components
    title: Next.js Server and Client Components
  - id: react-compiler
    resource: https://react.dev/learn/react-compiler/introduction
    title: React Compiler introduction
  - id: plumeria
    resource: https://plumeria.dev/docs
    title: Plumeria documentation
  - id: three-gltf-loader
    resource: https://threejs.org/docs/pages/GLTFLoader.html
    title: Three.js GLTFLoader
  - id: khronos-gltf
    resource: https://github.com/KhronosGroup/glTF
    title: Khronos glTF repository
  - id: gltfpack
    resource: https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md
    title: gltfpack documentation
  - id: gltf-validator
    resource: https://github.com/KhronosGroup/glTF-Validator
    title: glTF Validator
---

# Claim mapping

| Claim | Classification | Source |
|---|---|---|
| Server Components are the default in the Next.js App Router | source-attested | [Next.js Server and Client Components][next-server-client] |
| Static Export has no Next.js runtime server | source-attested | [Next.js static export guide][next-static-export] |
| React Compiler is a build-time optimizer | source-attested | [React Compiler][react-compiler] |
| Plumeria removes its styling runtime during compilation | source-attested | [Plumeria][plumeria] |
| GLTFLoader requires explicitly registered decoders for compressed assets | source-attested | [Three.js GLTFLoader][three-gltf-loader] |
| KHR meshopt is a separate Release Candidate extension | source-attested | [KHR meshopt][khronos-meshopt] |
| KTX2 Basis Universal is a ratified glTF extension | source-attested | [KHR texture Basis Universal][khronos-texture-basisu] |
| gltfpack can change node, mesh, animation, and extension data | source-attested | [gltfpack][gltfpack] |
| Lean and LSP provide proof and diagnostic interfaces through MCP | source-attested | [lean-lsp-mcp][lean-lsp-mcp] |

[next-server-client]: https://nextjs.org/docs/app/getting-started/server-and-client-components
[next-static-export]: https://nextjs.org/docs/app/guides/single-page-applications
[react-compiler]: https://react.dev/learn/react-compiler/introduction
[plumeria]: https://plumeria.dev/docs
[three-gltf-loader]: https://threejs.org/docs/pages/GLTFLoader.html
[khronos-meshopt]: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_meshopt_compression/README.md
[khronos-texture-basisu]: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_texture_basisu/README.md
[gltfpack]: https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md
[lean-lsp-mcp]: https://github.com/oOo0oOo/lean-lsp-mcp
