---
type: Material Interpretation
title: "マッシモ・ヴィネッリ — Material Sphere"
profile_identifier: fda39095-201d-5703-a75a-072fceac56f4
person_identifier: 8f7c1bbe-3cde-5bbd-86e8-40cdf410482a
source_revision: sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd
execution_identifier: 01a0a48b-cf79-770e-a05f-eee1d6a3021e
interpretation_status: proposed
---

# マッシモ・ヴィネッリ — Material Sphere

参照範囲：New York Subway Map（1970–1972年）

## 資料から読んだ特徴

- MoMAはMassimo Vignelli、Joan Charysyn、Bob Noorda、Unimarkを制作者として記録し、Charysynを主担当と説明する。 [New York Subway Map — MoMA](https://www.moma.org/collection/works/89300)

  主張定義：abcd6972-7dae-5997-92fa-fbd146f8fa0e / 主張記録：01a09a97-f59f-7b1c-b8e6-68edf40fe79c

- 路線を45度・90度の直線へ整理し、駅を点で表した。背景の地理的な形は簡略化されている。 [New York Subway Map — MoMA](https://www.moma.org/collection/works/89300)

  主張定義：017b156c-281c-57fe-951f-ea2bdbd03b80 / 主張記録：01a09a97-f59f-73b9-856c-9132fc1eaf0c

- 交通博物館もUnimarkの共同作業と、情報を伝えるための地図の整理を説明する。 [Towards a Better Way: The Vignelli Map at 50 — New York Transit Museum](https://www.nytransitmuseum.org/vignelli/)

  主張定義：440ec54f-f8a2-59fa-bffd-a00cfd72e1ec / 主張記録：01a09a97-f59f-7576-9843-39bef074f325

## Material Sphereの提案

45度刻みの線分と駅の点を少ない色で反復し、同じ路線は同色にそろえる。

色は試作の選択値：#ded8c7、#cb5845、#476c91、#bba042。

これは使える路線案内図ではない。視覚的な近さから作者間の影響や共同制作を自動生成しない。

## 接続した計算規則

- [ArtPlanetarium.route_angles_are_eighth_turns](../../formal/ArtPlanetarium/Proofs.lean) — 4bbe45d8-ebbb-56a3-b424-cd2c145f34ae
- [ArtPlanetarium.palette_selection_stays_inside_palette](../../formal/ArtPlanetarium/Proofs.lean) — fa38b9fc-c12a-52f7-b68a-5616749d009a
- [ArtPlanetarium.visual_distance_does_not_establish_influence](../../formal/ArtPlanetarium/Proofs.lean) — 1442b214-77c1-54ac-aa17-411d14ad18e5

画面での見え方・操作・速度は未検査です。[検査報告](../../reports/gate-report.md)で確認範囲を示します。

<!-- llm machine contract; state: proposed interpretation; transition: claim-linked profile -> human review; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867; execution UUIDv7: 01a0a48b-cf79-770e-a05f-eee1d6a3021e -->
