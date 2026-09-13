---
title: Lumenia Planet Museum people research
artifact_identifier: 76e13ef1-bb0d-56b9-bfec-0dae5d69c799
research_execution_identifier: 01a09b52-13e1-77e3-ab55-65bf236fb288
state: source_reviewed
retrieval_method: Exa web search followed by Exa page fetch
---

# Lumenia Planet Museum — 15人の人物調査

## 使い方

この文書は、人物制作・アトリエ台詞・Material SphereのCSS設計へ渡す一次情報源の束です。各行の「確認できたこと」は美術館・財団・公式アーカイブの記録から得た事実、「試作への翻訳」はLumeniaの新しい表現案です。後者を人物本人の作品、本人の発言、本人の制作現場とは扱いません。

Exaで検索した後、主要ページ本文を取得して確認しました。機械可読な全項目、UUIDv5の人物・資料識別子、UUIDv7の検索実行識別子は [people-research.json](./people-research.json) にあります。

| 人物 | 参照する作品・資料 | 確認できた制作上の手掛かり | CSS試作への翻訳（提案） |
| --- | --- | --- | --- |
| William Morris | Strawberry Thief | 1883年の布、鳥と苺、Merton Abbeyでの藍抜染、Morris & Co. | 植物反復・濃い地色・別レイヤーの陰影 |
| Alphonse Mucha | Zodiac | Champenoisの暦、後光状の円盤、十二宮、複数の版 | 12スロット・円環・等角配置 |
| Charles Rennie Mackintosh | 約1918年のテキスタイル設計 | 格子背景、曲線形、鉛筆と水彩、未完成の裏面 | 格子・花形・未完成レイヤー |
| Piet Mondrian | 抽象作品群 | 具体と普遍の均衡、キュビスム後の抽象化、1897–1944年の展開 | 水平・垂直の色面・黒い区切り |
| Gerrit Rietveld | Red Blue Chair | 1918–1923年、直交面、標準材寸法、1923年頃の原色 | 分離した直交面・原色・影 |
| Ettore Sottsass | Carlton | 1981年、家具機能の混成、MDFと積層材、三角形の構造 | 色面・斜め小片・三角形の規則 |
| Herbert Bayer | Universal Type studies | 1927年のインクとガッシュ、文字研究、明確なバウハウス構成 | 円弧と棒・共通格子・対比 |
| Josef Müller-Brockmann | Beethoven poster | 1955年のリトグラフ、作者・印刷者・公演情報が記録 | 基準線・文字帯・円弧・余白 |
| Massimo Vignelli | New York Subway Map | 多分野のアーカイブ、スケッチ・模型・技術図、長時間の口述史 | 路線・駅点・45度線分の反復 |
| Dieter Rams | 606と10原則 | 使いやすさ・理解しやすさ・抑制、原則は絶対規則ではない | モジュール・中性色・控えめな陰影 |
| Naoto Fukasawa | Wall-mounted CD Player | 1999年、引きひも、家庭の既知動作、CDと換気扇の類似 | ひとつの操作で動作を切り替える球 |
| Rei Kawakubo | Art of the In-Between | 1981年以降、2017年展、9つの境界表現、約140例 | 不均衡な折り・空隙・暗い縁 |
| Charles Eames | Lounge Chair and Ottoman | 1956年、成形木材・革・金属、Rayとの共同制作 | 外殻・内側・支持層の重なり |
| Ray Eames | House of Cards | 1952年設計、CharlesとRayとEames Officeの共同 attribution、紙とフィルム | 菱形セル・色相・明暗のコラージュ |
| Walter Gropius | Bauhaus Building, Dessau | 鉄・コンクリート・ガラス、機能別の棟、歩いて理解する構成 | 透明格子・不透明面・視点変化 |

## アトリエの会話契約

1. 部屋は「資料をもとにした再構成」と常に表示する。
2. 本人の実際の発言は、出典ページと引用境界を別に記録した場合だけ引用する。
3. 現在の人物パッケージは、人物の顔・声・私的心理を復元するものではない。
4. 作品名・年代・材料・工程は資料の記録、色・動き・CSS形状はLumeniaの提案として分離する。
5. 共同制作については、Charles Eames / Ray Eames、Morris & Co.、Bauhausのような共同主体を一人へ縮約しない。

## 一次資料一覧

一次資料は各人物につきJSON内に2件ずつ記録しています。代表的な確認先は以下です。

- [Victoria and Albert Museum — William Morris / Strawberry Thief](https://collections.vam.ac.uk/item/O78889/)
- [Mucha Foundation — Zodiac](https://www.muchafoundation.org/en/gallery/browse-works/object/242)
- [Cooper Hewitt — Charles Rennie Mackintosh biography](https://collection.cooperhewitt.org/people/18044987/bio)
- [The Museum of Modern Art — Piet Mondrian](https://www.moma.org/artists/4057)
- [The Metropolitan Museum of Art — Carlton](https://www.metmuseum.org/art/collection/search/486989)
- [Rams Foundation — Ten Principles](https://rams-foundation.org/foundation/design-comprehension/theses/)
- [The Metropolitan Museum of Art — Rei Kawakubo exhibition](https://www.metmuseum.org/exhibitions/listings/2017/rei-kawakubo)
- [Charles and Ray Eames Foundation — biography](https://eamesfoundation.org/charles-ray/biography/)
- [Stiftung Bauhaus Dessau — Bauhaus Building](https://bauhaus-dessau.de/en/venues/bauhaus-building/)

## 検算状態

- 検索対象: 15人
- 人物別一次資料: 30件（各2件）
- 確認済み: 資料ページ本文の取得と要約
- 未実施: この調査だけでは人物のCSS表現、ブラウザー描画、台詞の自然さ、歴史的真実性を証明しない
- 次の遷移: `source_reviewed -> character_input -> proposed_reconstruction`

`llm machine contract`: JSONの `confirmedFacts` だけを資料事実として人物パッケージへ渡し、`prototypeInterpretation` と `atelierBoundary` は提案・制約として渡す。
