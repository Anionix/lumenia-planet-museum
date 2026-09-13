import * as css from '@plumeria/core';

// llm machine contract; claim UUIDv5: 63c605f5-9e47-5b49-949f-cad7ce96b4ed
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: existing Lumenia design language -> compiled museum exhibition layout.
export const museumStyles = css.create({
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(340px, 1fr)',
    gap: '40px',
    alignItems: 'center',
    minHeight: '520px',
    padding: '40px 16px',
    '@media (max-width: 950px)': {
      gridTemplateColumns: '1fr',
      gap: '0',
      minHeight: '0',
      padding: '32px 0'
    }
  },
  title: {
    margin: '0',
    fontSize: 'clamp(46px, 5vw, 76px)',
    fontWeight: '400',
    lineHeight: '1.08',
    letterSpacing: '-0.035em'
  },
  description: {
    maxWidth: '480px',
    margin: '26px 0',
    fontSize: '17px',
    lineHeight: '1.9',
    color: '#949993'
  },
  entry: {
    display: 'inline-block',
    padding: '12px 0',
    fontSize: '15px',
    color: '#d0eb86',
    borderBottom: '1px solid #d0eb86'
  },
  constellation: {
    position: 'relative',
    minWidth: '0',
    height: '360px',
    overflow: 'hidden',
    '@media (max-width: 950px)': {
      width: '100%',
      maxWidth: '500px',
      height: '300px',
      margin: '10px auto 0'
    }
  },
  firstPlanet: {
    position: 'absolute',
    top: '17%',
    left: '2%',
    transform: 'scale(0.75)',
    transformOrigin: 'top left'
  },
  secondPlanet: {
    position: 'absolute',
    top: '0%',
    right: '0%',
    transform: 'scale(0.55)',
    transformOrigin: 'top right'
  },
  thirdPlanet: {
    position: 'absolute',
    right: '3%',
    bottom: '0%',
    transform: 'scale(0.62)',
    transformOrigin: 'bottom right'
  },
  exhibitions: {
    padding: '12px 16px 40px',
    '@media (max-width: 760px)': {
      padding: '8px 0 32px'
    }
  },
  heading: {
    padding: '26px 0',
    margin: '0',
    fontSize: '18px',
    fontWeight: '400',
    borderTop: '1px solid #303633'
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '40px',
    '@media (max-width: 800px)': {
      gridTemplateColumns: '1fr',
      gap: '28px'
    }
  },
  exhibitionTitle: {
    margin: '0 0 12px',
    fontSize: '24px',
    fontWeight: '400',
    lineHeight: '1.5'
  },
  exhibitionText: {
    margin: '0 0 12px',
    fontSize: '14px',
    lineHeight: '1.9',
    color: '#949993'
  },
  archive: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '24px',
    marginTop: '40px',
    fontSize: '14px',
    lineHeight: '1.8',
    borderTop: '1px solid #303633'
  },
});
