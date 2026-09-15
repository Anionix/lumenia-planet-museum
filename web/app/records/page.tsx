import '@plumeria/core';
import Link from 'next/link';
import { GalleryHeader } from '../../components/Gallery';
import { galleryStyles } from '../../components/Gallery.styles';

// llm machine contract; claim UUIDv5: e9194426-a204-577c-9758-7bfe9644b8fc
// execution UUIDv7: 01a0a324-741b-715a-be47-5cd2936becb7; transition: internal page selection -> framework navigation with native fallback

// llm machine contract; claim UUIDv5: 07b6fb92-8639-50e0-873d-b43d3d5c28df
// execution UUIDv7: 01a09a1a-e883-7d76-b209-e3f58830b29e
// transition: report links -> actual revision-bound evidence; reference assets are not current artwork.
export default function RecordsPage() {
  return <div classStyle={[galleryStyles.shell]}><GalleryHeader />
    <main classStyle={[galleryStyles.records]}>
      <h1 classStyle={[galleryStyles.title]}>検算記録</h1>
      <p>証明できることと、実際に測ったことを分けて記録しています。各報告には対象の改訂と実行識別子を含めます。</p>
      <p classStyle={[galleryStyles.description]}>合格・不合格・未実行・古い証跡を区別します。作品が動くことだけでは、容量や出荷条件に合格したとは扱いません。</p>
      <ul classStyle={[galleryStyles.recordList]}>
        <li classStyle={[galleryStyles.record]}><span>設計規則の証明</span><a classStyle={[galleryStyles.evidenceLink]} href="/evidence/proof-report.json">証明報告を読む</a></li>
        <li classStyle={[galleryStyles.record]}><span>実コード・描画・ブラウザー</span><a classStyle={[galleryStyles.evidenceLink]} href="/evidence/gate-report.json">出荷ゲートを読む</a></li>
        <li classStyle={[galleryStyles.record]}><span>別系統の資産検証例</span><a classStyle={[galleryStyles.evidenceLink]} href="/evidence/asset-reference-report.json">参考資産の報告を読む</a></li>
        <li classStyle={[galleryStyles.record]}><span>独立した数理検算</span><a classStyle={[galleryStyles.evidenceLink]} href="/evidence/wolfram-report.json">Wolfram報告を読む</a></li>
      </ul>
      <p classStyle={[galleryStyles.description]}>現在の線・面・立体は、すべてPlumeriaのCSSで描いています。参考資産の検証結果は、現在の作品の読み込みや性能の合格を意味しません。</p>
      <p classStyle={[galleryStyles.description]}>同じ条件で比較するには、作品画面の四つの描き方をそれぞれ新しい状態で読み込みます。画像処理装置の実メモリが取得できない環境では、推定値を実測値として扱いません。</p>
      <p><Link prefetch={false} href="/" classStyle={[galleryStyles.evidenceLink]}>作品に戻る</Link></p>
    </main>
  </div>;
}
