import * as css from '@plumeria/core';

// llm machine contract; claimIdentifier: 8b952955-8da1-53ed-8cc0-87934f160bfa
// executionIdentifier: 01a09af7-f340-76cb-86a7-4075de7842d3
// state: generated; transition: animation durations -> build-time keyframes. Do not hand-edit.
const idleFrames = css.keyframes({"0%":{
  "backgroundPosition":"0px 0px"
},"25.45454545%":{
  "backgroundPosition":"-192px 0px"
},"35.45454545%":{
  "backgroundPosition":"-384px 0px"
},"45.45454545%":{
  "backgroundPosition":"-576px 0px"
},"58.18181818%":{
  "backgroundPosition":"-768px 0px"
},"70.90909091%":{
  "backgroundPosition":"-960px 0px"
},"100%":{
  "backgroundPosition":"0px 0px"
}});
const runningRightFrames = css.keyframes({"0%":{
  "backgroundPosition":"0px -208px"
},"11.32075472%":{
  "backgroundPosition":"-192px -208px"
},"22.64150943%":{
  "backgroundPosition":"-384px -208px"
},"33.96226415%":{
  "backgroundPosition":"-576px -208px"
},"45.28301887%":{
  "backgroundPosition":"-768px -208px"
},"56.60377358%":{
  "backgroundPosition":"-960px -208px"
},"67.9245283%":{
  "backgroundPosition":"-1152px -208px"
},"79.24528302%":{
  "backgroundPosition":"-1344px -208px"
},"100%":{
  "backgroundPosition":"0px -208px"
}});
const runningLeftFrames = css.keyframes({"0%":{
  "backgroundPosition":"0px -416px"
},"11.32075472%":{
  "backgroundPosition":"-192px -416px"
},"22.64150943%":{
  "backgroundPosition":"-384px -416px"
},"33.96226415%":{
  "backgroundPosition":"-576px -416px"
},"45.28301887%":{
  "backgroundPosition":"-768px -416px"
},"56.60377358%":{
  "backgroundPosition":"-960px -416px"
},"67.9245283%":{
  "backgroundPosition":"-1152px -416px"
},"79.24528302%":{
  "backgroundPosition":"-1344px -416px"
},"100%":{
  "backgroundPosition":"0px -416px"
}});
const wavingFrames = css.keyframes({"0%":{
  "backgroundPosition":"0px -624px"
},"20%":{
  "backgroundPosition":"-192px -624px"
},"40%":{
  "backgroundPosition":"-384px -624px"
},"60%":{
  "backgroundPosition":"-576px -624px"
},"100%":{
  "backgroundPosition":"0px -624px"
}});
const jumpingFrames = css.keyframes({"0%":{
  "backgroundPosition":"0px -832px"
},"16.66666667%":{
  "backgroundPosition":"-192px -832px"
},"33.33333333%":{
  "backgroundPosition":"-384px -832px"
},"50%":{
  "backgroundPosition":"-576px -832px"
},"66.66666667%":{
  "backgroundPosition":"-768px -832px"
},"100%":{
  "backgroundPosition":"0px -832px"
}});
const failedFrames = css.keyframes({"0%":{
  "backgroundPosition":"0px -1040px"
},"11.47540984%":{
  "backgroundPosition":"-192px -1040px"
},"22.95081967%":{
  "backgroundPosition":"-384px -1040px"
},"34.42622951%":{
  "backgroundPosition":"-576px -1040px"
},"45.90163934%":{
  "backgroundPosition":"-768px -1040px"
},"57.37704918%":{
  "backgroundPosition":"-960px -1040px"
},"68.85245902%":{
  "backgroundPosition":"-1152px -1040px"
},"80.32786885%":{
  "backgroundPosition":"-1344px -1040px"
},"100%":{
  "backgroundPosition":"0px -1040px"
}});
const waitingFrames = css.keyframes({"0%":{
  "backgroundPosition":"0px -1248px"
},"14.85148515%":{
  "backgroundPosition":"-192px -1248px"
},"29.7029703%":{
  "backgroundPosition":"-384px -1248px"
},"44.55445545%":{
  "backgroundPosition":"-576px -1248px"
},"59.40594059%":{
  "backgroundPosition":"-768px -1248px"
},"74.25742574%":{
  "backgroundPosition":"-960px -1248px"
},"100%":{
  "backgroundPosition":"0px -1248px"
}});
const runningFrames = css.keyframes({"0%":{
  "backgroundPosition":"0px -1456px"
},"14.63414634%":{
  "backgroundPosition":"-192px -1456px"
},"29.26829268%":{
  "backgroundPosition":"-384px -1456px"
},"43.90243902%":{
  "backgroundPosition":"-576px -1456px"
},"58.53658537%":{
  "backgroundPosition":"-768px -1456px"
},"73.17073171%":{
  "backgroundPosition":"-960px -1456px"
},"100%":{
  "backgroundPosition":"0px -1456px"
}});
const reviewFrames = css.keyframes({"0%":{
  "backgroundPosition":"0px -1664px"
},"14.5631068%":{
  "backgroundPosition":"-192px -1664px"
},"29.12621359%":{
  "backgroundPosition":"-384px -1664px"
},"43.68932039%":{
  "backgroundPosition":"-576px -1664px"
},"58.25242718%":{
  "backgroundPosition":"-768px -1664px"
},"72.81553398%":{
  "backgroundPosition":"-960px -1664px"
},"100%":{
  "backgroundPosition":"0px -1664px"
}});
export const characterAnimationStyles = css.create({idle: {
  backgroundPosition: '0px 0px',
  animationName: idleFrames,
  animationDuration: '1100ms'
},runningRight: {
  backgroundPosition: '0px -208px',
  animationName: runningRightFrames,
  animationDuration: '1060ms'
},runningLeft: {
  backgroundPosition: '0px -416px',
  animationName: runningLeftFrames,
  animationDuration: '1060ms'
},waving: {
  backgroundPosition: '0px -624px',
  animationName: wavingFrames,
  animationDuration: '700ms'
},jumping: {
  backgroundPosition: '0px -832px',
  animationName: jumpingFrames,
  animationDuration: '840ms'
},failed: {
  backgroundPosition: '0px -1040px',
  animationName: failedFrames,
  animationDuration: '1220ms'
},waiting: {
  backgroundPosition: '0px -1248px',
  animationName: waitingFrames,
  animationDuration: '1010ms'
},running: {
  backgroundPosition: '0px -1456px',
  animationName: runningFrames,
  animationDuration: '820ms'
},review: {
  backgroundPosition: '0px -1664px',
  animationName: reviewFrames,
  animationDuration: '1030ms'
}});
