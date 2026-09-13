---
title: Lumenia Planet Museum
type: Intent
claim_identifier: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
execution_identifier: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
state: implementation
---

# 意図

Lumeniaを土台に、Material Sphereを繰り返し使える展示基盤とする。Plumeria、React、Next.jsを継続して使用し、CSSでできる表現を追求する。CSSだけに出力先を固定せず、画像、SVG、Canvas、Three.jsへ明示的な描画処理で分岐できるようにする。

最初の一単位は「Museumの入口 → 人物15人の静的展示 → 1〜4次元の座標操作 → 出典・検算記録」。既存の線・面・立体の作品を残す。

ユーザーによる追加決定：人物の時代の制作室を訪れ、説明と鑑賞の両方を体験する。最初の案内役はウィリアム・モリス。一人ずつhatch-petで作り、部屋・人物像・台詞を創作による再構成と明示する。資料の作品と、このMuseumのオリジナルの球は区別する。

Sitesへの表示とGitHubの非公開リポジトリー作成も作業範囲に加わった。登録・保存・配備・表示確認を別の状態として記録し、登録だけで公開完了とは扱わない。外部への共有範囲は非公開とする。

`ask-matt` の選択：進行中の実装を同じ文脈で続け、小さな検査単位に分ける。課題管理サービスの設定やAGENTS.mdの変更は接続の前提にしない。新しい工程管理スキルの初期化は未実施であり、済んだとは扱わない。

次工程は [接続仕様](planet-museum-spec.md) を読む。

<!-- llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa; executionIdentifier: 01a09af7-f340-76cb-86a7-4075de7842d3; transition: static exhibition -> sourced fictional atelier -> individually validated character -> private deployment -->

<!-- llm machine contract; transition: user-directed museum scope -> scoped specification; claim UUIDv5: 63c605f5-9e47-5b49-949f-cad7ce96b4ed; execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016 -->
