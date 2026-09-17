# 15の宇宙を探索する

15枚の参考画像から、惑星・環・格子・建物・曲面を新しく造形しました。作家本人の作品や、画像から正確に復元した空間ではありません。「作品の手がかり」から元画像と一次資料を開けます。

画面をドラッグすると見る向きが変わります。ボタンで前後左右上下へ移動できます。画面を選択して W A S D で移動、Q E で上下、Shift で速度を上げられます。「入口へ戻る」で開始位置に戻り、「別の宇宙へ」で世界を選べます。

衝突は初期状態では無効です。「壁や地面にぶつかる」を有効にした時に必要な物理ライブラリを読み込みます。台へ移動して「ゆっくり着地する」を選ぶと降下できます。画面の1単位を1メートルとし、速度は通常8メートル毎秒、最大16メートル毎秒、1回の移動時間は最大0.05秒、観察者の半径は0.4メートル、接触の隙間は0.05メートルです。すべて展示用の設定で、実測値ではありません。

入った世界の立体データだけを取得します。料金の発生する生成サービスや外部の素材サービスは使用せず、Three.jsとRapierの固定した版をサイトに含めています。

Leanは10定理と補助証明を検査し、公理依存がすべて空です。Wolframは回転、速さ、移動と座標の上限、環の通路を検算します。実際の描画・衝突は別に確認しています。元資料の特徴座標12件と未設定3件は、画面上の移動から独立しています。

[ソースと検証記録](https://github.com/Anionix/lumenia-planet-museum/tree/codex/fifteen-explorable-worlds)を取得し、`node scripts/verify-exploration.mjs`で再確認できます。

立体データを意図して作り直す場合だけ、`node scripts/build-exploration.mjs`を実行し、差分と検証記録を確認してください。通常の`npm run build`は登録済みデータをそのまま公開用にコピーします。

一次資料: [Three.js の自由飛行](https://threejs.org/docs/pages/FlyControls.html)、[Three.js の色管理](https://threejs.org/manual/en/color-management.html)、[Rapier の移動と衝突](https://rapier.rs/docs/user_guides/javascript/character_controller/)。
