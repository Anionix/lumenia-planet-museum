---
type: Material Interpretation
title: "チャールズ・イームズ — Material Sphere"
profile_identifier: ea3de1f9-179b-5bca-89e0-289084190234
person_identifier: 10777ce7-f6db-56a6-8c73-86364cadba1b
source_revision: sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd
execution_identifier: 01a0a48b-cf79-770e-a05f-eee1d6a3021e
interpretation_status: proposed
---

# チャールズ・イームズ — Material Sphere

参照範囲：Lounge Chair and Ottoman（1956年に発表）

## 資料から読んだ特徴

- CharlesとRayは成形合板を共同で実験し、家具だけでなく複数の領域で設計した。 [Charles and Ray biography — Eames Office](https://www.eamesoffice.com/about/biography/)

  主張定義：bd808dd5-a3b7-57e0-99d9-25b7cbf1afca / 主張記録：01a09a97-f59f-7254-9c42-b31060f0f7b4

- 椅子は成形合板、革のクッション、アルミの支持部を組み合わせ、部品の共通化も行っている。 [Lounge Chair and Ottoman — Eames Foundation](https://eamesfoundation.org/work/lounge-chair-and-ottoman/)

  主張定義：a85ac178-9b4d-5efd-aa01-aeeaa97ed05c / 主張記録：01a09a97-f59f-7c5e-bcf5-e5e0637c9ae9

## Material Sphereの提案

暖色の薄い外殻、暗く柔らかい内側、細い支持部を別の層として重ねる。

色は試作の選択値：#95664b、#dfc6a0、#303637、#b4b8b1。

レイの寄与を消さない。素材の見分け、柔らかさ、耐久性は色や陰影の計算だけでは証明しない。

## 接続した計算規則

- [ArtPlanetarium.palette_selection_stays_inside_palette](../../formal/ArtPlanetarium/Proofs.lean) — fa38b9fc-c12a-52f7-b68a-5616749d009a
- [ArtPlanetarium.colour_channel_mix_stays_bounded](../../formal/ArtPlanetarium/Proofs.lean) — 520d5557-442c-57da-8f05-42be338699a1

画面での見え方・操作・速度は未検査です。[検査報告](../../reports/gate-report.md)で確認範囲を示します。

<!-- llm machine contract; state: proposed interpretation; transition: claim-linked profile -> human review; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867; execution UUIDv7: 01a0a48b-cf79-770e-a05f-eee1d6a3021e -->
