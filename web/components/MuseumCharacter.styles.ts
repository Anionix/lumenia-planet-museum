import * as css from '@plumeria/core';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: 01a09af7-f340-76cb-86a7-4075de7842d3
// transition: validated character image -> isolated CSS sprite viewport; the artwork remains CSS geometry.
export const characterStyles = css.create({
  sprite: {
    display: 'block',
    width: '192px',
    height: '208px',
    pointerEvents: 'none',
    backgroundImage: 'url(/characters/william-morris/spritesheet.webp)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1536px 2288px',
    animationTimingFunction: 'steps(1, end)',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': {
      backgroundPosition: '0px 0px',
      animationName: 'none'
    }
  },
  position: (horizontal: string, vertical: string) => ({
    backgroundPosition: `${horizontal} ${vertical}`
  }),
  fixed: {
    animationName: 'none'
  },
  paused: {
    animationPlayState: 'paused'
  },
});
