---
type: Verification Report
title: Lumenia proof-report
status: pass
sourceRevision: sha256:87ed8dc07a6cf314667c9e4f158ea72255a3130c220ca3192f1266e238231c76
executionIdentifier: 01a0a9cb-dae3-7411-b5ac-3db574cd8c31
generated:
  by: scripts/run-formal-check.mjs
  at: 2026-09-16T10:38:29.743Z
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
