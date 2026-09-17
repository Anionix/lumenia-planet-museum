---
type: Material Interpretation
title: "ヘルベルト・バイヤー — Material Sphere"
profile_identifier: aa8db2eb-17e5-5771-8443-94445af34296
person_identifier: 8066869d-a972-5884-a2e3-8df1e3af3f52
source_revision: sha256:9478a5e17024ef21aaf5239ea2f13ffac7885ead15d95ef4607e5be55fd781bd
execution_identifier: 01a0a48b-cf79-770e-a05f-eee1d6a3021e
interpretation_status: proposed
---

# ヘルベルト・バイヤー — Material Sphere

参照範囲：Universal alphabetとバウハウス期の文字構成（1920年代の文字設計を対象）

## 資料から読んだ特徴

- Universal alphabetは円弧・角・水平垂直線を用いて小文字の形を整理した。 [Herbert Bayer biography — Cooper Hewitt](https://collection.cooperhewitt.org/people/18059359/bio)

  主張定義：434d8cc1-9c10-5f8e-9204-4084bb884a23 / 主張記録：01a09a97-f59f-7a31-b2a2-270f4a75e514

- 情報の重要度に応じて文字の大きさや太さを変え、棒・長方形などで面を分けた。 [Herbert Bayer biography — Cooper Hewitt](https://collection.cooperhewitt.org/people/18059359/bio)

  主張定義：b584280c-f997-5cbb-87f3-1e58f4919461 / 主張記録：01a09a97-f59f-746c-aa9f-07ec5fd11f32

- 写真・フォトモンタージュや展示の設計も行っており、幾何学的な文字だけが仕事ではない。 [Herbert Bayer — MoMA](https://www.moma.org/collection/artists/399)

  主張定義：bee6e48e-4d19-5744-b494-937b005052f7 / 主張記録：01a09a97-f59f-7c13-93cc-b8d768866540

## Material Sphereの提案

円弧と棒の組合せを共通の格子へ載せ、大小二段階の幾何学的な記号を作る。

色は試作の選択値：#e8deca、#212627、#c8503d。

既存書体の再実装ではない。文字が読めることや情報の理解しやすさは別途、人と画面で検査する。

## 接続した計算規則

- [ArtPlanetarium.grid_coordinates_are_aligned](../../formal/ArtPlanetarium/Proofs.lean) — d945cf70-cb97-54bf-be14-2189e6abda31
- [ArtPlanetarium.orthogonal_angles_are_quarter_turns](../../formal/ArtPlanetarium/Proofs.lean) — 29c0bf35-24d1-5f7f-80b2-03be0b636ae4

画面での見え方・操作・速度は未検査です。[検査報告](../../reports/gate-report.md)で確認範囲を示します。

<!-- llm machine contract; state: proposed interpretation; transition: claim-linked profile -> human review; artifact UUIDv5: e67bec4e-cc81-54b8-8de8-e04f06503867; execution UUIDv7: 01a0a48b-cf79-770e-a05f-eee1d6a3021e -->
