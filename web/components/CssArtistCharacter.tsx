import '@plumeria/core';
import { characterStyles as s } from './CssMuseumCharacter.styles';
import { portraitStyles as portrait } from './CssArtistCharacter.styles';
import { cssMuseumPeople } from '../artwork/css-museum-people.mjs';
import { characterMotion } from './character-motion';
// machine contract UUIDv5: 4908c1b1-0ebf-55ef-a83f-378e2bfdf4c5
// execution UUIDv7: 01a09b7c-3f68-756d-bae6-f55806a70d69
// transition: semantic props -> CSS variables -> synchronized animation; null gaze is neutral.
type Props = { personSlug: string; state?: string; lookDirection?: number | null; paused?: boolean; sampledTimeMilliseconds?: number };
export function CssArtistCharacter({personSlug,state='idle',lookDirection=null,paused=false,sampledTimeMilliseconds}:Props) {
  const person = cssMuseumPeople.find(person => person.slug === personSlug);
  if (!person) return null;
  const {current,direction,right,left,traveling,horizontal,vertical,duration,delay,frozen}=characterMotion(state,lookDirection,paused,sampledTimeMilliseconds);
  return <div data-css-museum-character="true" data-character-state={current} data-look-direction={direction??'neutral'} data-person-slug={personSlug} classStyle={[s.root,portrait.palette(person.hairColour,person.coatColour,person.shirtColour,person.trouserColour,person.accentColour),s.clock(`${duration}ms`,`${delay}ms`,frozen?'paused':'running')]}>
    <div classStyle={[s.figure,s.motion,current==='idle'&&s.breathe,traveling&&s.bounce,current==='jumping'&&s.jump,current==='failed'&&s.sigh]}>
      <div classStyle={[s.stance,s.orientation(right?'7deg':left?'-7deg':'0deg')]}>
        <div classStyle={[s.leg,portrait.trousers,s.leftLeg,s.motion,traveling&&s.strideOne]}><div classStyle={[s.shin,portrait.trousers,s.motion,traveling&&s.kneeOne]}><i classStyle={[s.boot,s.leftBoot]} /></div></div>
        <div classStyle={[s.leg,portrait.trousers,s.rightLeg,s.motion,traveling&&s.strideTwo]}><div classStyle={[s.shin,portrait.trousers,s.motion,traveling&&s.kneeTwo]}><i classStyle={[s.boot,s.rightBoot]} /></div></div>
        {person.clothing==='dress'&&<i classStyle={[portrait.dress,personSlug==='ray-eames'&&portrait.dottedDress,personSlug==='rei-kawakubo'&&portrait.asymmetry]}/>}<i classStyle={[s.neck]}/><div classStyle={[s.torso,portrait.jacket]}><i classStyle={[s.shirt,portrait.shirt]}/>{person.clothing==='jacket'&&<><i classStyle={[s.lapelLeft,portrait.lapel]}/><i classStyle={[s.lapelRight,portrait.lapel]}/><i classStyle={[portrait.tie]}/></>}{person.clothing==='turtleneck'&&<i classStyle={[portrait.collar]}/>}<i classStyle={[s.buttons]}/>{person.clothing==='dress'&&personSlug==='ray-eames'&&<i classStyle={[portrait.bow]}/>}<i classStyle={[s.pocket]}/></div>
        <div classStyle={[s.arm,portrait.jacket,s.leftArm,s.motion,traveling&&s.swingOne,current==='waiting'&&s.askLeft,current==='running'&&s.workLeft,current==='review'&&s.reviewLeft]}><div classStyle={[s.forearm,portrait.jacket,s.motion,traveling&&s.elbow,current==='waiting'&&s.openElbow,current==='running'&&s.workElbow,current==='review'&&s.chinElbow]}><i classStyle={[s.cuff,portrait.shirt]}/><i classStyle={[s.hand]}/></div></div>
        <div classStyle={[s.arm,portrait.jacket,s.rightArm,s.motion,traveling&&s.swingTwo,current==='waving'&&s.wave,current==='waiting'&&s.askRight,current==='running'&&s.workRight,current==='review'&&s.reviewRight]}><div classStyle={[s.forearm,portrait.jacket,s.motion,traveling&&s.rightElbow,current==='waving'&&s.waveElbow,current==='waiting'&&s.openElbow,current==='running'&&s.rightWorkElbow,current==='review'&&s.reviewElbow]}><i classStyle={[s.cuff,portrait.shirt]}/><i classStyle={[s.hand]}/></div></div>
        <div classStyle={[s.headMotion,s.motion,current==='failed'&&s.bow,current==='review'&&s.consider,current==='waiting'&&s.question,current==='running'&&s.focus]}>
          <div classStyle={[s.head,s.headGaze(`perspective(160px) translate(${horizontal*3}px,${vertical*3}px) rotateX(${-vertical*18}deg)`)]}>
            {person.hair==='bun'&&<i classStyle={[portrait.bun]}/>}<i classStyle={[s.hair,portrait.hair,person.hair==='swept'&&portrait.swept,person.hair==='cropped'&&portrait.cropped,person.hair==='balding'&&portrait.balding,person.hair==='bob'&&portrait.bob]}/>{person.hair==='curly'&&<i classStyle={[s.curls,portrait.curls]}/>}
            <i classStyle={[s.ear,s.leftEar,s.visibility(1-Math.max(0,-horizontal)*.85)]}/><i classStyle={[s.ear,s.rightEar,s.visibility(1-Math.max(0,horizontal)*.85)]}/>
            <div classStyle={[s.face,s.faceGaze(`translate(${horizontal*11}px,${vertical*9}px) scaleX(${1-Math.abs(horizontal)*.22})`)]}>
              {person.hair!=='balding'&&<i classStyle={[s.forelock,portrait.fringe,person.hair==='bob'&&portrait.straightFringe,person.hair==='swept'&&portrait.sweptFringe]}/>}<i classStyle={[s.brow,portrait.fringe,s.browGaze(`${13+vertical*2}px`),s.leftBrow]}/><i classStyle={[s.brow,portrait.fringe,s.browGaze(`${13+vertical*2}px`),s.rightBrow]}/>
              <span classStyle={[s.socket,s.eyeOpening(`${8-vertical*1.5}px`),s.leftEye,s.motion,s.blink,s.visibility(1-Math.max(0,-horizontal)*.82)]}><i classStyle={[s.pupil,s.pupilGaze(`translate(${horizontal*2.5}px,${vertical*3.5}px)`)]}/></span>
              <span classStyle={[s.socket,s.eyeOpening(`${8-vertical*1.5}px`),s.rightEye,s.motion,s.blink,s.visibility(1-Math.max(0,horizontal)*.82)]}><i classStyle={[s.pupil,s.pupilGaze(`translate(${horizontal*2.5}px,${vertical*3.5}px)`)]}/></span>
              {['full','short','goatee'].includes(person.beard)&&<i classStyle={[s.beard,portrait.beard,person.beard==='short'&&portrait.shortBeard,person.beard==='goatee'&&portrait.goatee]}/>}<i classStyle={[s.nose,s.noseGaze(`translate(${horizontal*10}px,${vertical*3}px)`)]}/>{person.beard!=='none'&&<i classStyle={[s.moustache,portrait.fringe,s.noseGaze(`translateX(${horizontal*5}px)`)]}/>}<i classStyle={[s.mouth,person.clothing==='dress'&&portrait.smile]}/>{person.glasses!=='none'&&<span classStyle={[portrait.glasses]}><i classStyle={[portrait.lens,portrait.leftLens,person.glasses==='square'&&portrait.squareLens]}/><i classStyle={[portrait.bridge]}/><i classStyle={[portrait.lens,portrait.rightLens,person.glasses==='square'&&portrait.squareLens]}/></span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
export default CssArtistCharacter;
