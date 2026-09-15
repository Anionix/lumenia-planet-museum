# 画像から入る15の宇宙

記録識別子: 1f48c934-c233-51d6-b99c-5c8e6e5278d0

## 目的

15枚の参考画像を入口にし、前後・左右・上下へ移動して、惑星の裏側や環の内側へ行ける。最初はソットサスの世界を完成させ、共通の操作を残る14世界へ広げる。無料で動く静的サイトとして、既存の公開先を更新する。

## 決定済みの構成

- 既存展示の不具合を修正し、参考画像と現在の画像操作を先に公開する。
- 参考画像の原本と出典記録を保持する。探索世界は資料に基づく新しい再構成と明示する。
- 各世界は本当の立体形状を持ち、裏側にも回れる。背景画像だけの表示を完成とはしない。
- Three.js と WebGL 2 を使う。選択した世界の設定だけ読み込み、退出時に表示資源を解放する。
- 自由飛行は初期状態で利用可能。Rapier は衝突を利用者が有効にした後に読み込む。着地と衝突の単位・演出値を記録する。
- 写っていない形は新しく設計する。画像から正確な奥行きを復元したとは記載しない。
- 表示位置と特徴座標を分離する。未設定の3人に座標を推測して付けない。
- 非表示の画面では描画を停止する。動きを減らす設定を守り、静止画と通常のリンクを代替として残す。
- 保存情報には安定した UUIDv5、実行記録には UUIDv7 と時刻を記録する。

## 確認する境界

利用者が指定した数理検算、実際の探索操作、既存サイトへの公開結果を確認する。計算関数の独立した入力例、実際の Rapier、ブラウザーの操作、配信されたファイルを証拠とする。

- Lean の全対象定理と補助定理で `#print axioms` の依存集合が空。未証明の埋め草や実行結果を信用する証明を禁止する。
- Wolfram の実行結果を、評価した式と入力のダイジェストに結び付ける。
- 座標と距離の不変条件、移動量と描画間隔の上限、環の通路の余裕を検算する。
- ソットサスで環を通過し、惑星の裏側まで移動する。残る14世界も個別に入退出できる。
- マウス・キーボードと画面上の操作、狭い画面、物理の有効化と無効化、退出時の停止を確認する。
- GitHub は差分と確認内容を目的別に分けた変更提案として保存する。公開ソースと静的出力が一致することを確認し、Sites と Vercel の公開状態を読み直す。

## 作業の順番

1. 現在の展示の修正・資料と画像の接続・既存2か所への公開。
2. ソットサスの探索と共通の操作・数理検算。
3. 残る14世界への展開・全世界の確認・公開更新。

## 一次資料

- [Three.js の自由飛行](https://threejs.org/docs/pages/FlyControls.html)
- [Three.js の資源解放](https://threejs.org/manual/en/how-to-dispose-of-objects.html)
- [Rapier の移動と衝突](https://rapier.rs/docs/user_guides/javascript/character_controller/)
- [Lean の公理監査](https://lean-lang.org/doc/reference/latest/Elaboration-and-Compilation/Elaboration/)
- [Knowledge Catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog)
- [Anthropic の開発工程](https://claude.com/blog/the-ai-native-sdlc-playbook)

<!-- llm machine contract; UUIDv5: 1f48c934-c233-51d6-b99c-5c8e6e5278d0; UUIDv7: 01a0a59f-3ad4-7149-bed4-3dcf19252d7a; transition: accepted goal -> inspected existing state -> scoped changes -> independent verification -> source publication -> deployment readback. -->
