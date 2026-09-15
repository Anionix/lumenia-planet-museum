---
type: Verification Report
title: Lumenia proof-report
status: pass
sourceRevision: sha256:81baf2dec9fb672eb9c37d13fda9695911748f4408e5fe1673ec241b58d14bab
executionIdentifier: 01a0a5bf-3c93-742d-99eb-ee66a3830633
generated:
  by: scripts/run-formal-check.mjs
  at: 2026-09-15T15:46:15.988Z
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
