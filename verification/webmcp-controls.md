# 展示をまとめて操作する

<!-- machine contract: record_identifier=add33238-303d-5283-be4e-608c385aee54; transition=implemented -> locally presented -> published and verified; execution history=reports/webmcp-browser.json -->

対応するブラウザーでは、作家の選択、見どころへの移動、画像の並べ方を、ページが公開する操作として呼び出せます。画面のボタンと同じ処理を使い、必要な画像の読み込みと描画が終わってから結果を返します。

| ページ | 読み取り | 画面を変更する操作 |
| --- | --- | --- |
| `/cosmos/explore/` | `read_exploration_catalog`、`read_exploration_state` | `navigate_exploration`、`set_exploration_physics` |
| `/cosmos/interactive/` | `read_image_exhibition_catalog`、`read_image_exhibition_state` | `configure_image_exhibition`、`reset_image_exhibition` |

例えば、ソットサスの世界を開いた状態で、次の入力を `navigate_exploration` に渡すと、環の手前へ移り、前方へ9.6メートル進みます。従来の前進ボタン24回分を一度に指定できます。時間や料金が一定割合で減るという測定はしていません。

```json
{"viewpoint":"passage","movement":[0,0,-1],"steps":24}
```

作家を指定するときは、先に一覧から完全な識別子を取得します。画像の一覧と立体世界の一覧は別の識別子です。

## 維持する条件

- 特徴を表す座標と表示位置を分離する。資料にない3人分の特徴座標は未設定のまま保持する。
- 物理演算は初期状態では読み込まない。明示的に有効にしたときだけ読み込む。立体世界を変更すると無効に戻る。
- 移動量は既存の計算を使う。1回の呼び出しは最大60段階、通常速度で最大24メートル。
- 未知の引数、範囲外の値、成立しない設定の組み合わせを拒否する。同時に実行できる画面変更は一つ。
- 成功した操作には種類ごとのUUIDv5、実行ごとのUUIDv7、完了時刻を付ける。読み取り操作も完了時刻と実行識別子を返す。
- ページ終了や描画の中断時は登録を解除する。登録できないブラウザーでも通常のボタン操作を使える。
- この連携は、資料の書き換え、外部への投稿、任意のプログラム実行を提供しない。

## 確認した範囲

2026年9月16日、ChatGPT内のブラウザーで8操作を実際に呼び出した。移動後の画面表示、物理演算を使った環の通過、世界変更、15枚の画像読み込み、無効な入力の拒否、静止状態への復帰を確認した。記録は `reports/webmcp-browser.json`。

別のPlaywrightブラウザーでは `document.modelContext` が未対応だった。そこでの通常表示は確認できたが、その環境でのWebMCP実行成功は主張しない。対応状況はブラウザーによって異なる。

115件の回帰テスト、アプリの6検査、根幹の27定理と探索の10定理の公理依存検査が通過した。探索のWolfram検算6条件は対象ファイルの一致を確認して再利用した。言語サーバーの観測も、13個の根幹入力の内容が変わっていないことを確認して再利用した。形式的な証明は既存の数理モデルに関するもので、WebMCPや描画全体の正しさを証明するものではない。

## 使い方と相談先

[使い方・資料のWiki](https://github.com/Anionix/lumenia-planet-museum/wiki) と [質問・アイデア・制作例の案内](https://github.com/Anionix/lumenia-planet-museum/discussions/20) は相互にリンクしている。案内はDiscussions一覧に固定済み。両方の展示ページからも直接開ける。

## 一次情報

- [WebMCP仕様草案](https://webmachinelearning.github.io/webmcp/)：ページの操作登録とライフサイクル。確定した標準ではない。
- [Google ChromeのWebMCP案内](https://developer.chrome.com/blog/webmcp-epp)：ブラウザーへの導入状況と目的。
- [Google Chrome LabsのWebMCP開発用ツール](https://github.com/GoogleChromeLabs/webmcp-tools/)：操作の発見と実行。
- [GitHubのWiki編集案内](https://docs.github.com/en/communities/documenting-your-project-with-wikis/adding-or-editing-wiki-pages)：資料ページの管理。
- [GitHub Discussionsの案内](https://docs.github.com/en/discussions/quickstart)：相談場所の管理。
