---
title: CSSで描くモリスの人物
type: Specification
claim_identifier: 4908c1b1-0ebf-55ef-a83f-378e2bfdf4c5
execution_identifier: 01a09b7c-3f68-756d-bae6-f55806a70d69
state: native_characters_verified_morris_sprite_admitted
---

# 一つの人物から、二つの表示へ

2026年9月14日、ユーザーはMuseumのCSSアニメーションとペット版の「両方」を選び、さらに人物自体をCSSで制作する方針を指定した。PlumeriaとReactの同じ人物定義を、Museumでは直接表示し、ペット版では決められた時刻の姿を画像へ書き出す。

hatch-petの通常の画像生成工程に代えて、今回のユーザー指定に従いCSSを制作の元とする。画像生成を実行したとは記録しない。第2版の寸法、動作の意味、独立した視線の確認、透明背景、停止操作の確認は維持する。

| 対象 | 必須の振る舞い | 確認方法 |
| --- | --- | --- |
| 人物の元 | 同じPlumeria・React定義を両方の表示に使う | 書き出し記録のファイル指紋を照合 |
| Museum | なめらかな動きとこま撮りの動きを切り替えられる | 登録状態、表示部品、静的出力を検査 |
| 停止 | 人物の全ての部位が止まる。端末の動きを減らす指定を優先 | 全アニメーションの再生状態を観測 |
| 動作 | 待機、左右の移動、手振り、跳躍、失敗、助け待ち、作業、確認の9種類 | 全てのコマと動作プレビューを確認 |
| 視線 | 上から時計回りの16方向。上下左右と正面を混同しない | 名前を隠した三者の確認と、順番を示した確認 |
| ペット画像 | 1536×2288画素。1枠192×208画素。空き枠は透明 | hatch-petの第2版検査 |
| 登録 | 人物、画像、確認記録の結び付きを保存 | 完全な識別子、時刻、画像と記録の指紋 |

人物は一人ずつ。当初はAstra一体とLuna二体で制作し、2026年9月14日の追加指示に従って、以後は主担当一人でCSS表示の提供を進める。画像版の独立検査は未実施として残す。画像の大きさを変える補正で視線の誤りを隠したり、未確認のコマを合格扱いにしたりしない。

資料の扱いは[National Portrait Galleryの肖像記録](https://www.npg.org.uk/collections/search/portraitExtended/mw04542/William-Morris)と[Victoria and Albert Museumの織物解説](https://www.vam.ac.uk/articles/willam-morris-textiles)を引き継ぐ。CSSの人物、部屋、台詞、しぐさはMuseumの創作である。

実装は[Plumeria公式](https://plumeria.dev/docs/ai)と[CSSアニメーションの標準仕様](https://www.w3.org/TR/css-animations-1/)に従う。資料と主張の分離は[Knowledge CatalogのOpen Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf)、仕様・制作・検査の小さな循環は[Anthropicの開発工程解説](https://claude.com/blog/the-ai-native-sdlc-playbook)を参考にする。

HyperFramesは同じ見た目を展示動画へ展開する候補、HeyGenは創作の案内役が話す映像の候補として扱う。現時点ではこれらの外部サービスへの送信・動画生成は行っていない。[HyperFrames公式](https://hyperframes.heygen.com/introduction)、[HeyGen公式](https://www.heygen.com/tool/ai-talking-avatar)。

<!-- llm machine contract; claimIdentifier: 4908c1b1-0ebf-55ef-a83f-378e2bfdf4c5; executionIdentifier: 01a09b7c-3f68-756d-bae6-f55806a70d69; transition: user-selected CSS authoring -> shared native character -> deterministic sampled frames -> independent review -> registered package. -->

2026年9月14日の追加指示：残り14人もCSSで作る。以後は主担当一人で制作・確認する。15人に共通の動作を使い、髪・ひげ・眼鏡・服・配色を創作として個別に設計した。15人×52姿勢をブラウザーで描画し、範囲・透明背景・再生・停止・動きを減らす設定を検査する。モリスのCodex版は独立検査後に登録済み。残り14人はCSS版として提供する。
