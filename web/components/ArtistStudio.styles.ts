import * as css from '@plumeria/core';

// llm machine contract; claim UUIDv5: 68d2fd0d-a670-583b-88b5-cbed5fa5ef83
// execution UUIDv7: 01a09ad3-4fb7-78b0-bbc0-77a8f7eb5016
// transition: fictional studio scene -> build-time CSS -> explicitly staged material reveal.
export const studioStyles = css.create({
  introduction: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    alignItems: 'end',
    justifyContent: 'space-between',
    padding: '28px 16px 18px',
    '@media (max-width: 760px)': {
      padding: '24px 0 18px'
    }
  },
  title: {
    margin: '0',
    fontSize: 'clamp(24px, 3vw, 40px)',
    fontWeight: '400',
    lineHeight: '1.4'
  },
  period: {
    margin: '9px 0 0',
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#949993'
  },
  scene: {
    position: 'relative',
    height: 'min(62vw, 520px)',
    minHeight: '330px',
    overflow: 'hidden',
    backgroundImage: 'linear-gradient(100deg,#141b18 0%,#313a2f 60%,#414433 100%)',
    border: '1px solid #42483b'
  },
  light: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '72%',
    height: '100%',
    pointerEvents: 'none',
    backgroundImage: 'linear-gradient(130deg,transparent 22%,#ddce9866 23%,#ddce9800 77%)',
    opacity: '0.35'
  },
  window: {
    position: 'absolute',
    top: '9%',
    right: '8%',
    width: '18%',
    height: '39%',
    backgroundColor: '#b7b99c',
    backgroundImage: 'linear-gradient(transparent 46%,#26312a 46%,#26312a 51%,transparent 51%),linear-gradient(90deg,transparent 46%,#26312a 46%,#26312a 51%,transparent 51%)',
    border: '9px solid #26312a',
    boxShadow: '0 0 65px #d3c79430'
  },
  rail: {
    position: 'absolute',
    top: '61%',
    right: '0',
    left: '0',
    height: '2px',
    backgroundColor: '#aaa18633'
  },
  figure: {
    position: 'absolute',
    bottom: '13%',
    left: '9%',
    width: '192px',
    height: '208px',
    transform: 'scale(1.5)',
    transformOrigin: '0 100%',
    '@media (max-width: 760px)': {
      left: '4%',
      transform: 'scale(1.1)'
    },
    '@media (max-width: 480px)': {
      bottom: '12%',
      left: '4px',
      transform: 'scale(0.78)'
    }
  },
  worktable: {
    position: 'absolute',
    right: '9%',
    bottom: '5%',
    left: '9%',
    height: '32%',
    backgroundImage: 'linear-gradient(8deg,#524131,#8a7254)',
    borderTop: '2px solid #bda079',
    boxShadow: '0 20px 40px #00000080',
    transform: 'perspective(600px) rotateX(48deg)',
    transformOrigin: '50% 100%'
  },
  sheet: {
    position: 'absolute',
    bottom: '11%',
    left: '19%',
    width: '33%',
    height: '17%',
    backgroundColor: '#c1b895',
    boxShadow: '2px 8px 12px #00000044',
    transform: 'skewY(-5deg) rotate(-8deg)'
  },
  brush: {
    position: 'absolute',
    bottom: '21%',
    left: '49%',
    width: '100px',
    height: '7px',
    backgroundColor: '#9d6e43',
    borderLeft: '25px solid #292b23',
    boxShadow: '1px 3px 2px #00000044',
    transform: 'rotate(-32deg)'
  },
  artwork: {
    position: 'absolute',
    top: '19%',
    left: 'calc(61% - 120px)',
    transform: 'scale(1.18)',
    animationDuration: '36s',
    animationPlayState: 'paused',
    '@media (max-width: 760px)': {
      top: '14%',
      transform: 'scale(0.85)'
    },
    '@media (max-width: 480px)': {
      top: '15%',
      left: 'calc(70% - 120px)',
      transform: 'scale(0.68)'
    }
  },
  reveal: (clip: string) => ({
    '--material-reveal': clip
  }),
  sceneNote: {
    position: 'absolute',
    bottom: '16px',
    left: '20px',
    fontSize: '12px',
    color: '#d2cbb7'
  },
  dialogue: {
    display: 'grid',
    gridTemplateColumns: '200px minmax(0,1fr)',
    gap: '28px',
    padding: '26px 16px',
    '@media (max-width: 760px)': {
      gridTemplateColumns: '1fr',
      gap: '12px',
      padding: '24px 0'
    }
  },
  speaker: {
    margin: '0',
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#d0eb86'
  },
  qualifier: {
    display: 'block',
    fontSize: '12px',
    color: '#949993'
  },
  speech: {
    minHeight: '4em',
    margin: '0',
    fontSize: 'clamp(17px, 2vw, 22px)',
    lineHeight: '1.9'
  },
  choices: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '20px'
  },
  choice: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#f1eee6',
    backgroundColor: 'transparent',
    border: '1px solid #53594f',
    ':hover': {
      borderColor: '#d0eb86'
    }
  },
  chosen: {
    color: '#111313',
    backgroundColor: '#d0eb86',
    borderColor: '#d0eb86'
  },
  motionControl: {
    display: 'block',
    padding: '10px 0',
    marginTop: '8px',
    fontSize: '13px',
    color: '#aab49d',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    backgroundColor: 'transparent',
    border: '0'
  },
  sources: {
    maxWidth: '960px',
    paddingTop: '24px',
    margin: '12px 16px 40px',
    borderTop: '1px solid #303633',
    '@media (max-width: 760px)': {
      margin: '12px 0 32px'
    }
  },
});
