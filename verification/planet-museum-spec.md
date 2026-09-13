---
title: Lumenia Planet Museum — Material Sphere接続仕様
type: Specification
claim_identifier: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
execution_identifier: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
predecessor: planet-museum-intent.md
state: implementation
---

# 接続仕様

[意図](planet-museum-intent.md)を読み、以下を実装・検査する。既存の `planetarium` 数理パッケージの改訂と、アプリケーションの改訂は別々に保持する。

| 境界 | 必須の振る舞い | 機械確認 |
| --- | --- | --- |
| 数理パッケージ → アプリ | 現行の証跡だけを採用し、整数計算はバイト同一で再利用 | 前提10ゲート、ソース改訂、2ファイルの一致 |
| 資料 → 展示 | 15人、主張単位の資料リンク、提案と事実を区別 | 静的16経路、各人物の出典、完全な識別子 |
| Plumeria → 配信 | モジュール最上位の定義、classStyle配列、ビルド時CSS抽出 | 公式検査、変換結果、配信JavaScript、モジュール一覧 |
| 入力 → 座標 | 空間1〜4軸、整数、単位明示、時間は別 | 型検査、入力拒否、実ブラウザー操作 |
| 座標 → CSS表示 | 第1軸と第2軸へ射影。3軸以降を捨てることを表示 | 実位置の変化、4次元の第4軸だけ変更しても画面位置不変 |
| 時間 → CSS動作 | 初期停止、再生・停止・開始位置、動きを減らす設定を優先 | 実際のCSSアニメーションの状態・変換行列 |
| 共通計算 → 出力分岐 | CSS、画像、SVG、Canvas、Three.js。未接続先は明示的に拒否 | 5分岐、偽の代替出力なし、登録した処理への同一数値受け渡し |

## 共通基盤と描画処理

`MaterialSphere` は資料範囲・表現規則・整数パラメーター・球の共通陰影を持つ。共通の数値入力を作り、出力先固有の処理へ渡す。CSSプロパティそのものを、あらゆる描画方式に通用する形状データとは扱わない。画像化、SVG化、Canvas化、Three.js化には、それぞれ別の描画処理と比較検査が必要。

現在接続するのはPlumeriaのCSS出力。ほかの4方式は登録口と検査契約を用意するが、描画済みとも同じ見た目とも主張しない。既存の `CssOnlyApplicationGate` は**今回配信するCSS展示**の検査であり、将来の出力方式全体を禁止する規則ではない。

1次元は第2軸を0で補う。2次元はそのまま使う。3・4次元の入力値は保持するが、第3・第4軸を画面の座標には使わない。球の陰影は立体風の表現であり、4次元空間が画面で完全に再現されたという意味ではない。90度回転は最初の二軸だけを回す。時間の開始位置は整数ミリ秒で計算し、連続描画はブラウザーのCSSに任せる。

## 検査報告

数理証跡を変更せず、アプリ接続報告から元の証跡の改訂と実行識別子を参照する。報告の状態は `pass / fail / blocked / staleEvidence` に限定する。各ゲートは観測値、上限値、単位、使用ツール、対象改訂、実行識別子、失敗理由を持つ。

内蔵ブラウザーでの表示確認を、Chrome・Safari・Firefox・Edgeの全機能合格や性能予算合格へ拡張しない。実行していない試験は `blocked`。展示の芸術性、歴史的影響、原作との同一性は数理定理の結論にしない。

## 一人目の制作室

ウィリアム・モリスの人物像は、[CSS人物仕様](css-character-specification.md) に従い、Plumeriaの形と動きで表示する。同じ形をhatch-petの第2版へ書き出す。9種類の動作と16方向の視線、1536 × 2288画素、192 × 208画素の枠を使う。通常動作・上下左右の意味・独立した方向検査・透明背景・隣接する姿の連続性が通るまでMuseumに登録しない。

人物画像は `characters/william-morris/` に隔離し、作品のCSS描画とは別の画像資産として量を測る。この人物画像はMaterial Sphereを画像に変換した成果ではない。球の4つの未接続出力方式の状態は変更しない。画像を加えたアプリ全体を、画像なしのCSS専用アプリと呼ばない。

制作室の会話は「挨拶 → 注目 → 制作 → 球の鑑賞」。すべて台本であり、本人の引用ではない。CSSで直接人物を動かし、検査済みの画像がある場合には駒切り替えも選べる。停止操作と端末の動きを減らす設定を優先する。画像検査の合格と人物の芸術性の評価は別に記録する。

[National Portrait Galleryの肖像記録](https://www.npg.org.uk/collections/search/portraitExtended/mw04542/William-Morris)と[V&Aの制作技法解説](https://www.vam.ac.uk/articles/willam-morris-textiles)を外見・制作の手掛かりとし、体型・服の細部・身振り・部屋・台詞は今回の創作とする。

## 一次資料

- [Plumeria公式のビルド時変換と動的値の扱い](https://plumeria.dev/docs/ai)
- [Next.js公式のServer / Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [CSS変換の標準仕様](https://www.w3.org/TR/css-transforms-2/)
- [Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format)
- [AI-native SDLCの一次資料](https://claude.com/blog/the-ai-native-sdlc-playbook)

次工程は [数理証明報告](../planetarium/reports/proof-report.json) と本仕様を読み、`reports/material-sphere-integration-report.json` を生成する。

<!-- llm machine contract; transition: intent -> build and behavioural evidence -> integration report; claim UUIDv5: 52f3ecec-8283-5bc9-a8d7-b931936ce48b; execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016 -->
