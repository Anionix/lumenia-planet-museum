# 宇宙展示の変更計画

記録日: 2026年9月15日。
状態: 課題5・6・7をGitHubへ投稿済み。ローカル実装を検証中。
記録識別子: 01a0a466-8ef5-7ceb-9da0-c6195d4d86ab。

## 課題案1: 資料と計算の契約

公開課題: https://github.com/Anionix/lumenia-planet-museum/issues/5

識別子: 796d5e27-8862-52a6-a331-776d0066b23b。

- 15人の素材球を既存の資料・出典へ接続する。
- 12人の特徴座標を保持する。不明な3人へ特徴座標を割り当てない。
- 作品の年・期間・不明を保持し、展示の経過時間と分ける。
- 物理演算は既定で無効。物理量には単位と実測／演出設定を要求する。
- Lean、Wolfram、JavaScriptの証明・検算・検査の範囲を記録する。

## 課題案2: 宇宙展示と時間軸

公開課題: https://github.com/Anionix/lumenia-planet-museum/issues/6

識別子: 190fdb1a-2e41-565d-9aed-9fe5ca2179a6。

- 架空の太陽、15天体、軌道、星空を表示する。
- 天体の選択、回転、拡大、全体への復帰、作品年代の選択を可能にする。
- 資料と制作室へ移動できるようにする。
- 読み込みを遅らせ、停止・画面外・背景タブで継続描画を止める。
- 動きを減らす設定、キーボード、タッチ、描画不能時の資料表示に対応する。

## 課題案3: 検証と公開

公開課題: https://github.com/Anionix/lumenia-planet-museum/issues/7

識別子: 72d6a9dc-f388-5636-a746-fe846871dcaa。

- 変更を確認しやすい単位の提案に分ける。
- 既存の無関係な作業ファイルを取り込まない。
- ビルド、型、契約、描画に関係する検査を実行する。
- 公開先は既存のLumenia Planet Museumと、新しいVercelプロジェクト。
- 公開完了とページ到達性を確認する。未測定の性能を合格と表示しない。

## 一次資料

- https://threejs.org/docs/pages/MeshStandardMaterial.html
- https://rapier.rs/docs/user_guides/javascript/rigid_body_type/
- https://react.dev/reference/react/useEffect
- https://nextjs.org/docs/app/guides/lazy-loading
- https://plumeria.dev/docs/api-reference/plugins/next-plugin
- https://vercel.com/docs/deployments
- https://github.com/GoogleCloudPlatform/knowledge-catalog
- https://claude.com/blog/the-ai-native-sdlc-playbook

<!-- llm machine contract; transition: updated user goal -> user authorized external publication -> three issues published -> local implementation under verification. -->
