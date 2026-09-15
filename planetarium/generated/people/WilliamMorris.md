---
type: Material Interpretation
title: "ウィリアム・モリス — Material Sphere"
profile_identifier: e9146e26-704e-5073-8222-11be30c6d0be
person_identifier: 4f7cc469-4d4a-5409-95f3-0691a8214497
source_revision: sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd
execution_identifier: 01a0a48b-cf79-770e-a05f-eee1d6a3021e
interpretation_status: proposed
---

# ウィリアム・モリス — Material Sphere

参照範囲：Strawberry Thief（1883年のデザイン）

## 資料から読んだ特徴

- 鳥・イチゴ・草花を組み合わせた室内用の綿布。モリスがデザインし、Morris & Co.が製造した。 [Strawberry Thief — Victoria and Albert Museum](https://collections.vam.ac.uk/item/O78889/)

  主張定義：6b51ab95-9c2d-5555-a454-0d1b651dabff / 主張記録：01a09a97-f59f-7ba5-8380-19a3c2bd065f

- 藍の抜染と木版による印刷を用い、赤・黄を青白の地に加えた。 [Strawberry Thief — Victoria and Albert Museum](https://collections.vam.ac.uk/item/O78889/)

  主張定義：9b0ec772-04d0-56b9-9183-ec82ee0555b2 / 主張記録：01a09a97-f59f-7e1a-8dd4-6238f5d16acc

- モリスのテキスタイルは反復模様と身近な草花を中心に発展した。技法や製造には協働があった。 [William Morris textiles — Victoria and Albert Museum](https://www.vam.ac.uk/articles/willam-morris-textiles/)

  主張定義：0c4ca8e1-9c98-5972-8382-c8149bb39ee9 / 主張記録：01a09a97-f59f-7d03-8db8-d1ebd40ee1ac

## Material Sphereの提案

小さな葉の対をタイル状に繰り返し、濃い地色の上に花のアクセントを置く。

色は試作の選択値：#183b36、#e4d4ac、#9bad77、#ac5148。

植物の細密さや織物の触感は再現しない。図柄の反復規則は証明できても、原作と同一とはしない。

## 接続した計算規則

- [ArtPlanetarium.tile_repeats_after_any_number_of_spans](../../formal/ArtPlanetarium/Proofs.lean) — 5c5d6531-8da0-52ae-a83d-7e2b09c034e8
- [ArtPlanetarium.mirror_twice_recovers_coordinate](../../formal/ArtPlanetarium/Proofs.lean) — 877ba798-c744-5eb0-b185-f3be495e3b90
- [ArtPlanetarium.mirrored_pair_preserves_span](../../formal/ArtPlanetarium/Proofs.lean) — 83947bb4-a245-5c80-9886-582d09120cf0

画面での見え方・操作・速度は未検査です。[検査報告](../../reports/gate-report.md)で確認範囲を示します。

<!-- llm machine contract; state: proposed interpretation; transition: claim-linked profile -> human review; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867; execution UUIDv7: 01a0a48b-cf79-770e-a05f-eee1d6a3021e -->
