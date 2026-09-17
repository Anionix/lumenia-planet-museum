# 宇宙展示の公開

変更識別子: 72d6a9dc-f388-5636-a746-fe846871dcaa。

Next.jsの静的出力は `web/out`。ChatGPT Sitesの包装処理は対応する出力名として `dist` を要求するため、検証後に内容をそのまま複製する。出力を加工しない。

1. `npm run build` を実行する。
2. `npm run verify:formal`、`node scripts/verify-cosmic-exhibition.mjs`、`node scripts/inspect-cosmic-bundle.mjs`、`npm run verify:application` を確認する。言語サーバーの記録は現在のソースと一致している必要がある。
3. `web/out` の内容を新しい空の `dist` に複製し、全ファイルのダイジェストを比較する。
4. Sitesの公式包装ツールを実行する。ソースをSitesの指定ブランチへ送り、成功後に取得した完全なコミット値で版を保存・公開する。
5. Vercelでは同じ出力をBuild Outputの静的ディレクトリへ配置する。39個のページの入口を実際のHTMLファイルへ対応させ、事前ビルド済みの出力を公開する。
6. 公開状態、入口ページと制作室の到達性、入口HTMLの一致を確認する。

立体表示は初期スクリプトから分離されている。圧縮サイズの検査は実ネットワークや描画速度の測定ではない。表示位置は架空の演出で、12人の特徴座標を変更しない。残る3人は未設定を保つ。

一次資料: [Next.js静的出力](https://nextjs.org/docs/app/guides/static-exports)、[Vercelの出力設定](https://vercel.com/docs/build-output-api/configuration)。

<!-- llm machine contract; transition: verified source -> identical static output -> signed source commit -> deployment -> HTTP readback. Execution identifiers are recorded in the publication receipt. -->
