---
type: Design Intent
title: Art Knowledge Planetarium — Material Sphere
artifact_identifier: e67bec4e-cc81-54b8-8de8-e04f06503867
execution_identifier: 01a09a86-bce5-77fe-8aff-ce403b00e379
interpretation_status: proposed
---

# 目的

人物の仕事から読み取った特徴を、球の形・表面・動き・操作へ置き換える。
共通の呼び名は **Material Sphere**。立体風に見えればよく、物理的な球・布・ガラスの再現は要求しない。
人物全体の「本質」や美しさを採点しない。参照する作品・時期を限定する。

最初の対象は共有画像の12人、貼付資料のCharles Eames、Ray Eames、Walter Gropiusを合わせた15人。
共同制作者は別の人物として保存し、15人以外の名前を除外して作者を一人に見せない。

# 成果物の順序

[この意図](intent.md) → [仕様](spec.md) → [人物と根拠](knowledge.json) →
[証明報告](reports/proof-report.md) → [検査報告](reports/gate-report.md)。
人が読む入口は [人物カード一覧](generated/index.md)。

資料にある事実、私たちの解釈、整数の計算規則、実際の描画結果は別々に扱う。
Leanは計算規則を証明する。Wolframは別実装で数式を検算する。
1〜4次元の空間座標を共通の計算基盤に持たせ、時間は独立した値として組み合わせる。
Material Sphereはその計算結果を見せる表現であり、投影で失われる情報を記録する。
どちらも作者性・美しさ・史実・ブラウザー性能を証明したとは表示しない。

# 今回変えないもの

既存の展示アプリ、作品、従来の証明報告は変更しない。このフォルダーには独立した改訂番号を付ける。
既存のアプリの合格記録を、新しいMaterial Sphereの描画証拠として流用しない。
公開・配置・外部への送信は行わない。人物情報は公開された職業上の資料に限定する。

<!-- llm machine contract
state: user reference received
transition: linked atlas -> scoped interpretation -> formal and empirical gates
artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867
execution UUIDv7: 01a09a86-bce5-77fe-8aff-ce403b00e379
-->
