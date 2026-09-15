# ソットサスの宇宙の確認

記録識別子: be15d308-d6c7-5b93-aca4-32206c14ac81

第2段階の比較は f5e9b42b0618f5e09470814f589009793945c7f2 から 4426e0d5df678b5de5e95e83cdd021b672ef22cb。仕様と実装規則を別々に確認した。

仕様の確認では、世界を読み込む途中で衝突を選ぶと表示と状態が食い違う経路を修正した。準備中の操作を無効にし、世界の準備完了と同時に状態を揃える。実際の関数に120Hzの入力を与えた独立確認では描画26回／秒、非表示中0回だった。実Rapierで環を通過し、台への着地後に追加240回下降を試みても高さは変わらなかった。

実装規則の確認では、探索ページを公開検査の契約へ追加した。星雲の独自描画にはThree.jsの明るさと出力色の変換を加えた。参考画像の記録時刻は referenceRecordedAt と明示する。

Leanの10定理と補助証明の公理依存は空。標準の最小値の補題に依存すると公理が混ざったため、上限を適用する関数を再帰で定義して証明した。Wolframは実数の回転・速さ・上限・通路を担当し、JavaScriptとRapierの実行結果は別に保存する。

再実行: `node scripts/verify-exploration.mjs`。

一次資料: [Three.jsの色管理](https://threejs.org/manual/en/color-management.html)、[Three.jsの自由飛行](https://threejs.org/docs/pages/FlyControls.html)、[Rapierの移動と衝突](https://rapier.rs/docs/user_guides/javascript/character_controller/)。
