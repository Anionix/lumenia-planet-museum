# 関連不具合と検算の確認

実行: 01a0aa35-e1ae-76c5-b062-fbd68fffc4c8
資料の版: sha256:e2848a5d3243b0f7f5b56ca16b9132acf4c0612c4c0adee33566482f1cf4e973

12本の既存 PR にあった不具合コメント9件を整理し、新規 Issue #22〜#26 と既存 #2 に紐付けました。関連箇所で宇宙探索の誤った完了通知を実ブラウザーで再現し、#27 を追加しました。PR #28 の追加指摘（再生中の物理停止）は同 PR の後続コミットで修正し、同じ回帰テストに含めています。

| 提案 | 内容 | Issue |
| --- | --- | --- |
| [#28](https://github.com/Anionix/lumenia-planet-museum/pull/28) | 展示と探索の完了条件 | #22・#27 |
| [#29](https://github.com/Anionix/lumenia-planet-museum/pull/29) | 縮小画像15枚、合計41,990バイト | #26 |
| [#30](https://github.com/Anionix/lumenia-planet-museum/pull/30) | 通信記録と集計の整合 | #2 |
| [#31](https://github.com/Anionix/lumenia-planet-museum/pull/31) | 記録の版・公理監査・独立検算 | #23・#24・#25 |
| [#32](https://github.com/Anionix/lumenia-planet-museum/pull/32) | 惑星資料を含む完全な公理監査範囲 | #23・#24 |

各提案は直前の提案を親とし、重複する差分を含めていません。マージと公開は別の操作です。

| 検算の範囲 | Lean 定理数 | Wolfram 項目数 |
| --- | ---: | ---: |
| 資産・公開条件 | 36 | 3 |
| 素材・次元・表示変換 | 43 | 13 |
| 宇宙展示の時間 | 7 | 6 |
| 画像展示・座標と距離 | 19 | 10 |
| 探索・移動制限 | 10 | 6 |
| 追加の重み・完了条件・記録条件 | 18 | 17 |
| 合計 | 133 | 55 |

補助証明14件も含め、すべての明示的な定理で公理依存が空でした。新たな証明18件には任意個数の整数重みの上限、時計の上限、記録の鮮度、完全一致による完了条件を含めています。Wolfram は実数の範囲・回転・既存の表を検算し、16の有効状態の256通りの組から、作家だけの一致判定では112通りの誤った完了条件が生じることを確認しました。

現行の監査対象は source-manifest.json に記録した252ファイルです。Git の保存版検査は前回の版を対象にした記録として保持し、現行版の資料版とは混同しません（[記録](git-archive.json)）。

122件の実行テスト、製品用ビルド、型の検査、6項目のアプリケーション検査が成功しました。実ブラウザーでは初回の原画像取得が1件、縮小表示が15件、物理は初期無効であること、割込時の拒否、物理の開始と停止、配置の復元、15宇宙への移動、元の座標12件と未設定3件の保持を確認しました。WebMCP の登録部分にはテスト用の代替機能を使っています。

旧ブラウザー記録は過去の資料として保持しています。新しい受領記録は起動と操作の確認を置き換えるもので、以前の見た目の評価すべてを再現したものではありません。元の画像展示の複合検証コマンドは、古い画面記録を引き続き失効として拒否します。これは数式の失敗ではありません。#24 はこの境界を含む追跡として残します。

## 再実行と記録

- 全明示定理と補助証明: `node scripts/audit-review-kernel.mjs`
- 契約と既存証明: `npm run verify:formal`。六種類の Lean 検査を実行した新しい記録が必要です。
- 実行テスト: `npm test`
- 追加の独立検算: `contracts/review-verification.wl` を Wolfram で評価。今回の全六プログラムと生の応答は [wolfram.json](wolfram.json)。
- 詳細な範囲: [coverage.jsonl](coverage.jsonl)、[公理監査](lean-kernel.json)、[画面確認](browser.json)、[過去の記録の扱い](superseded-receipts.json)。

一次資料: [Lean の公理と計算](https://lean-lang.org/theorem_proving_in_lean4/Axioms-and-Computation/)、[Wolfram Reduce](https://reference.wolfram.com/language/ref/Reduce.html)、[WebMCP 仕様](https://webmachinelearning.github.io/webmcp/)。この報告は数学・実行・画面・公開を別々の主張として扱います。
