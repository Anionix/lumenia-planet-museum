import '@plumeria/core';
import { characterAnimationForStudioStep, characterDirectionCell } from '../artwork/museum-character.mjs';
import { characterAnimationStyles } from './MuseumCharacter.generated.styles';
import { characterStyles } from './MuseumCharacter.styles';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: 01a09af7-f340-76cb-86a7-4075de7842d3
// transition: scene choice -> bounded atlas cells. No JavaScript per-frame drawing loop.
// Mount only after the source-bound character inspection receipt has passed.
export function MuseumCharacter({ step, direction, paused, artifactIdentifier, imagePath }: {
  step: number; direction: number | null; paused: boolean; artifactIdentifier: string; imagePath: string;
}) {
  const state = characterAnimationForStudioStep(step);
  const cell = direction === null ? null : characterDirectionCell(direction);
  return <span aria-hidden="true" data-museum-character={artifactIdentifier}
    data-character-animation={cell ? 'looking' : state} data-character-direction={direction ?? 'neutral'}
    data-character-paused={paused} classStyle={[
      characterStyles.sprite,
      characterStyles.image(`url("${imagePath}")`),
      state === 'idle' && characterAnimationStyles.idle,
      state === 'waving' && characterAnimationStyles.waving,
      state === 'running' && characterAnimationStyles.running,
      state === 'review' && characterAnimationStyles.review,
      cell !== null && characterStyles.position(`${-cell.column * 192}px`, `${-cell.row * 208}px`),
      cell !== null && characterStyles.fixed,
      paused && characterStyles.paused,
    ]} />;
}
