import * as css from '@plumeria/core';

// llm machine contract; claim UUIDv5: 20e6d64f-f964-5b32-9707-b01635fcba3f
// execution UUIDv7: 01a099d4-9840-7179-b6e0-2b7759333103
// state: module-scope style schema; transition: css.create -> extracted CSS
export const galleryStyles = css.create({
  shell: {
    maxWidth: '1680px',
    padding: '0 40px',
    margin: '0 auto',
    '@media (max-width: 760px)': {
      padding: '0 20px'
    }
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '74px',
    padding: '0 16px',
    borderBottom: '1px solid #303633',
    '@media (max-width: 760px)': {
      height: '66px',
      padding: '0'
    }
  },
  brand: {
    fontSize: '34px',
    fontWeight: '400',
    lineHeight: '1',
    letterSpacing: '0.02em',
    '@media (max-width: 760px)': {
      fontSize: '26px'
    }
  },
  navigation: {
    display: 'flex',
    gap: '40px',
    fontSize: '18px',
    color: '#949993',
    '@media (max-width: 760px)': {
      gap: '12px',
      fontSize: '12px'
    }
  },
  link: {
    ':hover': {
      color: '#d0eb86'
    }
  },
  headingArea: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 16px 0',
    '@media (max-width: 1000px)': {
      flexDirection: 'column',
      gap: '24px',
      alignItems: 'stretch'
    },
    '@media (max-width: 760px)': {
      padding: '30px 0 0'
    }
  },
  title: {
    margin: '0 0 14px',
    fontSize: '56px',
    fontWeight: '400',
    lineHeight: '1.2',
    letterSpacing: '0.055em',
    '@media (max-width: 760px)': {
      fontSize: '34px'
    }
  },
  description: {
    margin: '0',
    fontSize: '18px',
    lineHeight: '1.7',
    color: '#949993'
  },
  selector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '30px',
    alignItems: 'center',
    '@media (max-width: 760px)': {
      gap: '8px',
      justifyContent: 'space-between'
    }
  },
  option: {
    padding: '14px 12px',
    fontSize: '18px',
    color: '#949993',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid transparent',
    ':hover': {
      color: '#d0eb86'
    },
    '@media (max-width: 760px)': {
      padding: '12px 1px',
      fontSize: '14px'
    }
  },
  selected: {
    color: '#f1eee6',
    borderBottomColor: '#d0eb86'
  },
  viewport: {
    position: 'relative',
    display: 'grid',
    gridTemplateRows: 'minmax(0, 1fr)',
    gridTemplateColumns: 'minmax(0, 1fr)',
    placeItems: 'center',
    width: '100%',
    height: 'min(64vw, 660px)',
    minHeight: '300px',
    overflow: 'hidden',
    touchAction: 'none',
    '@media (max-width: 760px)': {
      height: '390px',
      minHeight: '0'
    }
  },
  artwork: {
    display: 'block',
    width: '100%',
    minWidth: '0',
    height: '100%',
    minHeight: '0',
    objectFit: 'contain'
  },
  empty: {
    fontSize: '16px',
    lineHeight: '2',
    color: '#949993',
    textAlign: 'center'
  },
  controls: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 16px',
    borderTop: '1px solid #303633',
    '@media (max-width: 1000px)': {
      flexWrap: 'wrap',
      gap: '24px'
    },
    '@media (max-width: 760px)': {
      gap: '24px',
      padding: '24px 0'
    }
  },
  buttons: {
    display: 'flex',
    gap: '20px'
  },
  button: {
    minWidth: '140px',
    padding: '13px 26px',
    fontSize: '16px',
    lineHeight: '1.3',
    color: '#f1eee6',
    backgroundColor: 'transparent',
    border: '1px solid #949993',
    ':hover': {
      borderColor: '#d0eb86'
    },
    ':disabled': {
      cursor: 'not-allowed',
      opacity: '0.4'
    },
    '@media (max-width: 760px)': {
      minWidth: '0',
      padding: '13px 23px'
    }
  },
  primary: {
    color: '#111313',
    backgroundColor: '#d0eb86',
    borderColor: '#d0eb86'
  },
  speed: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    fontSize: '15px',
    '@media (max-width: 760px)': {
      gap: '14px',
      justifyContent: 'space-between',
      width: '100%'
    }
  },
  slider: {
    width: '210px',
    accentColor: '#d0eb86',
    cursor: 'pointer',
    '@media (max-width: 760px)': {
      width: 'min(44vw, 210px)'
    }
  },
  value: {
    minWidth: '28px',
    fontVariantNumeric: 'tabular-nums'
  },
  hint: {
    margin: '0',
    fontSize: '15px',
    color: '#949993'
  },
  footer: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 16px',
    fontSize: '14px',
    color: '#949993',
    borderTop: '1px solid #303633',
    '@media (max-width: 760px)': {
      padding: '24px 0',
      fontSize: '13px'
    }
  },
  evidenceLink: {
    color: '#f1eee6',
    textDecoration: 'underline',
    textUnderlineOffset: '5px',
    ':hover': {
      color: '#d0eb86'
    }
  },
  error: {
    position: 'absolute',
    maxWidth: '540px',
    padding: '24px',
    fontSize: '16px',
    lineHeight: '1.7',
    color: '#f1c4b4',
    backgroundColor: '#111313'
  },
  records: {
    maxWidth: '860px',
    minHeight: '60vh',
    margin: '60px auto',
    lineHeight: '1.9'
  },
  recordList: {
    display: 'grid',
    gap: '0',
    padding: '0',
    margin: '40px 0',
    listStyle: 'none'
  },
  record: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    justifyContent: 'space-between',
    padding: '22px 0',
    borderTop: '1px solid #303633'
  },
});
