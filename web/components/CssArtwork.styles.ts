import * as css from '@plumeria/core';

// llm machine contract; claim UUIDv5: 5cdd969e-a78b-57cd-b751-2a5178fd8bf8
// execution UUIDv7: 01a09a1a-e883-7d76-b209-e3f58830b29e
// transition: module-scope geometry and keyframes -> extracted CSS -> browser-owned drawing and motion
const orbitRotation = css.keyframes({
  from: {
    transform: 'rotate3d(0.2, 1, 0.1, 0turn)'
  },
  to: {
    transform: 'rotate3d(0.2, 1, 0.1, 1turn)'
  },
});

export const artworkStyles = css.create({
  scene: {
    position: 'relative',
    width: '100%',
    height: '100%',
    perspective: '1800px',
  },
  space: {
    position: 'absolute',
    inset: '0',
    transformStyle: 'preserve-3d',
  },
  view: (horizontal: string, vertical: string) => ({
    transform: `rotateZ(${horizontal}) rotateX(${vertical})`,
  }),
  pose: {
    transform: 'rotateZ(28deg) rotateX(44deg)'
  },
  motion: {
    animationName: orbitRotation,
    animationDuration: '36s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  ring: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 'clamp(210px, 34vw, 460px)',
    height: 'clamp(210px, 34vw, 460px)',
    border: '1px solid #d0eb86',
    borderRadius: '50%',
    backfaceVisibility: 'visible'
  },
  ribbon: {
    borderColor: 'rgba(208, 235, 134, 0.2)',
    borderWidth: 'clamp(6px, 1vw, 14px)',
    borderTopColor: 'rgba(208, 235, 134, 0.48)'
  },
  panel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backfaceVisibility: 'hidden',
  },
  panelGeometry: (transform: string, width: string, height: string, color: string) => ({
    width,
    height,
    backgroundColor: color,
    transform
  }),
  placement: (angle: string) => ({
    transform: `translate(-50%, -50%) rotateZ(${angle}) translateY(calc(clamp(105px, 17vw, 230px) * 0.43209876543209874)) rotateY(-25.600826983421094deg)`,
  }),
});

export const playbackStyles = css.create({
  automatic: {
    animationPlayState: 'running',
    '@media (prefers-reduced-motion: reduce)': {
      animationPlayState: 'paused'
    },
  },
  playing: {
    animationPlayState: 'running'
  },
  paused: {
    animationPlayState: 'paused'
  },
});
