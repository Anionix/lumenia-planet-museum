# 検算記録の参照検査

`node scripts/audit-record-consistency.mjs` は過去の六つの実計算と `coverage.jsonl` を照合し、結果を一行の JSON として出力します。保存する場合は新しい `.jsonl` ファイルへ出力します。

参照先の実行識別子、入力の版、時刻、検査数を照合します。Wolfram の生の応答を読み直し、保存された読取結果とも比較します。古い再検証情報が混ざる場合、計算より前に参照が作られた場合、内側と外側の実行識別子が違う場合は失敗します。

これは履歴の整合性の検査です。現在のコードで実行した証拠や、応答の署名を作る機能ではありません。現在の Lean 検査は `npm run verify:formal`、全明示定理と補助定理の公理監査は `node scripts/audit-review-kernel.mjs` で実行します。

残る作業、完了条件、依存する作業、課題番号、一次情報は [verification-tasks.jsonl](verification-tasks.jsonl) で一件ずつ追跡します。各行の状態は記録時点の観測です。過去の時刻を現在の結果で上書きしません。

一次資料: [Wolfram の文字列出力](https://reference.wolfram.com/language/ref/ExportString.html)、[Node.js の回帰検査](https://nodejs.org/api/test.html)。出典と関係を保持する設計は [Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format)、小さな検証可能単位に分ける手順は [Anthropic の開発手順](https://claude.com/blog/the-ai-native-sdlc-playbook)を参照しています。形式全体への適合を宣言するものではありません。
