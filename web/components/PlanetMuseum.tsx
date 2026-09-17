import '@plumeria/core';
import Link from 'next/link';
import { GalleryHeader } from './Gallery';
import { galleryStyles } from './Gallery.styles';
import { sphereStyles } from './MaterialSphere.styles';
import { museumStyles } from './PlanetMuseum.styles';
import { MaterialSphereArtwork } from './MaterialSphere.generated';
import { CssMuseumCharacter } from './CssMuseumCharacter';
import { CssArtistCharacter } from './CssArtistCharacter';
import { portraitStyles } from './CssArtistCharacter.styles';
import { cssMuseumPeople } from '../artwork/css-museum-people.mjs';
import { materialSphereCatalog } from '../artwork/material-sphere-catalog';

// llm machine contract; claim UUIDv5: e9194426-a204-577c-9758-7bfe9644b8fc
// execution UUIDv7: 01a0a324-741b-715a-be47-5cd2936becb7; transition: internal page selection -> framework navigation with native fallback

// llm machine contract; claim UUIDv5: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: Material Sphere foundation -> curated exhibition entry points.
// These groupings are curatorial choices, not historical influence claims or Lean theorems.
const exhibitions = [
  { title: '植物と、繰り返し。', slug: 'william-morris',
    text: '葉の対、花の輪、反復するかたち。モリス、ミュシャ、マッキントッシュの資料から。' },
  { title: '色と、構造。', slug: 'piet-mondrian',
    text: '直角の面、幾何学の配色、線の秩序。モンドリアンからソットサス、バイヤーへ。' },
  { title: 'ものと、手触り。', slug: 'naoto-fukasawa',
    text: '身近な道具、重なる素材、非対称の量感。深澤直人、イームズ夫妻、川久保玲の仕事をたどる。' },
] as const;
export function PlanetMuseum() {
  const morris = materialSphereCatalog.find(profile => profile.slug === 'william-morris')!;
  const mondrian = materialSphereCatalog.find(profile => profile.slug === 'piet-mondrian')!;
  const collage = materialSphereCatalog.find(profile => profile.slug === 'ray-eames')!;
  return <div classStyle={[galleryStyles.shell]}>
    <GalleryHeader />
    <main>
      <section classStyle={[museumStyles.hero]}>
        <div><p classStyle={[sphereStyles.eyebrow]}>LUMENIA</p>
          <h1 classStyle={[museumStyles.title]}>Planet<br />Museum</h1>
          <p classStyle={[museumStyles.description]}>制作中のアトリエへ、少しだけお邪魔する。<br />話を聞き、色とかたちに触れ、その時代をたどる。</p>
          <Link prefetch={false} href="/atelier/william-morris/" classStyle={[museumStyles.entry]}>モリスの制作室を訪ねる →</Link>
        </div>
        <div role="img" aria-label="植物の反復、直角の色面、色のコラージュをまとった三つの球" classStyle={[museumStyles.constellation]}>
          <div classStyle={[museumStyles.firstPlanet]}><MaterialSphereArtwork profileIdentifier={morris.profileIdentifier} /></div>
          <div classStyle={[museumStyles.secondPlanet]}><MaterialSphereArtwork profileIdentifier={mondrian.profileIdentifier} /></div>
          <div classStyle={[museumStyles.thirdPlanet]}><MaterialSphereArtwork profileIdentifier={collage.profileIdentifier} /></div>
        </div>
      </section>
      <section aria-label="制作室を選ぶ" classStyle={[museumStyles.exhibitions]}>
        <h2 classStyle={[museumStyles.heading]}>15のアトリエ、その手元へ。</h2>
        <p classStyle={[museumStyles.exhibitionText]}>人物・服・部屋・台詞は、資料から着想したMuseumの創作です。</p>
        <div classStyle={[portraitStyles.directory]}>{cssMuseumPeople.map(person => <Link prefetch={false} key={person.appearanceIdentifier} href={`/atelier/${person.slug}/`} classStyle={[portraitStyles.card]}>
          <span aria-hidden="true" classStyle={[portraitStyles.thumbnail]}><span classStyle={[portraitStyles.thumbnailScale]}>
            {person.slug === 'william-morris' ? <CssMuseumCharacter paused /> : <CssArtistCharacter personSlug={person.slug} paused />}
          </span></span><span classStyle={[portraitStyles.name]}>{person.name}<span classStyle={[portraitStyles.note]}>制作室を訪ねる →</span></span>
        </Link>)}</div>
      </section>
      <section aria-label="展示を選ぶ" classStyle={[museumStyles.exhibitions]}>
        <h2 classStyle={[museumStyles.heading]}>Material Sphere — 15人の仕事から</h2>
        <div classStyle={[museumStyles.list]}>{exhibitions.map(exhibition => <article key={exhibition.slug}>
          <h3 classStyle={[museumStyles.exhibitionTitle]}>{exhibition.title}</h3>
          <p classStyle={[museumStyles.exhibitionText]}>{exhibition.text}</p>
          <Link prefetch={false} href={`/atelier/${exhibition.slug}/`}
            classStyle={[museumStyles.entry]}>制作室を訪ねる →</Link>
        </article>)}</div>
        <div classStyle={[museumStyles.archive]}><span>Lumeniaから続く、線・面・立体の展示。</span>
          <Link prefetch={false} href="/compare/css/" classStyle={[galleryStyles.evidenceLink]}>光のかたちを見る</Link></div>
      </section>
    </main>
    <footer classStyle={[galleryStyles.footer]}><span>Lumenia Planet Museum</span><Link prefetch={false} href="/records/" classStyle={[galleryStyles.evidenceLink]}>出典と検算記録</Link></footer>
  </div>;
}
