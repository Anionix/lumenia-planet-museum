# 時計と描画の修正レビュー

対象課題: https://github.com/Anionix/lumenia-planet-museum/issues/11

比較元: c27c8851c7aa2f0f7130786d58a2089cdf5cbe2f。時計・描画修正 e1bf94f を、既存の仕様と規則の二つの観点から確認した。

## 規則

明文化された規則への違反はなし。時間上限が3ファイルに重複する指摘を採用し、共通の展示上限にまとめた。

## 仕様

スライダーを戻す途中で最大値まで縮んでしまう指摘を修正した。範囲は自動的に広がるが、値を戻しても縮まない。上限に達したら再生を停止する。

実際の描画関数で描画器と画面環境だけを置換した確認では、120回／秒の操作に対する描画が120回から26回へ減った。非表示・解放後は0回だった。これはブラウザーの性能実測ではない。

120秒をまたぐ Gropius の1フレームの移動は20.1209から0.01529展示単位へ変わり、飛び移りが解消した。回帰テストは修正前に2件失敗し、修正後に成功した。原本・特徴座標・物理の標準無効は変更していない。

一次資料: [Three.js 資源解放](https://threejs.org/manual/en/how-to-dispose-of-objects.html)、[React Effect](https://react.dev/reference/react/useEffect)。

<!-- llm machine contract; UUIDv5: 307bb7f3-f518-59db-bbaf-a56492eae6be; UUIDv7: 01a0a59f-3ad4-7149-bed4-3dcf19252d7a; transition: three reproduced defects -> failing regression -> implementation -> two-axis review -> corrected range and shared bound. -->
