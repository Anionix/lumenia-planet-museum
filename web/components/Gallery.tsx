import '@plumeria/core';
import { artworkStages, artworkNames, renderingNames, type ArtworkStage } from '../artwork/catalog';
import { ArtworkExperience } from './ArtworkExperience';
import { galleryStyles } from './Gallery.styles';

// llm machine contract; claim UUIDv5: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// execution UUIDv7: 01a099d4-9840-7179-b6e0-2b7759333103
// state: server component; transition: static navigation -> one client artwork boundary
export function GalleryHeader() {
  return <header classStyle={[galleryStyles.header]}>
    <a href="/" classStyle={[galleryStyles.brand]} aria-label="Lumenia ホーム">Lumenia</a>
    <nav aria-label="主な移動先" classStyle={[galleryStyles.navigation]}>
      <a href="/compare/css/" classStyle={[galleryStyles.link]}>光のかたち</a>
      <a href="/planetarium/" classStyle={[galleryStyles.link]}>プラネタリウム</a>
      <a href="/records/" classStyle={[galleryStyles.link]}>検算記録</a>
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
          {artworkStages.map(item => <a key={item} href={`/compare/${item}/`}
            aria-current={item === stage ? 'page' : undefined}
            classStyle={[galleryStyles.option, item === stage && galleryStyles.selected]}>
            {artworkNames[item]}</a>)}
        </nav>
      </div>
      {stage === 'empty' ? <div classStyle={[galleryStyles.viewport]} data-artwork-stage="empty">
        <p classStyle={[galleryStyles.empty]}>作品を描かない比較用の基盤です。<br />表示と通信量の基準を測ります。</p>
      </div> : <ArtworkExperience stage={stage} />}
    </main>
    <footer classStyle={[galleryStyles.footer]}>
      <span>{artworkNames[stage]} / {renderingNames[stage]}</span>
      <a href="/records/" classStyle={[galleryStyles.evidenceLink]}>測定結果を見る</a>
    </footer>
  </div>;
}
