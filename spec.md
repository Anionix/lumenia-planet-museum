---
type: Design Specification
title: Lumenia 検算仕様
status: draft
sources:
  - id: lean-language-server
    resource: https://github.com/oOo0oOo/lean-lsp-mcp
    title: Lean Theorem Prover MCP
  - id: meshopt-specification
    resource: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_meshopt_compression/README.md
    title: KHR_meshopt_compression
  - id: next-component-boundary
    resource: https://nextjs.org/docs/app/getting-started/server-and-client-components
    title: Next.js Server and Client Components
  - id: knowledge-format
    resource: https://github.com/GoogleCloudPlatform/open-knowledge-format
    title: Open Knowledge Format
  - id: development-process
    resource: https://claude.com/blog/the-ai-native-sdlc-playbook
    title: The AI-native SDLC playbook
---

# 入力と成果物

この仕様は [intent.md](intent.md) を入力として読む。次に形式検証処理が両文書とソースを読み、[証明報告](reports/proof-report.md) を生成する。出荷ゲートは証明報告と測定証跡を読み、[ゲート報告](reports/gate-report.md) を生成する。

文章中の「証明済み」を合格根拠にしない。現在の判定は生成報告を参照する。各入力ファイルのSHA256からソース改訂を計算し、途中の変更と過去の証跡を検出する。

# 資産検証の意味

`RawAssetFlags` は資産全体の拡張利用状況、`AssetPipelineOptions` は復号器・保持設定の観測値を表す。別々のプリミティブや画像が異なる方式を使えるため、資産全体を一つの方式に限定しない。`MeshEncoding` と `TextureEncoding` の列挙値は方式の名前であり、ファイルの内容を観測した証拠ではない。

`AssetRequirementsSatisfied` は必要条件を論理式で定義する。`assetChecks` は真偽値で実装した検証関数である。両者の一致を証明してから、`validateRawAsset : RawAssetFlags → AssetPipelineOptions → Option ValidatedAsset` の受理・拒否を証明する。

`ValidatedAsset` は入力と設定、その入力に対する検証関数の成功証明を保持する。成功時に入力がすり替わらないことも独立に証明する。JSONの12個の真偽値はLeanで厳密に読み取り、欠落・文字列・数値・配列・nullを拒否する。JSONの識別子、形式、未知の項目は外側の契約検査が担当する。JSONパーサー全体の正しさを証明したとは主張しない。

| 必要条件 | 公開定理 |
| --- | --- |
| 検証実装と独立した仕様が同値 | `Lumenia.asset_checks_iff_requirements` |
| 必要条件を満たす入力を、過不足なく受理 | `Lumenia.validate_raw_asset_accepts_iff` |
| 不正入力を必ず拒否 | `Lumenia.validate_raw_asset_rejects_iff` |
| 成功時に入力・設定を保持 | `Lumenia.validate_raw_asset_preserves_input` |
| Meshopt二方式の資産全体排他 | `Lumenia.meshopt_variants_are_exclusive` |
| EXT方式にMeshopt復号器が必要 | `Lumenia.extension_meshopt_requires_decoder` |
| KHR方式にMeshopt復号器が必要 | `Lumenia.khronos_meshopt_requires_decoder` |
| KTX2に対応ローダーが必要 | `Lumenia.ktx2_requires_loader` |
| Draco有効化には明示利用とローダーが必要 | `Lumenia.draco_requires_loader` |
| 名前付きノードの保持が必要 | `Lumenia.named_nodes_require_preservation` |
| extrasの保持が必要 | `Lumenia.extras_require_preservation` |

Meshoptの資産全体排他はLumenia独自ポリシー。Khronosの局所禁止より強い。KHR方式は参照時点でRelease Candidate、初期既定はEXT方式。KTX2とWebP、DracoとMeshoptについては、異なる要素での併用を一律禁止しない。復号器フラグは「使用する形式に対応する復号器が利用可能」という観測であり、実際のThree.jsの版・拡張対応・登録内容は外部ゲートで照合する。

# 出荷履歴

`Lumenia.shipment_trace_is_exactly_optimize_validate_ship` は、任意の有限イベント列について次の同値を証明する。

```lean
runTransitions .source events = some .shipped ↔
  events = [.optimize, .validate, .ship]
```

