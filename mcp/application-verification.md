---
type: Verification Procedure
title: Lumenia 実アプリの再検算
claimIdentifier: 07b6fb92-8639-50e0-873d-b43d3d5c28df
executionIdentifier: 01a099d4-9840-7179-b6e0-2b7759333103
---

`intent.md → spec.md → proof-report → application-report → measurement-report → gate-report` を順に読む。

1. `npm ci`、`lake build`、`npm run build` を実行する。別系統の資産検証例が必要な場合は `npm run build:artwork`、`npm run verify:asset-reference` も実行する。これらの資産は現在のCSSアプリから配信しない。
2. Lean LSPの検算を現在のソース改訂に対して採取し、`npm run verify:formal` を実行する。
3. `npm run verify:application` を実行し、ソース・生成JavaScript・CSS以外の描画依存がないことを検査する。
4. `npm run preview` は127.0.0.1だけで起動する。利用者が見ている画面を停止テストに流用しない。
5. `node scripts/measurement-context.mjs before` を実行する。
6. MCPの `browser_run_code_unsafe` に、この作業領域の `mcp/chrome-measurements.js` をfilenameとして渡す。返された完全な構造を `reports/browser/tool-response.json` に保存する。説明文や手作業の合格値で置き換えない。
7. `node scripts/measurement-context.mjs after`、`node scripts/measurement-context.mjs record` を実行する。
8. `npm run verify:measurements`、`node scripts/run-gates.mjs reports/measurement-report.json` を実行する。超過・未検査・古い証拠は公開の許可にならない。
9. `npm run evidence:local` でローカル画面に報告を添付する。この操作は外部公開ではない。前のWolfram報告は改訂が一致しない限りstaleEvidenceで表示する。

現在の四段階は空の基盤・CSSの線・CSSの面・CSSの立体。独立したChrome画面で、各作品の要素数、連続回転、停止、速度、初期化、ドラッグ、携帯幅、動きを減らす設定、JavaScript無効時の描画を検査する。別系統で生成した参考資産はソースではなく検証用出力として要約値を記録する。ソース一覧はアプリ、固定依存関係、検査器、仕様、証明を含み、生成キャッシュと下流の報告を含まない。

この手順の観測はローカル診断である。公開回線・複数標本・Safari・Firefox・Edge・KTX2とDracoの現物検査・実メモリ測定は、対応する証跡が得られるまでは別の未達項目として残る。
