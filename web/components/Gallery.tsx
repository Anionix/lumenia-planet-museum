import '@plumeria/core';
import Link from 'next/link';
import { artworkStages, artworkNames, renderingNames, type ArtworkStage } from '../artwork/catalog';
import { ArtworkExperience } from './ArtworkExperience';
import { galleryStyles } from './Gallery.styles';

// llm machine contract; claim UUIDv5: e9194426-a204-577c-9758-7bfe9644b8fc
// execution UUIDv7: 01a0a324-741b-715a-be47-5cd2936becb7; transition: internal page selection -> framework navigation with native fallback
// Page payloads load on demand; automatic prefetching would exceed the fixed 10 KiB metadata budget.

// llm machine contract; claim UUIDv5: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// execution UUIDv7: 01a099d4-9840-7179-b6e0-2b7759333103
// state: server component; transition: static navigation -> one client artwork boundary
export function GalleryHeader() {
  return <header classStyle={[galleryStyles.header]}>
    <Link prefetch={false} href="/" classStyle={[galleryStyles.brand]} aria-label="Lumenia ホーム">Lumenia</Link>
    <nav aria-label="主な移動先" classStyle={[galleryStyles.navigation]}>
      <Link prefetch={false} href="/compare/css/" classStyle={[galleryStyles.link]}>光のかたち</Link>
      <Link prefetch={false} href="/planetarium/" classStyle={[galleryStyles.link]}>プラネタリウム</Link>
      <Link prefetch={false} href="/records/" classStyle={[galleryStyles.link]}>検算記録</Link>
    </nav>
  </header>;
}

export function Gallery({ stage }: { stage: ArtworkStage }) {
  return <div classStyle={[galleryStyles.shell]}>
    <GalleryHeader />
    <main>
      <div classStyle={[galleryStyles.headingArea]}>
        <div><h1 classStyle={[galleryStyles.title]}>光のかたち</h1>
          <p classStyle={[galleryStyles.description]}>触れる。動く。軽さを確かめる。</p></div>
        <nav aria-label="作品の描き方" classStyle={[galleryStyles.selector]}>
          {artworkStages.map(item => <Link prefetch={false} key={item} href={`/compare/${item}/`}
            aria-current={item === stage ? 'page' : undefined}
            classStyle={[galleryStyles.option, item === stage && galleryStyles.selected]}>
            {artworkNames[item]}</Link>)}
        </nav>
      </div>
      {stage === 'empty' ? <div classStyle={[galleryStyles.viewport]} data-artwork-stage="empty">
        <p classStyle={[galleryStyles.empty]}>作品を描かない比較用の基盤です。<br />表示と通信量の基準を測ります。</p>
      </div> : <ArtworkExperience stage={stage} />}
    </main>
    <footer classStyle={[galleryStyles.footer]}>
      <span>{artworkNames[stage]} / {renderingNames[stage]}</span>
      <Link prefetch={false} href="/records/" classStyle={[galleryStyles.evidenceLink]}>測定結果を見る</Link>
    </footer>
  </div>;
}