段階を飛ばす列、検証を繰り返す列、拒否後の再開、出荷後の追加イベントを受理しない。`ArtifactHistory` は前段階と同じ資産識別子・ソース改訂・入力・設定を保持し、検証段階で成功証明を要求する。`Lumenia.invalid_asset_has_no_shipped_history` が不正入力の出荷履歴を構築できないことを示す。

この履歴はモデル内の規則である。最適化処理やglTF Validatorが実行されたことは外部証跡で確認する。

# 部品配置と転送量

通常の表示処理はServer ComponentsとClient Componentsの両方で許可する。`serverOnly` はリクエスト時にサーバーを必要とする機能で、ビルド時の描画を指さない。Static ExportとClient Componentsではこの機能を禁止する。ブラウザー機能・状態・イベント・三次元描画を含む要求リストはClient Componentsを要求する。Server/Clientが混在するReactの配置と、モジュールの読み込み関係は実コードを外部で調べる。

HTML 30、JavaScript 120、CSS 20、フォント20、メタデータ10キビバイトを上限とする。`Lumenia.core_transfer_total_within_budget` は個別上限から合計204800バイト以下を導く。JavaScriptの復号器コードもコア予算に含め、作品データ本体だけを別枠にする。実際の転送量、復号時間、画像処理装置のメモリ使用量は測定値である。

# 証跡と検査

主張・型・定義のUUIDv5は [claims.json](contracts/claims.json) に完全名と対応付ける。名前空間と完全名から再計算できる。修正時のUUIDv7はコードコメント、検算実行ごとの新しいUUIDv7は報告に記録する。旧版の手入力識別子は新しい主張の識別子として再利用しない。

| 検査 | 合格条件 |
| --- | --- |
| `lean_build` | 全体の構築成功 |
| `lean_diagnostic_messages` | エラー0・警告0・時間切れなし |
| `lean_goal` | 指定した証明末尾の未完了ゴール0 |
| `lean_hover_info` | 指定した完全名の型が解決 |
| `lean_verify` | 全登録定理で推移的な公理依存0・危険パターン0 |
| `lean_file_outline` | 宣言の構造が取得可能 |

全登録定理の公理依存をゼロにする。Lean標準の `propext`、`Quot.sound`、`Classical.choice` も自動承認しない。`#print axioms` と `lean_verify` の両方で、定義や補助定理を経由した依存まで記録し、空でない依存一覧・未取得の結果を不合格にする。この規則は標準公理が不健全という意味ではなく、今回の有限論理・履歴・自然数の設計に不要な前提を増やさないためである。例外が本当に必要になった場合は、理由と対象定理を提示し、利用者の承認前に規則を緩めない。プロジェクト全Leanソースを検査し、`sorry`、独自公理、`native_decide`、検査回避を拒否する。

実装時の公理依存削減では定理の文を変更しない。状態遷移20通り、配信条件12通り、部品配置12通りの完全な表を回帰検査し、分岐の書き方を変更しても意味を保つ。

受理できる資産が存在する正常例と異常例をLeanで検算する。さらに全4096通りの真偽値の組合せで、コンパイルしたLean関数とJSON側の検証結果を照合する。これは真偽値部分の相互確認であり、ブラウザーやファイル解析器への保証ではない。

結果は `pass`、`fail`、`blocked`、`staleEvidence` のみ。合格には現在のソース改訂、同じ型の観測値と上限値、単位、使用工具、UUIDv7、失敗理由欄が必要。合格時の失敗理由はnull。数値は有限の非負値に限定する。説明文字列は観測値として受理しない。未観測・未設定の上限はnullで記録し、blockedとする。古い改訂の証跡はstaleEvidenceになる。

# 外部測定の接続境界

[external-gates.json](contracts/external-gates.json) は、現在のCSSアプリの出荷条件と、別系統の資産検証例を分離する。前者はPlumeriaの書式・生成物、Next.jsの境界、CSS以外の描画依存の排除、転送量、描画時間、四ブラウザー×四段階を検査する。後者はThree.jsと資産拡張の一致、gltfpack、glTF Validatorを保管する。ゲート処理は検算報告形式の測定証跡を読み、単位と上限の一致、欠落、古い改訂を検査する。

実アプリは `web/` に配置したNext.js Static Exportの作品閲覧画面である。利用者の追加指示により、線・面・立体をすべてPlumeriaが出力するCSSで描く。線は輪48本、面は半透明の帯24本、立体は不透明な面288枚。空の基盤・線・面・立体の四段階で、停止・再生・速度変更・視点変更・初期化を共有する。旧SVG・Canvas・WebGL段階の証跡と識別子を現在のCSS段階に転用しない。Plumeriaは公式検査器、公式変換器、生成JavaScript、ソースマップ、クライアントのモジュール一覧を検査する。変更時のCSS欠落を防ぐため、Next.jsの生成キャッシュを退避して本番ビルドする。

