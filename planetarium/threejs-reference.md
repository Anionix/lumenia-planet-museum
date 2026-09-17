# three.js で資料を使う

共通の資料から、球体・配色・表面の規則を描画用のデータへ変換できます。three.js 0.186.0 で確認しています。

- 元の資料: `illustration-design-reference.jsonl`
- 描画用の共通データ: `generated/render-recipes.jsonl`
- three.js がそのまま読めるシーン: `generated/threejs-reference-scene.json`
- 変換処理: `lib/threejs-reference-adapter.mjs`
- 物理演算の任意接続口: `lib/reference-physics-contract.mjs`

## 書き出しと閲覧

プロジェクトのルートで実行します。

```sh
node planetarium/scripts/export-threejs-reference.mjs
node --test tests/threejs-reference-adapter.test.mjs
node planetarium/scripts/serve-threejs-reference.mjs
```

`http://127.0.0.1:4187` を開くと、一覧・特徴座標・人物ごとの拡大表示を切り替えられます。サーバーは表示に必要なファイルだけを同じコンピューターへ配信します。

書き出したシーンを既存の three.js アプリへ置けば、標準の読み込み処理で使えます。

```js
import { ObjectLoader } from 'three';

const reference = await new ObjectLoader().loadAsync('/threejs-reference-scene.json');
scene.add(reference);
```

独自の描画用レシピから一つだけ作る場合は、`createThreeObject(recipe)` を呼びます。球と箱に対応し、色・粗さ・金属らしさ・不透明度を明示的に指定できます。色の管理は three.js の標準設定を有効にした状態で使います。

## 座標と物理演算

| データ | 用途 |
|---|---|
| `semantic_position` | 資料の特徴座標。単位なし。検索と類似度計算の基準 |
| `transform` | 画面上の位置・回転・大きさ。表示用の単位 |
| `physics` | 標準は `enabled: false`。必要な展示だけで明示的に有効化 |

`createSemanticCoordinateIndex(recipes)` は、資料座標の変更できない写しを保持します。`distanceBetween(firstIdentifier, secondIdentifier)` はその写しで距離を計算します。画面上の球が動いても結果は変わりません。書き出されたシーンの `userData` は出典確認用です。類似度の計算元には、この座標索引を使います。

物理演算のエンジンはまだ接続していません。将来の接続先は `connectOptionalPhysics(scene, recipes, adapter)` です。標準の無効状態ではエンジンを初期化せず、時間の更新も行いません。有効化には、対応するアダプターの識別子と物理用設定を指定します。呼び出し側が `step(seconds)` を呼び、終了時に `dispose()` を呼びます。

将来のアダプターは `identifier` と `connect(bodies)` を実装します。各 `body` には `recordIdentifier`、`specification`、`readDisplayTransform()`、`writeDisplayTransform({ position, rotation_quaternion })` が渡ります。接続後は `step(seconds)` と `dispose()` を返します。時間は秒、回転は長さ1の四成分です。1回の更新は0〜0.25秒の範囲とし、表示が止まっていた時間は呼び出し側で分割します。

物理用設定には次を必須にしています。

- 球の半径、箱の半寸法: メートル。
- 質量: キログラム。
- 摩擦と反発: 単位なし。反発は 0〜1。この接続契約で受け付ける摩擦は 0〜10。
- 表示上の1単位が何メートルかを表す換算値。
- 各数値の由来: `measured` または `presentation_setting`。実測と宣言する値には出典の UUIDv5 を付けます。

数値の形は `{ value, unit, value_origin, source_identifier }` です。実測でない値の `source_identifier` は `null` にします。衝突形状の寸法は、表示サイズとは別に明示します。将来のエンジンアダプターは、この換算値を使って表示単位とメートルを相互変換し、衝突形状と表示サイズを確認する責任を持ちます。接続口からエンジンへ渡るのは物理用設定と表示位置の読み書きだけです。

## 今回の範囲

配色と座標の両方が揃う12人を出力します。Charles Eames、Ray Eames、Walter Gropius は配色がありますが、資料の座標がないため配置を作っていません。位置は元の値を保ち、同じ大きさの球が重ならない半径を選びます。一覧モードでの並べ替えは表示だけに適用されます。

表面は既存の試作配色と模様の規則を描いたものです。粗さ 0.75・金属らしさ 0・不透明度 1 は共通の表示設定です。天然素材の測定値、元作品の立体形状、人物の品質評価を表していません。文章のプロンプトやすべての技法が、自動的に立体形状になるわけではありません。

描画の識別子は UUIDv5、書き出しの記録は UUIDv7 です。検査報告には入力・描画用データ・シーンのハッシュを残しています。元の座標は入力スコアが未収録なので、元スコアから再計算済みとは扱いません。

一次資料: [three.js の材質仕様](https://threejs.org/docs/pages/MeshStandardMaterial.html)、[標準のシーン読み込み](https://threejs.org/docs/pages/ObjectLoader.html)、[Rapier の剛体の種類](https://rapier.rs/docs/user_guides/javascript/rigid_body_type/)、[衝突形状と物理用設定](https://rapier.rs/docs/user_guides/javascript/colliders/)。
