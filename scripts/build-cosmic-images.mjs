import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { projectRoot } from './source-revision.mjs';

// llm machine contract; UUIDv5: 26c1a73e-a5ed-5a54-93c7-29888e27f48e.
// transition: source-linked immutable images -> verified copies -> static exhibition.
// Generation receipts remain source evidence; publication never regenerates an image.
const sourceDirectory = path.join(projectRoot, 'reference-assets/artist-cosmos');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export async function buildCosmicImages(outputDirectory = path.join(projectRoot, 'web/public/cosmos')) {
  const sourceRows = (await readFile(path.join(sourceDirectory, 'references.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  const registration = JSON.parse(await readFile(path.join(projectRoot, 'contracts/cosmic-reference-images.json'), 'utf8'));
  assert.equal(sourceRows.length, 15);
  assert.equal(registration.images.length, 15);
  assert.equal(new Set(sourceRows.map(row => row.record_identifier)).size, 15);
  const dataset = await readFile(path.join(projectRoot, 'planetarium/illustration-design-reference.jsonl'));
  await mkdir(outputDirectory, { recursive: true });
  const publishedRows = [];
  for (const row of sourceRows) {
    assert.match(row.asset_path, /^[a-z]+(?:-[a-z]+)*\.png$/);
    assert.equal(row.generation_provider, 'ChatGPT image generation');
    assert.equal(row.reference_dataset_sha256, digest(dataset));
    assert.ok(row.sources.length >= 2);
    const image = await readFile(path.join(sourceDirectory, row.asset_path));
    assert.equal(digest(image), row.sha256, 'Original image has changed');
    const admitted = registration.images.find(item => item.recordIdentifier === row.record_identifier);
    assert.equal(admitted?.path, 'cosmos/' + row.asset_path);
    assert.equal(admitted?.sha256, row.sha256);
    await writeFile(path.join(outputDirectory, row.asset_path), image);
    const { original_generation_path, previous_asset_path, ...published } = row;
    void original_generation_path; void previous_asset_path;
    published.reference_dataset_path = './illustration-design-reference.jsonl';
    publishedRows.push(published);
  }
  await writeFile(path.join(outputDirectory, 'references.jsonl'), publishedRows.map(row => JSON.stringify(row)).join('\n') + '\n');
  await writeFile(path.join(outputDirectory, 'illustration-design-reference.jsonl'), dataset);
  let gallery = await readFile(path.join(sourceDirectory, 'index.html'), 'utf8');
  gallery = gallery.replace('<main>', '<nav class="topline" aria-label="展示の移動"><a href="/">美術館に戻る</a><a href="./interactive/">画像を動かす展示へ →</a></nav><main>');
  gallery = gallery.replace('content="light"', 'content="dark"');
  gallery = gallery.replace('<main>', '<p style="width:min(1392px,92%);margin:24px auto"><a href="./explore/?world=ettore-sottsass">15の立体の宇宙を探索する →</a></p><main>');
  gallery = gallery.replace(/<article\b([^>]*)>([\s\S]*?)<\/article>/g,(article,attributes,content)=>{
    const slug=content.match(/href="([a-z-]+)\.png"/)?.[1];
    return slug?`<article${attributes}>${content}<p style="margin:20px 0 0 48px"><a href="./explore/?world=${slug}">この宇宙に入る →</a></p></article>`:article;
  });
  gallery = gallery.replace('</style>', 'nav.topline{width:min(1392px,92%);margin-inline:auto}</style>');
  gallery = gallery.replace(/<a[^>]*href="\.\.\/artist-references-2026-09-15\/index.html"[^>]*>[^<]*<\/a>/, '<a href="/records/">資料と検算記録 ↗</a>');
  await writeFile(path.join(outputDirectory, 'index.html'), gallery);
  const applicationFiles = [
    'index.html', 'main.mjs', 'model.mjs', 'physics.mjs', 'style.css', 'exhibition.json', 'dependencies.json', 'README.md',
    'vendor/three.module.js', 'vendor/three.core.js', 'vendor/controls/OrbitControls.js',
    'vendor/rapier.mjs', 'vendor/reference-physics-contract.mjs', 'vendor/THREE-LICENSE.txt', 'vendor/RAPIER-LICENSE.txt',
  ];
  const dependency = JSON.parse(await readFile(path.join(sourceDirectory, 'interactive/dependencies.json'), 'utf8'));
  for (const file of dependency.files) assert.equal(digest(await readFile(path.join(sourceDirectory, 'interactive', file.local_path))), file.sha256);
  for (const file of applicationFiles) {
    const destination = path.join(outputDirectory, 'interactive', file);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(sourceDirectory, 'interactive', file), destination);
  }
  const documentation = [
    '# 15枚の宇宙を動かす', '',
    '作家を選び、視点を回し、画像を浮かべたりつかんだりできます。「物理で遊ぶ」を入れると衝突と落下を利用できます。初期状態では物理を読み込みません。', '',
    '画像は資料から着想して新しく生成した試作です。本人の作品や実物写真ではありません。特徴座標12件と未設定3件は表示の移動から独立しています。', '',
    '## ソースと再実行', '',
    '[操作と実行手順](https://github.com/Anionix/lumenia-planet-museum/tree/codex/publish-cosmic-images/reference-assets/artist-cosmos/interactive)', '',
    '[この版の Lean と Wolfram の記録](https://github.com/Anionix/lumenia-planet-museum/tree/5153523dcfb9eb99a9770818453348787995a4d4/reference-assets/artist-cosmos/interactive/verification)', '',
    '検証はリポジトリを取得して行います。この公開ページのフォルダだけでは、開発用コマンドや証明器は動かせません。', '',
    'Lean は19定理と補助証明の公理依存を監査し、Wolfram は10項目を検算しました。描画と衝突は実行テストで確認する別の対象です。', '',
    '[Three.js](https://threejs.org/docs/pages/WebGLRenderer.html) / [Rapier](https://rapier.rs/docs/user_guides/javascript/rigid_body_type/)', '',
  ].join('\n');
  await writeFile(path.join(outputDirectory, 'interactive/README.md'), documentation);
  return { imageCount: sourceRows.length, physicsEnabledByDefault: false, sourceImagesUnchanged: true };
}
if (process.argv[1] === new URL(import.meta.url).pathname) console.log(JSON.stringify(await buildCosmicImages()));