三作品の主張は `contracts/css-artworks.json` に固定する。主張識別子UUIDv5は線 `5cdd969e-a78b-57cd-b751-2a5178fd8bf8`、面 `c4bcac49-0537-5c14-bd67-b86730c65e1d`、立体 `cfd40913-811f-5276-bc77-f1466fdd3fdb`。変更実行UUIDv7は `01a09a1a-e883-7d76-b209-e3f58830b29e`。llm machine contract: 描画方式の混在 → 共通のHTML部品とPlumeriaの静的CSS → ブラウザーがアニメーションを進める。JavaScriptを無効にした独立画面でも三作品が回転すること、SVG・Canvas・画像がないこと、停止中の変換行列と時刻が変わらないこと、速度・初期化・動きを減らす設定を測る。起動時だけ二回の表示機会を待ち、毎フレームのJavaScript描画は実行しない。CSSの描画回数や実メモリは不明なのでnullとする。Plumeriaのゼロランタイムはスタイルライブラリーの実行処理が残らない意味であり、ブラウザーの描画負荷ゼロを意味しない。立体は有限個の面による近似、色は固定であり、実時間の照明計算ではない。これらは実装と測定の主張であり、Leanの公理として追加しない。

実コードの境界検査は、型検査と本番ビルドに加え、固定した小さな文法の構文木・読み込み関係を検査する。判定できない動的読み込み、名前空間の別名、内容不明の属性展開は拒否する。これは任意のJavaScript全体の形式的証明ではない。現在の配信物にはThree.js・glTF資産・復号器を含めない。参考資産用の厳密な境界関数は残し、全項目と実バイトの要約値・拡張を照合する。この実関数とコンパイル済みLeanの全4096通りをテストする。

別系統の検証例として、自作の輪の立体資産をgltfpackの `-cc -kn -ke` で最適化し、glTF Validator・名前と追加情報の保持・Leanの境界関数を通す。現物は `artifacts/asset-fixtures/` に保管し、アプリから配信しない。旧描画処理と旧公開資産は `artifacts/previous-renderers/` と `artifacts/previous-assets/` に復元可能な形で退避した。資産工程は開始時点で以前の検証済み表示を無効化し、失敗時に古い資産を合格扱いしない。現物はEXT Meshoptだけを使う。KTX2・Dracoの現物復号・メモリ測定まで完了したとは扱わない。参考資産の合格を現在のCSS作品の性能保証に転用しない。

ブラウザー観測は実際のMCP呼び出し前後でソースと配信物の要約値を固定する。まずローカルの冷たいキャッシュ、圧縮済み配信、遅延・処理速度の人工制限なし、1499×1049のChromeで四段階を独立して測る。単一標本の診断値であり、公開環境の性能保証ではない。容量ゲートには四段階の最大値を使い、復号器と描画用JavaScriptを除外しない。携帯幅390でも横はみ出し・操作部品・動きを減らす設定を検査する。

Safariの自動操作許可が無効、またはFirefox・Edgeの接続がない場合は、それぞれ未検査とする。WebKitやChromiumを別製品名に置き換えて四ブラウザー合格を作らない。作品別の差分容量・復号時間・メモリ上限は利用者の作品要件に応じて設定する。実メモリが取得できない場合は推定値で代用しない。React Compilerは無効のままで、導入する場合だけ同じ条件で導入前後を比較する。外部への公開はまだ行わない。

実装追加の識別子: UUIDv5 `07b6fb92-8639-50e0-873d-b43d3d5c28df`。実装作業: UUIDv7 `01a099d4-9840-7179-b6e0-2b7759333103`。llm machine contract: 設計規則の基盤 → 実アプリ → 実コードと現物検査 → ブラウザー観測 → 出荷判定。合否は必ず最新版の報告を読む。

一次資料: [Plumeria AI](https://plumeria.dev/docs/ai)、[AI Agent Resources](https://plumeria.dev/docs/ai-agent-resources)、[公式変換器の検査](https://plumeria.dev/docs/testing)、[React](https://github.com/react/react)、[Three.js](https://github.com/mrdoob/three.js/)、[Next.js](https://github.com/vercel/next.js)。
