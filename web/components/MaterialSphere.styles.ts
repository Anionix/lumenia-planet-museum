import * as css from '@plumeria/core';

// llm machine contract; claim UUIDv5: a4dda200-f08a-5d83-8da0-4071a55d0712
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: module-level schemas -> Plumeria-extracted CSS; no browser style generation.
const materialTurn = css.keyframes({ from: {
  transform: 'rotate(0turn)'
}, to: {
  transform: 'rotate(1turn)'
} });
export const sphereMotionStyles = css.create({
  inheritedTiming: {
    animationDuration: 'inherit',
    animationDelay: 'inherit',
    animationPlayState: 'inherit'
  },
  pattern: {
    position: 'absolute',
    inset: '0',
    clipPath: 'var(--material-reveal, inset(0 0 0 0))',
    animationName: materialTurn,
    animationDuration: 'inherit',
    animationTimingFunction: 'linear',
    animationDelay: 'inherit',
    animationIterationCount: 'infinite',
    animationPlayState: 'inherit',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none'
    }
  },
});
export const spherePlaybackStyles = css.create({
  playing: {
    animationPlayState: 'running'
  }, paused: {
    animationPlayState: 'paused'
  },
});
export const sphereStyles = css.create({
  heading: {
    padding: '24px 16px 0',
    '@media (max-width: 760px)': {
      padding: '22px 0 0'
    }
  },
  eyebrow: {
    margin: '0 0 14px',
    fontSize: '13px',
    color: '#d0eb86',
    letterSpacing: '0.15em'
  },
  title: {
    margin: '0',
    fontSize: '44px',
    fontWeight: '400',
    lineHeight: '1.1',
    '@media (max-width: 760px)': {
      fontSize: '36px'
    }
  },
  description: {
    margin: '16px 0 0',
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#949993'
  },
  people: {
    display: 'flex',
    gap: '26px',
    padding: '24px 2px 6px',
    margin: '0 14px',
    overflowX: 'auto',
    scrollbarWidth: 'thin',
    borderBottom: '1px solid #303633',
    '@media (max-width: 760px)': {
      margin: '0'
    }
  },
  person: {
    flexShrink: '0',
    padding: '12px 0',
    fontSize: '14px',
    color: '#949993',
    borderBottom: '2px solid transparent',
    ':hover': {
      color: '#d0eb86'
    }
  },
  selectedPerson: {
    color: '#f1eee6',
    borderBottomColor: '#d0eb86'
  },
  exhibit: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 270px',
    gap: '24px',
    padding: '28px 16px 36px',
    '@media (max-width: 800px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gap: '24px'
    },
    '@media (max-width: 760px)': {
      padding: '24px 0'
    }
  },
  artworkArea: {
    minWidth: '0'
  },
  artistName: {
    margin: '0 0 8px',
    fontSize: '23px',
    fontWeight: '400',
    lineHeight: '1.5'
  },
  reference: {
    margin: '0',
    fontSize: '13px',
    lineHeight: '1.7',
    color: '#949993'
  },
  scene: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    height: '420px',
    overflow: 'hidden',
    backgroundImage: 'radial-gradient(ellipse at 50% 55%,#24292388 0%,transparent 64%)',
    '@media (max-width: 760px)': {
      height: '330px'
    }
  },
  projected: (transform: string) => ({
    transform
  }),
  magnification: {
    transform: 'scale(1.35)',
    '@media (max-width: 1050px)': {
      transform: 'scale(1)'
    },
    '@media (max-width: 420px)': {
      transform: 'scale(0.85)'
    }
  },
  timing: (duration: string, delay: string) => ({
    animationDuration: duration,
    animationDelay: delay
  }),
  caption: {
    maxWidth: '660px',
    margin: '0',
    fontSize: '15px',
    lineHeight: '1.9',
    color: '#c1c6bd'
  },
  controls: {
    alignSelf: 'start',
    paddingTop: '22px',
    borderTop: '1px solid #303633',
    '@media (max-width: 800px)': {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px'
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr'
    }
  },
  controlHeading: {
    margin: '0 0 16px',
    fontSize: '15px',
    fontWeight: '400'
  },
  dimensions: {
    display: 'flex',
    gap: '8px',
    marginBottom: '22px'
  },
  dimension: {
    minHeight: '40px',
    padding: '9px 10px',
    fontSize: '13px',
    color: '#c1c6bd',
    backgroundColor: 'transparent',
    border: '1px solid #53594f',
    ':hover': {
      borderColor: '#d0eb86'
    }
  },
  chosenDimension: {
    color: '#111313',
    backgroundColor: '#d0eb86',
    borderColor: '#d0eb86'
  },
  axis: {
    display: 'grid',
    gridTemplateColumns: '100px minmax(0, 1fr) 28px',
    gap: '12px',
    alignItems: 'center',
    margin: '16px 0',
    fontSize: '13px'
  },
  range: {
    width: '100%',
    minWidth: '0',
    accentColor: '#d0eb86',
    cursor: 'pointer'
  },
  numeric: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right'
  },
  equation: {
    display: 'block',
    padding: '16px 0',
    fontSize: '14px',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1.9',
    color: '#d0eb86',
    overflowWrap: 'anywhere'
  },
  note: {
    margin: '12px 0',
    fontSize: '12px',
    lineHeight: '1.9',
    color: '#949993'
  },
  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    margin: '18px 0'
  },
  button: {
    minHeight: '42px',
    padding: '11px 14px',
    fontSize: '13px',
    color: '#f1eee6',
    backgroundColor: 'transparent',
    border: '1px solid #53594f',
    ':hover': {
      borderColor: '#d0eb86'
    },
    ':disabled': {
      cursor: 'not-allowed',
      opacity: '0.45'
    }
  },
  primary: {
    color: '#111313',
    backgroundColor: '#d0eb86',
    borderColor: '#d0eb86'
  },
  motionSection: {
    marginTop: '28px',
    '@media (max-width: 1050px)': {
      marginTop: '0'
    }
  },
  documentation: {
    paddingTop: '22px',
    margin: '0 16px 40px',
    borderTop: '1px solid #303633',
    '@media (max-width: 760px)': {
      margin: '0 0 32px'
    }
  },
  summary: {
    padding: '10px 0',
    fontSize: '15px',
    cursor: 'pointer'
  },
  detailsBody: {
    maxWidth: '960px',
    padding: '14px 0 24px',
    fontSize: '14px',
    lineHeight: '1.9',
    overflowWrap: 'anywhere'
  },
  facts: {
    display: 'grid',
    gap: '18px',
    paddingLeft: '20px'
  },
  source: {
    display: 'inline-block',
    marginRight: '12px',
    fontSize: '12px',
    color: '#c9d4b5',
    textDecoration: 'underline',
    textUnderlineOffset: '3px'
  },
  outputList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px 28px',
    padding: '0',
    listStyle: 'none'
  },
  proofName: {
    display: 'block',
    fontSize: '12px',
    color: '#c1c6bd',
    overflowWrap: 'anywhere'
  },
});
