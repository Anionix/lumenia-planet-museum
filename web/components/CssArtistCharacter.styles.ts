import * as css from '@plumeria/core';
// llm machine contract; claimIdentifier: ed4d2a7d-4345-5bdb-bddc-c88a6c943d9f
// executionIdentifier: 01a09b9a-b6e8-7acd-945f-f8877b4e1caa
// transition: fictional appearance palette -> shared articulated CSS body; no raster or drawing loop.
export const portraitStyles = css.create({
 palette:(hair:string,coat:string,shirt:string,trousers:string,accent:string)=>({
   '--portrait-hair':hair,
   '--portrait-coat':coat,
   '--portrait-shirt':shirt,
   '--portrait-trousers':trousers,
   '--portrait-accent':accent
 }),
 hair:{
   background:'var(--portrait-hair)',
   borderColor:'var(--portrait-hair)'
 },
 curls:{
   background:'var(--portrait-hair)',
   borderColor:'var(--portrait-hair)',
   boxShadow:'14px -5px 0 -1px var(--portrait-hair),28px -4px 0 var(--portrait-hair),42px 3px 0 var(--portrait-hair),-6px 14px 0 var(--portrait-hair),48px 18px 0 var(--portrait-hair),-5px 31px 0 var(--portrait-hair),46px 34px 0 var(--portrait-hair)'
 },
 swept:{
   height:'51px',
   borderRadius:'58% 35% 28% 35%'
 },cropped:{
   height:'46px',
   borderRadius:'45% 45% 22% 22%'
 },
 balding:{
   background:'linear-gradient(90deg,var(--portrait-hair) 15%,#e5aa75 16% 84%,var(--portrait-hair) 85%)',
   borderColor:'#d69a62'
 },
 bob:{
   left:'-1px',
   width:'76px',
   height:'79px',
   borderRadius:'44% 44% 8% 8%'
 },
 bun:{
   position:'absolute',
   top:'-6px',
   left:'45px',
   width:'25px',
   height:'25px',
   background:'var(--portrait-hair)',
   border:'2px solid #47382e',
   borderRadius:'50%'
 },
 fringe:{
   background:'var(--portrait-hair)'
 },straightFringe:{
   top:'-6px',
   left:'0px',
   width:'46px',
   height:'17px',
   borderRadius:'3px',
   transform:'none'
 },
 sweptFringe:{
   top:'-8px',
   left:'-1px',
   width:'43px',
   height:'16px',
   borderRadius:'80% 12% 80% 12%',
   transform:'rotate(-14deg)'
 },
 jacket:{
   background:'var(--portrait-coat)',
   borderColor:'#44413b'
 },shirt:{
   background:'var(--portrait-shirt)'
 },lapel:{
   background:'color-mix(in srgb,var(--portrait-coat),white 16%)'
 },
 trousers:{
   background:'var(--portrait-trousers)',
   borderColor:'#353735'
 },beard:{
   background:'var(--portrait-hair)',
   borderColor:'var(--portrait-hair)'
 },
 shortBeard:{
   top:'33px',
   height:'22px',
   borderRadius:'12% 12% 44% 44%'
 },goatee:{
   top:'35px',
   left:'13px',
   width:'22px',
   height:'23px',
   borderRadius:'10% 10% 46% 46%'
 },
 collar:{
   position:'absolute',
   top:'-2px',
   left:'20px',
   width:'24px',
   height:'15px',
   background:'var(--portrait-coat)',
   borderBottom:'2px solid #ffffff16',
   borderRadius:'3px'
 },
 tie:{
   position:'absolute',
   top:'9px',
   left:'27px',
   width:'11px',
   height:'33px',
   background:'var(--portrait-accent)',
   clipPath:'polygon(50% 0,100% 15%,65% 30%,95% 90%,50% 100%,5% 90%,35% 30%,0 15%)'
 },
 bow:{
   position:'absolute',
   top:'4px',
   left:'20px',
   width:'26px',
   height:'13px',
   background:'var(--portrait-accent)',
   clipPath:'polygon(0 0,48% 35%,100% 0,100% 100%,52% 65%,0 100%)'
 },
 dress:{
   position:'absolute',
   top:'132px',
   left:'53px',
   zIndex:2,
   width:'87px',
   height:'48px',
   background:'var(--portrait-coat)',
   border:'1px solid #35333a',
   clipPath:'polygon(19% 0,80% 0,100% 100%,0 100%)'
 },
 dottedDress:{
   background:'radial-gradient(circle at 5px 5px,var(--portrait-accent) 2px,transparent 3px),var(--portrait-coat)',
   backgroundSize:'14px 14px'
 },
 asymmetry:{
   left:'49px',
   width:'91px',
   height:'52px',
   clipPath:'polygon(19% 0,80% 0,100% 86%,32% 100%,0 89%)'
 },
 glasses:{
   position:'absolute',
   top:'16px',
   left:'0px',
   zIndex:5,
   width:'46px',
   height:'17px',
   pointerEvents:'none'
 },
 lens:{
   position:'absolute',
   top:'0px',
   boxSizing:'border-box',
   width:'19px',
   height:'15px',
   border:'2px solid #353431',
   borderRadius:'48%'
 },leftLens:{
   left:'1px'
 },rightLens:{
   right:'1px'
 },squareLens:{
   borderRadius:'3px'
 },
 bridge:{
   position:'absolute',
   top:'6px',
   left:'20px',
   width:'6px',
   height:'2px',
   background:'#353431'
 },
 smile:{
   left:'17px',
   width:'14px',
   height:'4px',
   borderBottomWidth:'2px',
   borderRadius:'0 0 60% 60%'
 },
 thumbnail:{
   position:'relative',
   width:'110px',
   height:'112px',
   overflow:'hidden'
 },thumbnailScale:{
   position:'absolute',
   top:'-42px',
   left:'-41px',
   transformOrigin:'96px 104px',
   scale:'0.56'
 },
 directory:{
   display:'grid',
   gridTemplateColumns:'repeat(auto-fit,minmax(195px,1fr))',
   gap:'18px',
   marginTop:'26px'
 },
 card:{
   display:'flex',
   gap:'5px',
   alignItems:'center',
   padding:'8px 0',
   color:'#e9e5da',
   textDecoration:'none',
   borderTop:'1px solid #555a4e',
   ':hover':{
     borderColor:'#d8b97a'
   }
 },
 name:{
   fontSize:'16px',
   fontWeight:'400',
   lineHeight:'1.6'
 },note:{
   display:'block',
   marginTop:'6px',
   fontSize:'13px',
   color:'#a4aa9c'
 }
});
