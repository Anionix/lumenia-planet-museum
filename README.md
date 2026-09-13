# Lumenia Planet Museum

Plumeria・React・Next.jsを土台に、資料から着想したCSS作品と、制作室を訪ねる体験を作っています。人物・部屋・台詞はMuseumのための創作であり、本人の発言や現存する制作室の忠実な復元ではありません。

## 今の状態

- 15人分の資料付きMaterial Sphere展示と、ウィリアム・モリス一人分の制作室があります。
- モリスはCSSの形とアニメーションで表示します。Codex用の画像版は同じ形から書き出し、独立した検査後に登録します。
- CSS出力は接続済みです。画像・SVG・Canvas・Three.jsには別々の登録口がありますが、変換処理は未接続です。人物画像を球の画像変換と数えません。
- アプリケーション検査と、全ブラウザー・性能検査は別です。後者や人物検査が未完了なら、接続報告は合格になりません。

## ローカルで見る

```sh
npm ci
lake build
npm test
npm run build
npm run verify:application
node scripts/publish-material-sphere-evidence.mjs
npm run preview
```

`/planetarium/` は作品一覧、`/atelier/william-morris/` は最初の制作室です。ソースを変更したらビルドと検査を更新してください。モリスはCSSで描かれ、挨拶・注目・制作・鑑賞に合わせて動きます。停止と動きを減らす設定に対応します。同じ人物からの画像書き出しは検査後に登録します。

[制作意図](verification/planet-museum-intent.md) → [接続仕様](verification/planet-museum-spec.md) → [数理証明](planetarium/reports/proof-report.md) → [接続報告](reports/material-sphere-integration-report.md) をたどれます。報告は対象ソースの改訂付きで、過去の合格を現在の完成判定へ流用しません。

人物制作へ渡す調査は [15人の人物調査](verification/people-research.md) と [機械可読な人物証跡](verification/people-research.json) に分けています。確認できた事実と、Material Sphereへ翻訳した提案を混ぜません。

制作の担当境界と進行状態は [人物制作キュー](verification/character-production-queue.json) で追跡します。検査前の人物画像は公開アプリへ登録しません。CSSの人物と画像版の検査状態は区別します。

## Lumeniaの検算基盤

[仕様](spec.md) → [証明報告](reports/proof-report.md) → [出荷ゲート報告](reports/gate-report.md) の順に確認できます。

Lean 4.28.0を固定しています。外部数学ライブラリーの取得は不要です。

```sh
npm run check:fast
npm run verify:formal
npm run verify:gates
```

最初の処理はLeanの構築・実行ファイルとJSON検証の照合・契約検査です。形式検証は全定理の公理依存、ソース内容のハッシュ、現在のLean LSP証跡も検査し、MarkdownとJSONを生成します。

公理依存は全登録定理でゼロを必須にしています。標準公理も自動承認しません。定理の条件を弱めず、依存が増えたら検査を不合格にします。

Leanの言語サーバーは [設定例](mcp/lean-lsp-mcp.json) のプロジェクトパスを利用します。ソース変更後は、仕様にある六種類のMCP検査を実行し、実際の応答を `reports/lean-lsp-evidence.json` に記録してください。過去の応答を再利用するとstaleEvidenceになります。通常の構築成功を言語サーバー検査の実行と記録することはありません。

出荷ゲートは同じ形式の測定報告を追加で受け取れます。

```sh
node scripts/run-gates.mjs path/to/machine-measurement-result.json
```

出荷ゲートは必要な測定証跡が揃わなければblockedです。実アプリと一部の資産・ブラウザー検査は実装されていますが、現在のMuseum全体の出荷判定とは分けて確認してください。作品別の復号時間やメモリ予算にも未指定項目があります。終了コードは合格0、不合格1、blockedまたはstaleEvidenceは2です。`contracts/examples` は検査用例であり、実行証跡ではありません。

検算方法の一次資料は [Lean LSP MCP](https://github.com/oOo0oOo/lean-lsp-mcp)、配置境界は [Next.js公式](https://nextjs.org/docs/app/getting-started/server-and-client-components)、形式は [Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format) を参照しています。

CSSのビルド規則は [Plumeria公式](https://plumeria.dev/docs/ai)、モリスの人物像と制作の手掛かりは [National Portrait Gallery](https://www.npg.org.uk/collections/search/portraitExtended/mw04542/William-Morris) と [Victoria and Albert Museum](https://www.vam.ac.uk/articles/willam-morris-textiles) に基づきます。

<!-- llm machine contract; claimIdentifier: 63c605f5-9e47-5b49-949f-cad7ce96b4ed; executionIdentifier: 01a09b37-7009-7aa4-9a0e-ff72bc350a42; transition: verified application checkpoint -> documented incomplete museum; character production and release acceptance remain separate. -->
