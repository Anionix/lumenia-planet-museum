# 探索する宇宙の公開確認

記録識別子: 412e8b73-734a-5d4c-84f7-29d8a7dd91d2

15の参考画像から、それぞれ異なる立体の宇宙に入れます。共通の操作で前後左右上下に飛行し、衝突と着地は必要なときに有効にします。特徴を表す座標12件と未設定3件は移動から独立しています。

[Sitesで探索する](https://lumenia-planet-museum.anionix.chatgpt.site/cosmos/explore/?world=ettore-sottsass) · [Vercelで探索する](https://lumenia-planet-museum.vercel.app/cosmos/explore/?world=ettore-sottsass)

公開したソースは `781938bf2cfef86d1309c08484e2242cf8934533`。Sitesの公開版6は成功、Vercelは準備完了になりました。Vercelの27ファイルは手元の成果物と一致しています。Sitesでは15の入口、ソットサスとチャールズ・イームズへの入場、前進を実際に確認しました。

109テスト、型検査、本番ビルド、アプリケーションの6検査に合格しました。探索の10定理はLeanとその言語サーバーで公理依存が空であることを確認し、Wolframの6条件も成立しています。15の世界すべてで実際の衝突ライブラリを使い、通路と着地を確認しました。数理証明は描画や衝突処理そのものの証明ではありません。

ブラウザーでは15世界の切り替えと、1世界だけの初期読み込みを確認しました。グロピウスの建物へ入室でき、390 × 844の表示で上下移動できます。検査後に表示サイズの変更を戻しています。他のブラウザーと携帯実機の性能は未測定です。

変更提案は、時計と描画上限の修正 #14、15枚の公開接続 #15、その確認記録 #16、ソットサスの立体探索 #17、15世界への展開 #18、今回の検算と公開記録に分けています。既存の変更提案は自動で統合していません。

再確認する際は `reports/exploration-verification.json`、`reports/fifteen-worlds-browser.json`、`reports/exploration-publication.json` の入力照合値・実行識別子・時刻を使用してください。公開後の記録を追加したコミットと、上記の公開コミットは異なります。

一次資料: [Three.js の自由飛行](https://threejs.org/docs/pages/FlyControls.html)、[Three.js の色管理](https://threejs.org/manual/en/color-management.html)、[Rapier の移動と衝突](https://rapier.rs/docs/user_guides/javascript/character_controller/)。
