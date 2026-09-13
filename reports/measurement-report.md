---
type: Verification Report
title: Lumenia measurement-report
status: blocked
sourceRevision: sha256:b7ebb26c5de074837b4048d3b7e4c3be183594e7591d0ef40a0df29fd07763e9
executionIdentifier: 01a09a30-2170-71c9-bb89-e79cd8f51ef5
generated:
  by: scripts/collect-measurements.mjs
  at: 2026-09-13T09:54:00.696Z
---

[Intent](../intent.md) → [Specification](../spec.md) → [Proof report](proof-report.md) → [Gate report](gate-report.md)

各観測のソース改訂・実行識別子はJSONに記録。空欄・古い証拠・未実行は合格になりません。

| Gate | Status | Observed | Limit | Unit | Reason |
| --- | --- | ---: | ---: | --- | --- |
| Lumenia.CoreInitialTransferGate | pass | 122646 | 204800 | bytes | null |
| Lumenia.HtmlInitialTransferGate | pass | 5369 | 30720 | bytes | null |
| Lumenia.JavaScriptInitialTransferGate | pass | 114000 | 122880 | bytes | null |
| Lumenia.StyleInitialTransferGate | pass | 2797 | 20480 | bytes | null |
| Lumenia.FontInitialTransferGate | pass | 0 | 20480 | bytes | null |
| Lumenia.MetadataInitialTransferGate | pass | 480 | 10240 | bytes | null |
| Lumenia.LargestContentfulPaintGate | pass | 200 | 2500 | milliseconds | null |
| Lumenia.FirstUsableArtworkGate | pass | 267.5 | 3000 | milliseconds | null |
| Lumenia.PlumeriaModuleScopeGate | pass | 0 | 0 | violations | null |
| Lumenia.PlumeriaClassStyleCompositionGate | pass | 0 | 0 | violations | null |
| Lumenia.PlumeriaRuntimeRemovalGate | pass | 0 | 0 | runtime occurrences | null |
| Lumenia.NextStaticExportBoundaryGate | pass | 0 | 0 | violations | null |
| Lumenia.NextComponentBoundaryGate | pass | 0 | 0 | violations | null |
| Lumenia.ArtworkGpuMemoryGate | blocked | null | null | bytes | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.ChromeEmptyFunctionalityGate | pass | true | true | boolean | null |
| Lumenia.ChromeCssFunctionalityGate | pass | true | true | boolean | null |
| Lumenia.ChromeSurfaceFunctionalityGate | pass | true | true | boolean | null |
| Lumenia.ChromeSolidFunctionalityGate | pass | true | true | boolean | null |
| Lumenia.SafariEmptyFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.SafariCssFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.SafariSurfaceFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.SafariSolidFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.FirefoxEmptyFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.FirefoxCssFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.FirefoxSurfaceFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.FirefoxSolidFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.EdgeEmptyFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.EdgeCssFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.EdgeSurfaceFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.EdgeSolidFunctionalityGate | blocked | null | true | boolean | No usable machine observation. Safari remote automation is disabled; Firefox and Edge are not connected. GPU memory is unavailable. |
| Lumenia.CssLineArtworkDrawingGate | pass | true | true | boolean | null |
| Lumenia.CssOnlyApplicationGate | pass | 0 | 0 | violations | null |
| Lumenia.CssSurfaceArtworkDrawingGate | pass | true | true | boolean | null |
| Lumenia.CssSolidArtworkDrawingGate | pass | true | true | boolean | null |

[Machine result](measurement-report.json) · [Raw tool evidence](measurement-report-evidence.json)
