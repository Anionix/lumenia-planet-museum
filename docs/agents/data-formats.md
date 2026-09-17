# 資料の保存形式

独自データは JSONL を原本にします。人物・根拠・出来事の集合は一件ずつの行にし、一つの契約や一回の検査結果は一行の値として保存できます。改行を含む説明文は JSON の文字列内でエスケープします。

`package.json` など外部ツールが必要とする設定は [例外一覧](../../contracts/json-lines-exceptions.jsonl) に理由付きで記録します。利用者は標準設定の JSON 維持を許可しています。`node scripts/check-data-format.mjs` は例外にない JSON と、不正な JSONL 行を検出します。

形式変換で過去の検算結果を新しい実行結果に変えません。過去の実行識別子・時刻・入力ハッシュはそのまま保存します。変換前後の対応は別の記録に残し、変わった実装は改めて検査します。

Parquet と Vortex は、大量集計が必要になった場合に原本から生成する候補です。現時点では導入しません。トークン削減では、識別子と必要な項目による抽出を優先します。

一次資料: [JSON Lines](https://jsonlines.org/)、[Parquet](https://parquet.apache.org/docs/overview/)、[Vortex](https://docs.vortex.dev/)、[Vercel の設定](https://vercel.com/docs/project-configuration)。
