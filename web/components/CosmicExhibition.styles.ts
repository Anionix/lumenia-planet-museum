import * as css from '@plumeria/core';

// llm machine contract; claim UUIDv5: 190fdb1a-2e41-565d-9aed-9fe5ca2179a6
// execution UUIDv7: 01a0a466-8ef5-7ceb-9da0-c6195d4d86ab; transition: exhibition controls -> compiled styles.
export const cosmicStyles = css.create({
  section: {
    margin: '0 0 48px',
    overflow: 'hidden',
    backgroundColor: '#080d1c',
    border: '1px solid #2c3750',
    borderTop: '2px solid #8dbbb8',
    borderRadius: '18px'
  },
  heading: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    padding: '24px 26px 12px'
  },
  title: {
    margin: '0',
    fontSize: 'clamp(24px, 3vw, 38px)',
    fontWeight: '400',
    color: '#f1eee3',
    letterSpacing: '-0.02em',
    textShadow: '0.8px 0 rgba(118, 231, 233, 0.35), -0.8px 0 rgba(241, 133, 184, 0.22)'
  },
  subtitle: {
    margin: '0',
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#b3bdd2'
  },
  surface: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 290px',
    '@media (max-width: 850px)': {
      gridTemplateColumns: '1fr'
    }
  },
  viewport: {
    position: 'relative',
    minWidth: '0',
    height: '520px',
    '@media (max-width: 850px)': {
      height: '410px'
    },
    '@media (max-width: 480px)': {
      height: '340px'
    }
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: '100%',
    touchAction: 'none',
    outlineOffset: '-4px',
    ':focus-visible': {
      outline: '2px solid #d5eab1'
    }
  },
  status: {
    position: 'absolute',
    top: '14px',
    right: '24px',
    left: '26px',
    margin: '0',
    fontSize: '14px',
    color: '#b3bdd2',
    pointerEvents: 'none'
  },
  overlay: {
    position: 'absolute',
    inset: '40% 10% auto',
    fontSize: '16px',
    color: '#d9dfed',
    textAlign: 'center'
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    padding: '12px 26px',
    borderTop: '1px solid #283249'
  },
  button: {
    padding: '10px 14px',
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#e9eddf',
    cursor: 'pointer',
    backgroundColor: '#111b30',
    border: '1px solid #45516b',
    borderRadius: '8px',
    ':hover': {
      backgroundColor: '#233049'
    },
    ':focus-visible': {
      outline: '2px solid #d5eab1',
      outlineOffset: '3px'
    },
    ':disabled': {
      cursor: 'default',
      opacity: '0.45'
    }
  },
  active: {
    color: '#d5eab1',
    backgroundColor: '#243333',
    borderColor: '#d5eab1'
  },
  help: {
    margin: '0',
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#a6b3cb'
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    backgroundColor: '#0c1425',
    borderLeft: '1px solid #283249',
    '@media (max-width: 850px)': {
      borderTop: '1px solid #283249',
      borderLeft: '0'
    }
  },
  personTitle: {
    margin: '0',
    fontSize: '23px',
    fontWeight: '400',
    lineHeight: '1.5',
    color: '#f1eee3'
  },
  body: {
    margin: '0',
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#c2cbdc'
  },
  source: {
    fontSize: '14px',
    color: '#d5eab1',
    overflowWrap: 'anywhere',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    ':focus-visible': {
      outline: '2px solid #d5eab1'
    }
  },
  sources: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '0',
    margin: '0',
    listStyleType: 'none'
  },
  timeline: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '16px 30px',
    padding: '20px 26px',
    borderTop: '1px solid #283249',
    '@media (max-width: 600px)': {
      gridTemplateColumns: '1fr'
    }
  },
  timelineHeading: {
    gridColumn: '1 / -1',
    margin: '0',
    fontSize: '17px',
    fontWeight: '400',
    color: '#eee7d4'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontSize: '14px',
    color: '#bdc8de'
  },
  range: {
    width: '100%',
    minWidth: '80px',
    minHeight: '28px',
    accentColor: '#d5eab1',
    cursor: 'pointer'
  },
  check: {
    display: 'flex',
    gridColumn: '1 / -1',
    gap: '10px',
    alignItems: 'center',
    fontSize: '14px',
    color: '#bdc8de'
  },
  time: {
    display: 'flex',
    flex: '1',
    gap: '12px',
    alignItems: 'center',
    minWidth: '200px',
    maxWidth: '360px',
    fontSize: '14px',
    color: '#bdc8de'
  },
  directory: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '8px',
    padding: '14px 26px 26px',
    '@media (max-width: 1000px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
    },
    '@media (max-width: 600px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      padding: '14px'
    }
  },
  personButton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minHeight: '76px',
    textAlign: 'left'
  },
  note: {
    display: 'block',
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#a6b3cb'
  },
  hidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    clipPath: 'inset(50%)'
  },
});
