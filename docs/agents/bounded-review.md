---
{"type":"Playbook","title":"小さな修正と機械的な追跡","description":"公式資料を索引化し、変更量と検証根拠を機械で確認するための運用仕様。","recordIdentifier":"017c0f86-d5d1-5b85-a459-8571db383465","status":"proposed","sources":[{"id":"bba8c655-3288-5688-8b72-9bc4f0930cc2","resource":"https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md","title":"Open Knowledge Format"},{"id":"f26b80d1-abb0-5bf4-a7f5-b1e7936922ea","resource":"https://claude.com/blog/the-ai-native-sdlc-playbook","title":"Claude AI-Native SDLC playbook"}]}
---

公式参照は [official-references.jsonl](official-references.jsonl) に記録し、資料の確認と実装の全面適合を区別する。

- 1件の変更提案は追加行数＋削除行数が50以下、変更パス数が5以下。バイナリ差分は拒否する。
- 不具合は修正前の試験失敗と修正後の成功を確認し、同系統の不具合も調べる。既存の実装と検査を再利用する。
- 状態は調査→再現→修正→検証→レビュー待ち。JSON Linesに情報のUUIDv5、実行のUUIDv7、時刻、出典、検査結果を残す。
- Leanの証明、Wolframの有限検算、実装試験を区別して対応づける。構文木はTypeScript公式機能、言語サーバーは公式通信仕様を参照し、独自言語は既存定義を優先する。
