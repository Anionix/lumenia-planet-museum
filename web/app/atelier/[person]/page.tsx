import '@plumeria/core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { materialSphereCatalog } from '../../../artwork/material-sphere-catalog';
import { availableStudioSlugs, museumCharacterAvailability } from '../../../artwork/museum-character-availability';
import { ArtistStudio } from '../../../components/ArtistStudio';
import { studioStyles } from '../../../components/ArtistStudio.styles';
import { MaterialSphereArtwork } from '../../../components/MaterialSphere.generated';
import { GalleryHeader } from '../../../components/Gallery';
import { galleryStyles } from '../../../components/Gallery.styles';
import { sphereStyles } from '../../../components/MaterialSphere.styles';

// llm machine contract; claim UUIDv5: 68d2fd0d-a670-583b-88b5-cbed5fa5ef83
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: source-scoped artist -> fictional visit -> primary-source readback and sphere workbench.
export const dynamicParams = false;
export function generateStaticParams() { return availableStudioSlugs.map(person => ({ person })); }
export async function generateMetadata({ params }: { params: Promise<{ person: string }> }): Promise<Metadata> {
  const { person } = await params;
  const profile = materialSphereCatalog.find(item => item.slug === person);
  return { title: `${profile?.name ?? '人物'}の制作室 — Lumenia Planet Museum` };
}
export default async function ArtistStudioPage({ params }: { params: Promise<{ person: string }> }) {
  const { person } = await params;
  const profile = materialSphereCatalog.find(item => item.slug === person);
  const character = museumCharacterAvailability.find(item => item.slug === person);
  if (!profile || !character || !availableStudioSlugs.includes(person)) notFound();
  return <div classStyle={[galleryStyles.shell]}><GalleryHeader />
    <main>
      <div classStyle={[studioStyles.introduction]}><div><h1 classStyle={[studioStyles.title]}>{profile.name}の制作室へ</h1>
        <p classStyle={[studioStyles.period]}>資料の時代：{profile.referencePeriod} / {profile.referenceWork}</p></div>
        <a href="#studio-sources" classStyle={[sphereStyles.source]}>背景・資料を読む</a></div>
      <ArtistStudio name={profile.name} referenceWork={profile.referenceWork} interpretation={profile.interpretation} morris={person === 'william-morris'}
        character={character}>
        <MaterialSphereArtwork profileIdentifier={profile.profileIdentifier} />
      </ArtistStudio>
      <section id="studio-sources" classStyle={[studioStyles.sources]}>
        <h2 classStyle={[sphereStyles.artistName]}>この部屋の手がかり</h2>
        <p classStyle={[sphereStyles.caption]}>本人の実際の発言や、現存する室内の忠実な復元ではありません。案内の台詞と制作過程は、このMuseumのための創作です。</p>
        <ul classStyle={[sphereStyles.facts]}>{profile.facts.map(fact => <li key={fact.claimIdentifier}>
          <p classStyle={[sphereStyles.caption]}>{fact.statement}</p>{fact.sources.map(source => <a key={source.sourceIdentifier} href={source.url} target="_blank" rel="noreferrer"
            classStyle={[sphereStyles.source]}>{source.title}</a>)}
        </li>)}</ul>
        <p classStyle={[sphereStyles.caption]}>{profile.limitation}</p>
        <nav aria-label="制作室から進む" classStyle={[studioStyles.choices]}>
          <a href={`/planetarium/${profile.slug}/#artwork`} classStyle={[studioStyles.choice]}>球を鑑賞・操作する</a>
          <a href="/planetarium/" classStyle={[studioStyles.choice]}>ほかの人物を訪ねる</a>
        </nav>
      </section>
    </main>
    <footer classStyle={[galleryStyles.footer]}><span>Lumenia Planet Museum</span><a href="/" classStyle={[galleryStyles.evidenceLink]}>Museumへ</a></footer>
  </div>;
}
