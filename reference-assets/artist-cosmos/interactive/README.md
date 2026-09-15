# 15枚の宇宙を動かす展示

このフォルダで `node serve.mjs` を実行し、表示されたローカルのアドレスをブラウザで開きます。依存する描画・物理ライブラリは同梱してあります。画像と元の資料は上書きしません。

- 「一枚ずつ」：作家を選び、ドラッグで視点を回す。ホイールや二本指で拡大する。
- 「15枚を並べる」：展示全体を見る。画像のダブルクリックで一枚の鑑賞に戻る。
- 「浮かべる」：小さく揺らす。「動きを止める」で停止する。
- 「画像をつかむ」：画像のパネルをドラッグして移動する。
- 「物理で遊ぶ」：Rapierを読み込み、パネル同士の衝突と慣性を有効にする。初期状態は無効。
- 「落下させる」「ふわっと押す」：重力や力を加える。
- 「配置を戻す」：物理演算を無効にし、展示の初期位置を復元する。

画像を貼った薄い立体のパネルを動かす試作です。画像内の惑星や建物を自由な角度から見る立体モデルは含んでいません。

描画はWebGL2の対応を実際に確認してから開始します。対応しない環境では静止画の一覧へ移動できます。画面を隠している間は描画を止め、動きを減らす設定に対応します。

資料の特徴を示す12人の座標は独立した変更できない参照として保持し、未設定の3人は未設定のままです。物理演算の位置は類似度計算には使いません。長さはメートル、質量はキログラムとして扱う展示用の設定で、実測値ではありません。時間を一定の細かな刻みで進め、長い停止後の急な飛び出しを抑えます。

使用版：Three.js 0.186.0 / Rapier 0.12.0。この環境にある版を固定して使用しています。`exhibition.json` に画像・資料・物理設定の対応、`dependencies.json` に使用ファイルと照合値を保存しています。識別子はUUID version 5、操作の記録は時刻を含むUUID version 7です。

一次資料：

- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [Three.js OrbitControls](https://threejs.org/docs/pages/OrbitControls.html)
- [Rapier rigid bodies](https://rapier.rs/docs/user_guides/javascript/rigid_bodies/)

確認：`npm test`。実際の物理エンジンによる衝突・落下・ドラッグ、時間刻み、資料の座標が変わらないことを確認します。

## Lean と Wolfram による確認

`verification/Exhibition.lean` の19件の証明は、補助証明を含めてすべて依存公理が空です。`propext`、`Classical.choice`、`Quot.sound`、未証明の穴は使っていません。監査の出力は `verification/lean-axioms.txt` にあります。

Leanでは、現在の小数第2位までの座標を100倍した整数として扱い、座標の範囲、距離の二乗、表示位置を動かしても資料の座標と距離が変わらないこと、15枚の初期配置が重ならないこと、理想化した一定の時間刻みと上限を確認しています。未設定の3人の座標は推測しません。

Wolframでは、実数の特徴値の差と正規化した2成分の合成の範囲に加え、12人・66組の距離、初期配置、時間刻みを検算しました。10項目すべて通過しています。元の式は `verification/wolfram.wl`、計算結果は `verification/wolfram-receipt.json` に保存しています。

`node verification/verify.mjs` で、元画像の照合、Leanの再実行と全証明の公理監査、保存済みWolfram結果と現在の入力の一致、実際のRapierの動作テストをまとめて確認できます。Wolframの遠隔計算はこのコマンドでは再実行しません。入力を変えた場合は、Wolfram側でも式を再評価し、結果を更新する必要があります。

19件の形式証明は上記の数理モデルが対象です。ブラウザの描画とRapierの衝突計算は、実行テストとブラウザ操作で別途確認しています。`verification/verification.json` に確認対象と結果を記録しています。

式を評価する仕組みの一次資料：[Wolfram Resolve](https://reference.wolfram.com/language/ref/Resolve.html)。描画と物理演算の一次資料は上のThree.js・Rapier公式文書です。
