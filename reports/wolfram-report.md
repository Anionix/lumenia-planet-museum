---
type: Verification Report
title: Lumenia independent Wolfram verification
status: pass
sourceRevision: sha256:9c6383db05ae133dce19772d524b584bc0f1c3b01b9e4c8884ebc52125902ad2
executionIdentifier: 01a099c9-f57c-7626-a7bc-f940f1394cee
generated:
  by: Wolfram Language evaluator; independent delegated agent Pasteur
  at: 2026-09-13T08:04:34.767Z
---

[Intent](../intent.md) → [Specification](../spec.md) → [Proof report](proof-report.md) → [Gate report](gate-report.md)

今回変更した三つの有限関数について、全44入力を実装・仕様・期待値表の三方向で照合。不一致は0です。Leanの証明やブラウザー測定の代用ではありません。

| 対象 | 入力数 | 不一致 |
| --- | ---: | ---: |
| Lumenia.transition | 20 | 0 |
| Lumenia.deploymentCapabilityAllowed | 12 | 0 |
| Lumenia.componentPlacementAllowed | 12 | 0 |

状態遷移の拒否処理は期待値表を根拠に含めています。以前の資産4096通り・長さ8までの履歴照合は今回再実行せず、[旧版の証跡](wolfram-prior-snapshot.json)に区別して保存しました。

[機械可読結果](wolfram-report.json) · [実行コードと実際の応答](wolfram-report-evidence.json)
