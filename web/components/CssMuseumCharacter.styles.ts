import * as css from '@plumeria/core';
// machine contract UUIDv5: 4908c1b1-0ebf-55ef-a83f-378e2bfdf4c5
// execution UUIDv7: 01a09b7c-3f68-756d-bae6-f55806a70d69
// transition: one inherited clock controls EVERY animated wrapper; gaze remains on separate layers.
const breathing=css.keyframes({'0%':{
  transform:'translateY(0)'
},'100%':{
  transform:'translateY(0)'
},'50%':{
  transform:'translateY(-1px)'
}});
const bouncing=css.keyframes({'0%':{
  transform:'translateY(0)'
},'50%':{
  transform:'translateY(0)'
},'100%':{
  transform:'translateY(0)'
},'25%':{
  transform:'translateY(-3px)'
},'75%':{
  transform:'translateY(-3px)'
}});
const jumping=css.keyframes({'0%':{
  transform:'translateY(0)'
},'100%':{
  transform:'translateY(0)'
},'18%':{
  transform:'translateY(2px)'
},'42%':{
  transform:'translateY(-9px)'
},'60%':{
  transform:'translateY(-9px)'
},'82%':{
  transform:'translateY(1px)'
}});
const sighing=css.keyframes({'0%':{
  transform:'translateY(0)'
},'100%':{
  transform:'translateY(0)'
},'40%':{
  transform:'translateY(3px)'
},'65%':{
  transform:'translateY(3px)'
}});
const blinking=css.keyframes({'0%':{
  transform:'scaleY(1)'
},'25%':{
  transform:'scaleY(1)'
},'38%':{
  transform:'scaleY(1)'
},'100%':{
  transform:'scaleY(1)'
},'29%':{
  transform:'scaleY(.08)'
},'33%':{
  transform:'scaleY(.08)'
}});
const strideA=css.keyframes({'0%':{
  transform:'rotate(24deg)'
},'100%':{
  transform:'rotate(24deg)'
},'50%':{
  transform:'rotate(-24deg)'
}});
const strideB=css.keyframes({'0%':{
  transform:'rotate(-24deg)'
},'100%':{
  transform:'rotate(-24deg)'
},'50%':{
  transform:'rotate(24deg)'
}});
const kneeA=css.keyframes({'0%':{
  transform:'rotate(0deg)'
},'50%':{
  transform:'rotate(0deg)'
},'100%':{
  transform:'rotate(0deg)'
},'25%':{
  transform:'rotate(32deg)'
},'75%':{
  transform:'rotate(-8deg)'
}});
const kneeB=css.keyframes({'0%':{
  transform:'rotate(0deg)'
},'50%':{
  transform:'rotate(0deg)'
},'100%':{
  transform:'rotate(0deg)'
},'75%':{
  transform:'rotate(32deg)'
},'25%':{
  transform:'rotate(-8deg)'
}});
const swingA=css.keyframes({'0%':{
  transform:'rotate(-30deg)'
},'100%':{
  transform:'rotate(-30deg)'
},'50%':{
  transform:'rotate(30deg)'
}});
const swingB=css.keyframes({'0%':{
  transform:'rotate(30deg)'
},'100%':{
  transform:'rotate(30deg)'
},'50%':{
  transform:'rotate(-30deg)'
}});
const waving=css.keyframes({'0%':{
  transform:'rotate(-12deg)'
},'100%':{
  transform:'rotate(-12deg)'
},'20%':{
  transform:'rotate(-140deg)'
},'65%':{
  transform:'rotate(-140deg)'
},'40%':{
  transform:'rotate(-115deg)'
},'80%':{
  transform:'rotate(-115deg)'
}});
const askingLeft=css.keyframes({'0%':{
  transform:'rotate(35deg)'
},'100%':{
  transform:'rotate(35deg)'
},'50%':{
  transform:'rotate(52deg)'
}});
const askingRight=css.keyframes({'0%':{
  transform:'rotate(-35deg)'
},'100%':{
  transform:'rotate(-35deg)'
},'50%':{
  transform:'rotate(-52deg)'
}});
const workingLeft=css.keyframes({'0%':{
  transform:'rotate(-28deg)'
},'100%':{
  transform:'rotate(-28deg)'
},'50%':{
  transform:'rotate(-40deg)'
}});
const workingRight=css.keyframes({'0%':{
  transform:'rotate(28deg)'
},'100%':{
  transform:'rotate(28deg)'
},'50%':{
  transform:'rotate(40deg)'
}});
const thinking=css.keyframes({'0%':{
  transform:'rotate(-4deg)'
},'100%':{
  transform:'rotate(-4deg)'
},'50%':{
  transform:'rotate(6deg)'
}});
const bowing=css.keyframes({'0%':{
  transform:'translateY(0) rotate(0)'
},'100%':{
  transform:'translateY(0) rotate(0)'
},'40%':{
  transform:'translateY(7px) rotate(8deg)'
},'65%':{
  transform:'translateY(7px) rotate(8deg)'
}});
const focusing=css.keyframes({'0%':{
  transform:'translateY(2px)'
},'100%':{
  transform:'translateY(2px)'
},'50%':{
  transform:'translateY(4px) rotate(-3deg)'
}});
export const characterStyles=css.create({
 root:{
   position:'relative',
   width:'192px',
   height:'208px',
   overflow:'hidden',
   userSelect:'none',
   isolation:'isolate'
 },
 clock:(duration:string,delay:string,play:string)=>({
   '--character-duration':duration,
   '--character-delay':delay,
   '--character-play':play
 }),
 motion:{
   animationDuration:'var(--character-duration)',
   animationTimingFunction:'ease-in-out',
   animationDelay:'var(--character-delay)',
   animationIterationCount:'infinite',
   animationPlayState:'var(--character-play)',
   '@media (prefers-reduced-motion: reduce)':{
     animationName:'none',
     animationPlayState:'paused'
   }
 },
 figure:{
   position:'absolute',
   inset:'0',
   transformOrigin:'96px 198px',
   scale:'0.92'
 },stance:{
   position:'absolute',
   inset:'0',
   transformOrigin:'96px 149px'
 },orientation:(value:string)=>({
   transform:`rotate(${value})`
 }),
 breathe:{
   animationName:breathing
 },bounce:{
   animationName:bouncing
 },jump:{
   animationName:jumping
 },sigh:{
   animationName:sighing
 },blink:{
   animationName:blinking
 },strideOne:{
   animationName:strideA
 },strideTwo:{
   animationName:strideB
 },kneeOne:{
   animationName:kneeA
 },kneeTwo:{
   animationName:kneeB
 },swingOne:{
   animationName:swingA
 },swingTwo:{
   animationName:swingB
 },wave:{
   animationName:waving
 },askLeft:{
   animationName:askingLeft
 },askRight:{
   animationName:askingRight
 },workLeft:{
   animationName:workingLeft
 },workRight:{
   animationName:workingRight
 },consider:{
   animationName:thinking
 },question:{
   animationName:thinking
 },bow:{
   animationName:bowing
 },focus:{
   animationName:focusing
 },
 neck:{
   position:'absolute',
   top:'76px',
   left:'86px',
   zIndex:1,
   width:'20px',
   height:'30px',
   background:'#d89c63',
   borderRadius:'8px'
 },
 browGaze:(top:string)=>({
   top
 }),eyeOpening:(height:string)=>({
   height
 }),
 torso:{
   position:'absolute',
   top:'90px',
   left:'64px',
   zIndex:2,
   boxSizing:'border-box',
   width:'64px',
   height:'63px',
   background:'linear-gradient(100deg,#98673f,#795031 65%,#65402b)',
   border:'2px solid #583d2a',
   borderRadius:'20px 20px 12px 12px'
 },
 shirt:{
   position:'absolute',
   top:'3px',
   left:'23px',
   width:'18px',
   height:'53px',
   background:'#f5e4bd',
   clipPath:'polygon(0 0,100% 0,90% 100%,10% 100%)'
 },
 lapelLeft:{
   position:'absolute',
   top:'4px',
   left:'9px',
   width:'20px',
   height:'42px',
   background:'#b08351',
   clipPath:'polygon(0 0,65% 0,100% 100%,15% 60%,40% 38%)'
 },
 lapelRight:{
   position:'absolute',
   top:'4px',
   right:'8px',
   width:'20px',
   height:'42px',
   background:'#976a42',
   clipPath:'polygon(100% 0,35% 0,0 100%,85% 60%,60% 38%)'
 },
 buttons:{
   position:'absolute',
   top:'20px',
   left:'30px',
   width:'3px',
   height:'3px',
   background:'#68482f',
   borderRadius:'50%',
   boxShadow:'0 10px #68482f,0 20px #68482f'
 },pocket:{
   position:'absolute',
   bottom:'10px',
   left:'8px',
   width:'12px',
   height:'10px',
   borderBottom:'2px solid #553b28',
   borderRadius:'2px'
 },
 arm:{
   position:'absolute',
   top:'96px',
   zIndex:3,
   boxSizing:'border-box',
   width:'19px',
   height:'32px',
   background:'linear-gradient(90deg,#a17549,#795031)',
   border:'1px solid #63432c',
   borderRadius:'11px',
   transformOrigin:'50% 7px'
 },leftArm:{
   left:'54px',
   transform:'rotate(8deg)'
 },rightArm:{
   left:'119px',
   transform:'rotate(-8deg)'
 },
 forearm:{
   position:'absolute',
   top:'24px',
   left:'0px',
   boxSizing:'border-box',
   width:'17px',
   height:'28px',
   background:'#8a5c38',
   border:'1px solid #63432c',
   borderRadius:'7px',
   transformOrigin:'50% 4px'
 },elbow:{
   transform:'rotate(-35deg)'
 },rightElbow:{
   transform:'rotate(35deg)'
 },rightWorkElbow:{
   transform:'rotate(92deg)'
 },openElbow:{
   transform:'rotate(-24deg)'
 },workElbow:{
   transform:'rotate(-92deg)'
 },chinElbow:{
   transform:'rotate(-135deg)'
 },waveElbow:{
   transform:'rotate(-15deg)'
 },reviewElbow:{
   transform:'rotate(15deg)'
 },reviewLeft:{
   transform:'rotate(-35deg)'
 },reviewRight:{
   transform:'rotate(-12deg)'
 },
 cuff:{
   position:'absolute',
   bottom:'0px',
   left:'1px',
   width:'13px',
   height:'4px',
   background:'#ebd7ae'
 },hand:{
   position:'absolute',
   top:'25px',
   left:'1px',
   boxSizing:'border-box',
   width:'13px',
   height:'15px',
   background:'linear-gradient(90deg,#edb67b,#d08d57)',
   border:'1px solid #a36c43',
   borderRadius:'6px 6px 7px 7px'
 },
 leg:{
   position:'absolute',
   top:'143px',
   zIndex:1,
   boxSizing:'border-box',
   width:'23px',
   height:'27px',
   background:'#44443c',
   border:'1px solid #30322d',
   borderRadius:'5px',
   transformOrigin:'50% 5px'
 },leftLeg:{
   left:'71px'
 },rightLeg:{
   left:'99px'
 },shin:{
   position:'absolute',
   top:'20px',
   left:'0px',
   boxSizing:'border-box',
   width:'21px',
   height:'27px',
   background:'linear-gradient(90deg,#515147,#393d36)',
   border:'1px solid #30322d',
   borderRadius:'4px',
   transformOrigin:'50% 4px'
 },boot:{
   position:'absolute',
   top:'20px',
   boxSizing:'border-box',
   width:'29px',
   height:'13px',
   background:'linear-gradient(#795138,#4a3326)',
   border:'1px solid #37291e',
   borderBottom:'3px solid #33281f',
   borderRadius:'8px 7px 4px 4px'
 },leftBoot:{
   left:'-6px'
 },rightBoot:{
   left:'-2px'
 },
 headMotion:{
   position:'absolute',
   top:'24px',
   left:'59px',
   zIndex:5,
   width:'74px',
   height:'75px',
   transformOrigin:'50% 90%'
 },head:{
   position:'absolute',
   inset:'0'
 },headGaze:(value:string)=>({
   transform:value
 }),faceGaze:(value:string)=>({
   transform:value
 }),pupilGaze:(value:string)=>({
   transform:value
 }),noseGaze:(value:string)=>({
   transform:value
 }),visibility:(value:number)=>({
   opacity:value
 }),
 hair:{
   position:'absolute',
   top:'0px',
   left:'2px',
   boxSizing:'border-box',
   width:'70px',
   height:'61px',
   background:'linear-gradient(110deg,#996331,#623b22)',
   border:'2px solid #4e311f',
   borderRadius:'47% 49% 39% 41%'
 },
 curls:{
   position:'absolute',
   top:'3px',
   left:'7px',
   boxSizing:'border-box',
   width:'16px',
   height:'16px',
   background:'#98612f',
   border:'2px solid #634021',
   borderRadius:'50%',
   boxShadow:'14px -5px 0 -1px #9e6a37,28px -4px 0 #81502b,42px 3px 0 #a16a34,-6px 14px 0 #85542c,48px 18px 0 #784927,-5px 31px 0 #754525,46px 34px 0 #704425'
 },
 ear:{
   position:'absolute',
   top:'31px',
   boxSizing:'border-box',
   width:'13px',
   height:'19px',
   background:'#d69a62',
   border:'2px solid #a56d43',
   borderRadius:'50%'
 },leftEar:{
   left:'4px'
 },rightEar:{
   right:'4px'
 },
 face:{
   position:'absolute',
   top:'15px',
   left:'13px',
   boxSizing:'border-box',
   width:'48px',
   height:'48px',
   background:'linear-gradient(100deg,#f3c18a,#e6a467)',
   border:'1px solid #bf8550',
   borderRadius:'43% 43% 40% 40%'
 },forelock:{
   position:'absolute',
   top:'-4px',
   left:'1px',
   width:'44px',
   height:'12px',
   background:'#88562c',
   borderRadius:'60% 30% 60% 20%',
   transform:'rotate(-7deg)'
 },
 brow:{
   position:'absolute',
   top:'13px',
   width:'12px',
   height:'4px',
   background:'#684124',
   borderRadius:'60%'
 },leftBrow:{
   left:'5px',
   transform:'rotate(-8deg)'
 },rightBrow:{
   right:'5px',
   transform:'rotate(8deg)'
 },
 socket:{
   position:'absolute',
   top:'19px',
   width:'11px',
   height:'8px',
   overflow:'hidden',
   background:'#fff3d8',
   borderRadius:'50%',
   transformOrigin:'50% 50%'
 },leftEye:{
   left:'6px'
 },rightEye:{
   right:'6px'
 },pupil:{
   position:'absolute',
   top:'1px',
   left:'3px',
   width:'5px',
   height:'6px',
   background:'#352c23',
   borderRadius:'50%'
 },
 nose:{
   position:'absolute',
   top:'23px',
   left:'18px',
   zIndex:3,
   width:'12px',
   height:'12px',
   background:'linear-gradient(90deg,#f4c08a,#d59059)',
   borderRight:'1px solid #b77743',
   borderBottom:'1px solid #b77743',
   borderRadius:'45% 50% 50% 45%'
 },
 beard:{
   position:'absolute',
   top:'30px',
   left:'-1px',
   boxSizing:'border-box',
   width:'48px',
   height:'29px',
   background:'linear-gradient(110deg,#99642e,#714522)',
   border:'1px solid #64401f',
   borderRadius:'16% 16% 44% 44%'
 },moustache:{
   position:'absolute',
   top:'34px',
   left:'10px',
   zIndex:4,
   width:'28px',
   height:'9px',
   background:'#764823',
   borderRadius:'50% 50% 45% 45%'
 },mouth:{
   position:'absolute',
   top:'44px',
   left:'18px',
   zIndex:3,
   width:'12px',
   height:'3px',
   borderBottom:'2px solid #51321e',
   borderRadius:'50%'
 }
});
