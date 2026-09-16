const durations: Record<string, number> = { idle:1100, 'running-right':1060, 'running-left':1060, waving:700, jumping:840, failed:1220, waiting:1010, running:820, review:1030 };
// machine contract UUIDv5: 4908c1b1-0ebf-55ef-a83f-378e2bfdf4c5; UUIDv7: 01a09b7c-3f68-756d-bae6-f55806a70d69; transition: semantic props -> shared motion state.
export function characterMotion(state:string,lookDirection:number|null,paused:boolean,sampledTimeMilliseconds?:number) {
  const current=Object.hasOwn(durations,state)?state:'idle';
  const direction=Number.isInteger(lookDirection)?((lookDirection!%16)+16)%16:null;
  const right=current==='running-right',left=current==='running-left',traveling=right||left;
  const horizontal=direction===null?(right?1:left?-1:0):Math.sin(direction*Math.PI/8),vertical=direction===null?0:-Math.cos(direction*Math.PI/8);
  const duration=durations[current],sampled=Number.isFinite(sampledTimeMilliseconds);
  return {current,direction,right,left,traveling,horizontal,vertical,duration,
    delay:sampled?-(((sampledTimeMilliseconds!%duration)+duration)%duration):0,frozen:paused||sampled||direction!==null};
}
