import '@plumeria/core';
import { characterStyles as s } from './CssMuseumCharacter.styles';
// machine contract UUIDv5: 4908c1b1-0ebf-55ef-a83f-378e2bfdf4c5
// execution UUIDv7: 01a09b7c-3f68-756d-bae6-f55806a70d69
// transition: semantic props -> CSS variables -> synchronized animation; null gaze is neutral.
type Props = { state?: string; lookDirection?: number | null; paused?: boolean; sampledTimeMilliseconds?: number };
const durations: Record<string, number> = { idle:1100, 'running-right':1060, 'running-left':1060, waving:700, jumping:840, failed:1220, waiting:1010, running:820, review:1030 };
export function CssMuseumCharacter({state='idle',lookDirection=null,paused=false,sampledTimeMilliseconds}:Props) {
  const current=Object.hasOwn(durations,state)?state:'idle';
  const direction=Number.isInteger(lookDirection)?((lookDirection!%16)+16)%16:null;
  const right=current==='running-right', left=current==='running-left', traveling=right||left;
  const horizontal=direction===null?(right?1:left?-1:0):Math.sin(direction*Math.PI/8);
  const vertical=direction===null?0:-Math.cos(direction*Math.PI/8);
  const duration=durations[current];
  const sampled=Number.isFinite(sampledTimeMilliseconds);
  const delay=sampled?-(((sampledTimeMilliseconds!%duration)+duration)%duration):0;
  const frozen=paused||sampled||direction!==null;
  return <div data-css-museum-character="true" data-character-state={current} data-look-direction={direction??'neutral'} classStyle={[s.root,s.clock(`${duration}ms`,`${delay}ms`,frozen?'paused':'running')]}>
    <div classStyle={[s.figure,s.motion,current==='idle'&&s.breathe,traveling&&s.bounce,current==='jumping'&&s.jump,current==='failed'&&s.sigh]}>
      <div classStyle={[s.stance,s.orientation(right?'7deg':left?'-7deg':'0deg')]}>
        <div classStyle={[s.leg,s.leftLeg,s.motion,traveling&&s.strideOne]}><div classStyle={[s.shin,s.motion,traveling&&s.kneeOne]}><i classStyle={[s.boot,s.leftBoot]} /></div></div>
        <div classStyle={[s.leg,s.rightLeg,s.motion,traveling&&s.strideTwo]}><div classStyle={[s.shin,s.motion,traveling&&s.kneeTwo]}><i classStyle={[s.boot,s.rightBoot]} /></div></div>
        <div classStyle={[s.torso]}><i classStyle={[s.shirt]}/><i classStyle={[s.lapelLeft]}/><i classStyle={[s.lapelRight]}/><i classStyle={[s.buttons]}/><i classStyle={[s.pocket]}/></div>
        <div classStyle={[s.arm,s.leftArm,s.motion,traveling&&s.swingOne,current==='waiting'&&s.askLeft,current==='running'&&s.workLeft,current==='review'&&s.reviewLeft]}><div classStyle={[s.forearm,s.motion,traveling&&s.elbow,current==='waiting'&&s.openElbow,current==='running'&&s.workElbow,current==='review'&&s.chinElbow]}><i classStyle={[s.cuff]}/><i classStyle={[s.hand]}/></div></div>
        <div classStyle={[s.arm,s.rightArm,s.motion,traveling&&s.swingTwo,current==='waving'&&s.wave,current==='waiting'&&s.askRight,current==='running'&&s.workRight,current==='review'&&s.reviewRight]}><div classStyle={[s.forearm,s.motion,traveling&&s.rightElbow,current==='waving'&&s.waveElbow,current==='waiting'&&s.openElbow,current==='running'&&s.rightWorkElbow,current==='review'&&s.reviewElbow]}><i classStyle={[s.cuff]}/><i classStyle={[s.hand]}/></div></div>
        <div classStyle={[s.headMotion,s.motion,current==='failed'&&s.bow,current==='review'&&s.consider,current==='waiting'&&s.question,current==='running'&&s.focus]}>
          <div classStyle={[s.head,s.headGaze(`translate(${horizontal*3}px,${vertical*2}px)`)]}>
            <i classStyle={[s.hair]}/><i classStyle={[s.curls]}/>
            <i classStyle={[s.ear,s.leftEar,s.visibility(1-Math.max(0,-horizontal)*.85)]}/><i classStyle={[s.ear,s.rightEar,s.visibility(1-Math.max(0,horizontal)*.85)]}/>
            <div classStyle={[s.face,s.faceGaze(`translate(${horizontal*11}px,${vertical*5}px) scaleX(${1-Math.abs(horizontal)*.22})`)]}>
              <i classStyle={[s.forelock]}/><i classStyle={[s.brow,s.leftBrow]}/><i classStyle={[s.brow,s.rightBrow]}/>
              <span classStyle={[s.socket,s.leftEye,s.motion,s.blink,s.visibility(1-Math.max(0,-horizontal)*.82)]}><i classStyle={[s.pupil,s.pupilGaze(`translate(${horizontal*2.5}px,${vertical*2}px)`)]}/></span>
              <span classStyle={[s.socket,s.rightEye,s.motion,s.blink,s.visibility(1-Math.max(0,horizontal)*.82)]}><i classStyle={[s.pupil,s.pupilGaze(`translate(${horizontal*2.5}px,${vertical*2}px)`)]}/></span>
              <i classStyle={[s.beard]}/><i classStyle={[s.nose,s.noseGaze(`translate(${horizontal*10}px,${vertical*3}px)`)]}/><i classStyle={[s.moustache,s.noseGaze(`translateX(${horizontal*5}px)`)]}/><i classStyle={[s.mouth]}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
export default CssMuseumCharacter;
