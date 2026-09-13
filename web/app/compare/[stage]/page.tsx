import { notFound } from 'next/navigation';
import { Gallery } from '../../../components/Gallery';
import { artworkStages, isArtworkStage } from '../../../artwork/catalog';

// llm machine contract: finite route list -> generated static pages -> isolated cold-load comparisons.
export function generateStaticParams() { return artworkStages.map(stage => ({ stage })); }
export default async function ComparisonPage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  if (!isArtworkStage(stage)) notFound();
  return <Gallery stage={stage} />;
}
