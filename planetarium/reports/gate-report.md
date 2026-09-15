---
type: Gate Report
artifact_identifier: e67bec4e-cc81-54b8-8de8-e04f06503867
execution_identifier: 01a0a48b-cf79-770e-a05f-eee1d6a3021e
source_revision: sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd
---

# Material Sphereの検査結果

pass: 10 / fail: 0 / blocked: 2 / staleEvidence: 0

| 検査 | 状態 | 観測値 | 基準 | 単位 |
| --- | --- | --- | --- | --- |
| ArtifactChainReferences | pass | 0 | 0 | failedAssertions |
| LeanProjectBuild | pass | 0 | 0 | exitCode |
| LeanTransitiveAxioms | pass | 0 | 0 | failedAssertions |
| MaterialJsonBoundaryAgreement | pass | 0 | 0 | failedAssertions |
| DimensionJsonBoundaryAgreement | pass | 0 | 0 | failedAssertions |
| KnowledgeGraphReferences | pass | 0 | 0 | failedAssertions |
| GeneratedPlumeriaTypes | pass | 0 | 0 | exitCode |
| LeanLanguageServerInspection | pass | 0 | 0 | failedAssertions |
| WolframIndependentCalculation | pass | 0 | 0 | failedAssertions |
| MaterialSphereBrowserRendering | blocked | 0 | 4 | measuredBrowsers |
| PlumeriaBuildRuntimeRemoval | blocked | null | 0 | remainingRuntimeCalls |
| SourceRevisionUnchangedDuringVerification | pass | "sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd" | "sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd" | sourceRevision |

- MaterialSphereBrowserRendering: The new Material Sphere schemas have not been connected to the exhibition application or measured in browsers.
- PlumeriaBuildRuntimeRemoval: Generated schemas are type-checked; a production Plumeria build for these schemas has not been measured.

[機械可読な結果](gate-report.json) · [先行する証明報告](proof-report.md) · [人物カード](../generated/index.md)
