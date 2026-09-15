import '@plumeria/core';
import Link from 'next/link';
import { materialSphereCatalog, materialSphereEvidence } from '../artwork/material-sphere-catalog';
import { MaterialSphereArtwork } from './MaterialSphere.generated';
import { MaterialSphereExperience } from './MaterialSphereExperience';
import { GalleryHeader } from './Gallery';
import { galleryStyles } from './Gallery.styles';
import { sphereStyles } from './MaterialSphere.styles';

// llm machine contract; claim UUIDv5: e9194426-a204-577c-9758-7bfe9644b8fc
// execution UUIDv7: 01a0a324-741b-715a-be47-5cd2936becb7; transition: internal page selection -> framework navigation with native fallback

// llm machine contract; claim UUIDv5: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
// related UUIDv5: baf96ced-5d93-520d-aa86-dd2899b7fa53
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: source-linked profile -> static artist page -> one coordinate/playback client boundary.
// Historical readings, proposed art, mathematical checks and browser observations remain separate.
export function MaterialSphereGallery({ slug }: { slug: string }) {
  const profile = materialSphereCatalog.find(person => person.slug === slug);
  if (!profile) throw new Error('Unknown Material Sphere page');
  return <div classStyle={[galleryStyles.shell]}>
    <GalleryHeader />
    <main>
      <div classStyle={[sphereStyles.heading]}>
        <p classStyle={[sphereStyles.eyebrow]}>ART KNOWLEDGE PLANETARIUM</p>
        <h1 classStyle={[sphereStyles.title]}>Material Sphere</h1>
        <p classStyle={[sphereStyles.description]}>15人の仕事を、色・かたち・繰り返しからたどる。</p>
        <nav aria-label="作品と資料" classStyle={[sphereStyles.buttons]}>
          <a href="#artwork" classStyle={[sphereStyles.source]}>作品を鑑賞・操作する</a>
          <a href="#sources" classStyle={[sphereStyles.source]}>人物の背景・資料を読む</a>
        </nav>
      </div>
      <nav aria-label="人物を選ぶ" classStyle={[sphereStyles.people]}>
        {materialSphereCatalog.map(person => <Link prefetch={false} key={person.profileIdentifier} href={`/planetarium/${person.slug}/`}
          aria-current={person.slug === slug ? 'page' : undefined}
          classStyle={[sphereStyles.person, person.slug === slug && sphereStyles.selectedPerson]}>{person.name}</Link>)}
      </nav>
      <div classStyle={[sphereStyles.heading]}>
        <h2 classStyle={[sphereStyles.artistName]}>{profile.name}</h2>
        <p classStyle={[sphereStyles.reference]}>{profile.referenceWork} / {profile.referencePeriod}</p>
        <p><Link prefetch={false} href={`/atelier/${profile.slug}/`} classStyle={[sphereStyles.source]}>この人物の制作室を訪ねる</Link></p>
      </div>
      <div classStyle={[sphereStyles.exhibit]}>
        <MaterialSphereExperience key={profile.profileIdentifier} artistName={profile.name} profileIdentifier={profile.profileIdentifier} parameters={profile.parameters}>
          <MaterialSphereArtwork profileIdentifier={profile.profileIdentifier} />
        </MaterialSphereExperience>
      </div>
      <div classStyle={[sphereStyles.documentation]}>
        <p classStyle={[sphereStyles.caption]}>{profile.interpretation}</p>
        <p classStyle={[sphereStyles.caption]}>資料をもとにした表現の試作です。原作の複製でも、作者本人の作品でもありません。</p>
        <details id="sources" open><summary classStyle={[sphereStyles.summary]}>人物の背景・参考資料</summary>
          <div classStyle={[sphereStyles.detailsBody]}>
            <ul classStyle={[sphereStyles.facts]}>{profile.facts.map(fact => <li key={fact.claimIdentifier} data-claim-identifier={fact.claimDefinitionIdentifier}>
              {fact.statement}<br />{fact.sources.map(source => <a key={source.sourceIdentifier} href={source.url} target="_blank" rel="noreferrer"
                classStyle={[sphereStyles.source]}>{source.title}</a>)}
            </li>)}</ul>
            <p>{profile.limitation}</p><p>色はこの試作の選択値です。原作から採色した値ではありません。</p>
          </div>
        </details>
        <details><summary classStyle={[sphereStyles.summary]}>出力先と検算記録</summary>
          <div classStyle={[sphereStyles.detailsBody]}>
            <ul classStyle={[sphereStyles.outputList]}>{materialSphereEvidence.rendererBranches.map(branch => <li key={branch.rendererIdentifier}>
              {branch.label} — {branch.availability === 'connected' ? '表示に接続' : '変換処理は未接続'}
            </li>)}</ul>
            <p>共通の数値データから、出力先ごとの描画へ分岐します。PlumeriaはCSSのビルドに使います。別の出力形式で同じ見た目になることは、別途検証が必要です。</p>
            <p>数理側では{materialSphereEvidence.theoremCount}定理を検査し、公理依存は{materialSphereEvidence.transitiveAxiomCount}です。芸術性・人物の歴史・ブラウザーの速さを証明した、という意味ではありません。</p>
            {profile.proofs.map(proof => <p key={proof.name} classStyle={[sphereStyles.proofName]}>{proof.name}<br />{proof.declarationIdentifier}</p>)}
            <p classStyle={[sphereStyles.proofName]}>数理ソース改訂：{materialSphereEvidence.sourceRevision}<br />数理検算実行：{materialSphereEvidence.executionIdentifier}<br />人物表現：{profile.profileIdentifier}</p>
            <p><a href="/evidence/material-sphere/proof-report.json" classStyle={[sphereStyles.source]}>Leanの証明報告</a>
              <a href="/evidence/material-sphere/wolfram-receipt.json" classStyle={[sphereStyles.source]}>Wolframの計算記録</a>
              <a href="/evidence/material-sphere/integration-report.json" classStyle={[sphereStyles.source]}>Lumenia接続の検査</a>
              <a href="/evidence/material-sphere/rendering-plans.json" classStyle={[sphereStyles.source]}>共通の数値データ</a></p>
            <p><a href="https://plumeria.dev/docs/ai" classStyle={[sphereStyles.source]}>Plumeria公式</a>
              <a href="https://www.w3.org/TR/css-transforms-2/" classStyle={[sphereStyles.source]}>CSS変換の標準仕様</a></p>
          </div>
        </details>
      </div>
    </main>
    <footer classStyle={[galleryStyles.footer]}><span>Material Sphere / Plumeria CSS</span><Link prefetch={false} href="/" classStyle={[galleryStyles.evidenceLink]}>Museumへ</Link></footer>
  </div>;
}
