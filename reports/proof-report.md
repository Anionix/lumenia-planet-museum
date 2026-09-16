---
type: Verification Report
title: Lumenia proof-report
status: pass
sourceRevision: sha256:fa371b84fa47949a1c010e29b9545cb3671b586f9700f4df604d117be0605a2a
executionIdentifier: 01a0a98a-1de0-715d-9080-5c4de1ae306b
generated:
  by: scripts/run-formal-check.mjs
  at: 2026-09-16T09:26:43.425Z
---

[Intent](../intent.md) → [Specification](../spec.md) → [Proof report](proof-report.md) → [Gate report](gate-report.md)

各観測のソース改訂・実行識別子はJSONに記録。空欄・古い証拠・未実行は合格になりません。

公理依存の必須値：各定理0。標準公理も例外扱いしません。
取得した定理：27。依存なし：27。依存あり：0。

| Gate | Status | Observed | Limit | Unit | Reason |
| --- | --- | ---: | ---: | --- | --- |
| Lumenia.LeanProjectBuildGate | pass | 0 | 0 | exit code | null |
| Lumenia.LeanWarningGate | pass | 0 | 0 | warnings | null |
| Lumenia.BoundaryRegressionGate | pass | 0 | 0 | exit code | null |
| Lumenia.ContractExamplesGate | pass | 0 | 0 | exit code | null |
| Lumenia.ClaimIdentityGate | pass | 0 | 0 | mismatches | null |
| Lumenia.FormalSourcePatternGate | pass | 0 | 0 | files | null |
| Lumenia.LeanAxiomAuditExecutionGate | pass | 0 | 0 | exit code | null |
| Lumenia.TheoremAxiomDependencyGate | pass | 0 | 0 | unverified theorems | null |
| Lumenia.LeanLanguageServerGate | pass | 0 | 0 | failed or missing checks | null |

[Machine result](proof-report.json) · [Raw tool evidence](proof-report-evidence.json)
