# Vercel の静的ファイルの公開先

記録識別子: 6c0ef7ae-8610-5c8c-bb11-636df0a60065
状態遷移: ソース → `npm run build` → `web/out` → Vercel の公開ファイル。

Next.js は `web/next.config.mjs` の `output: 'export'` により `web/out` を生成する。
Vercel の自動検出は `public` を探していたため、ビルド後に失敗していた。
ルートの `vercel.json` で既存のビルドコマンドと出力先を明示する。
合格条件は `web/out/index.html` の生成と、同じ変更を使う Vercel のプレビュー成功。
ローカルビルド成功だけを公開成功とは扱わない。

一次資料: [Vercel の出力先設定](https://vercel.com/docs/project-configuration#outputdirectory)、
[Next.js の静的出力](https://nextjs.org/docs/app/guides/static-exports)。
