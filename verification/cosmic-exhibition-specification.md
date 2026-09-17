# 宇宙展示の仕様

対象は15人の既存Material Sphere。太陽・軌道・天体の大きさは鑑賞用の演出。
人物の歴史的影響関係、実際の太陽系、重力モデルを示すものではない。

## 保持する情報

人物、参照作品、出典、特徴座標、作品年代、展示軌道をそれぞれ識別する。
JSON Linesを資料の正本とし、画面用の小さいJavaScriptデータを生成する。
OpenKnowledgeFormatを参考に出典と解釈を分ける。公式形式への完全準拠を主張しない。

特徴座標は提供された12人分のみ。Charles Eames、Ray Eames、Walter Gropiusは未提供。
画面の位置から類似度を計算しない。類似度の計算器は元の座標の独立した保存値を使う。

年代は参照作品の年または期間。Bayerは1920年代、Mackintoshは年未特定。
Kawakuboは2017年の展覧会の開催年で、すべての衣服の制作年を意味しない。
Ramsは606の発売、SottsassはCarltonを選んだ年代で、人物の活動全体の開始年ではない。

## 操作と軽量化

一覧または球を選び、資料と制作室へ進む。ドラッグ・左右キーで回転、指2本・拡大縮小ボタンで距離を調整する。
年代の範囲は閉区間の重なりで選ぶ。年未特定の資料は別の選択条件にする。
動きの位置と作品年代は別操作。天体の選択時に動きを止める。

描画を画面内で遅延読み込みする。既定は静止。停止・背景タブ・画面外・動きを減らす設定では連続描画しない。
30フレーム毎秒、画素比1.5、800個の星、20,000三角形、40描画命令を上限とする。
これらは仕様上限。ブラウザーの実測なしに、速度や端末間の見た目の一致を合格としない。
描画に失敗しても、人物一覧と出典は読める。

## 物理と検証

物理演算は無効。Rapierの剛体種別を扱える接続契約を保持するが、標準の画面では本体を読み込まない。
物理量には単位と実測／演出設定の出自を要求する。実測には出典を要求する。

Leanは画面位置と特徴座標の独立、非負整数で表す差の正負成分、年代区間の性質を7定理で検証する。
Wolframは実数の差の範囲、三角関数による軌道半径、区間の性質を検算する。
JavaScriptは実データ、浮動小数点の例、無効な入力、物理の既定動作を検査する。
いずれも歴史的解釈や画面の美しさを数学的真実として証明しない。

一次資料:

- [Three.jsの材質](https://threejs.org/docs/pages/MeshStandardMaterial.html)
- [Rapierの剛体](https://rapier.rs/docs/user_guides/javascript/rigid_body_type/)
- [Reactの外部処理の接続と解除](https://react.dev/reference/react/useEffect)
- [Next.jsの遅延読み込み](https://nextjs.org/docs/app/guides/lazy-loading)
- [PlumeriaのNext.js対応](https://plumeria.dev/docs/api-reference/plugins/next-plugin)
- [Knowledge Catalog](https://github.com/GoogleCloudPlatform/knowledge-catalog)
- [開発工程の参考](https://claude.com/blog/the-ai-native-sdlc-playbook)

<!-- llm machine contract; claim UUIDv5: 190fdb1a-2e41-565d-9aed-9fe5ca2179a6; execution UUIDv7: 01a0a466-8ef5-7ceb-9da0-c6195d4d86ab; transition: agreed scope -> implementation -> independently scoped validation -> publication. -->
