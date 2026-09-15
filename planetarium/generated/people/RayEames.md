---
type: Material Interpretation
title: "レイ・イームズ — Material Sphere"
profile_identifier: 0fcb82c9-fa68-5fb0-bb38-41102237b725
person_identifier: 21709063-b8c0-5945-bdfd-b223eac44abc
source_revision: sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd
execution_identifier: 01a0a48b-cf79-770e-a05f-eee1d6a3021e
interpretation_status: proposed
---

# レイ・イームズ — Material Sphere

参照範囲：House of Cardsの菱形模様の試作（1952年）

## 資料から読んだ特徴

- 所蔵される菱形模様の試作はRayが紙のコラージュで作ったものと記録される。灰色の階調と多色の対比が検討された。 [House of Cards Mock-up Process — Eames Institute](https://www.eamesinstitute.org/collection/artifacts/house-of-cards-mock-up-process-diamond-cards/)

  主張定義：bdb6ce71-ad6f-5cf5-9afc-edc7a205fd6a / 主張記録：01a09a97-f59f-70b1-a5d4-5fd3a0bd4f59

- House of Cards製品自体はCharlesとRayの共同設計。カードの切り込みで組み立てられる。 [Small House of Cards — Eames Office](https://www.eamesoffice.com/product/small-house-of-cards/)

  主張定義：6a7aa01d-711a-5526-a704-57844a0bc05e / 主張記録：01a09a97-f59f-74f0-bf46-de71c4fbe0fe

## Material Sphereの提案

同じ菱形を少しずつ異なる色で並べ、暖色・寒色と明暗を対比する。

色は試作の選択値：#ce695d、#e5c477、#6d9c9a、#dab5c1、#414945。

特定の試作と共同製品の作者を区別する。配色の良さを数値の大小でランキングしない。

## 接続した計算規則

- [ArtPlanetarium.grid_coordinates_are_aligned](../../formal/ArtPlanetarium/Proofs.lean) — d945cf70-cb97-54bf-be14-2189e6abda31
- [ArtPlanetarium.palette_selection_stays_inside_palette](../../formal/ArtPlanetarium/Proofs.lean) — fa38b9fc-c12a-52f7-b68a-5616749d009a
- [ArtPlanetarium.colour_channel_mix_stays_bounded](../../formal/ArtPlanetarium/Proofs.lean) — 520d5557-442c-57da-8f05-42be338699a1

画面での見え方・操作・速度は未検査です。[検査報告](../../reports/gate-report.md)で確認範囲を示します。

<!-- llm machine contract; state: proposed interpretation; transition: claim-linked profile -> human review; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867; execution UUIDv7: 01a0a48b-cf79-770e-a05f-eee1d6a3021e -->
