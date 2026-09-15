# 15世界への展開の確認

記録識別子: 1f48c934-c233-51d6-b99c-5c8e6e5278d0

仕様と実装規則を別々に確認した比較は ff276507ffad6dd57b4823dc20b9f8a2cfbe7d0a から 7de9867e9fbd599c5fb351c913d59a1335e8c97b。

仕様側では、15の原画像・資料・特徴座標と探索世界の対応に不一致は見つからなかった。特徴座標12件・未設定3件を保持し、各画像から別の世界へ入れる。

実装規則側では、チャールズ・イームズの殻の面が逆を向く問題を発見した。断面の順序を修正し、符号付き体積が正になる確認を追加した。グロピウスの入口では初期の高さが梁と重なったため、入口の見どころを2メートルへ修正し、衝突を有効にして入室する回帰確認を加えた。

全15世界で形状生成、通路、着地、解放を実Rapierで確認する。ブラウザーで全世界の選択と、初期に1世界だけを取得し物理を取得しないことを確認した。開発中のデータ更新では照合値の不一致を検出し、再読込で復旧した。更新時の案内も追加した。

一次資料: [Three.js LatheGeometry](https://threejs.org/docs/pages/LatheGeometry.html)、[Three.js Material](https://threejs.org/docs/pages/Material.html)、[Rapier character controller](https://rapier.rs/docs/user_guides/javascript/character_controller/)。
