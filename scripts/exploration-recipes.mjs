// llm machine contract; UUIDv5: be15d308-d6c7-5b93-aca4-32206c14ac81.
// transition: reference picture and cited profile -> newly designed closed geometry.
// These are authored reconstructions, not recovered depth or the artist's own work.
export function sottsassShapes() {
  const shapes = [
    {kind:'sphere', parameters:[8], position:[0,0,0], color:'#db775f'},
    {kind:'sphere', parameters:[7.96], position:[0,-0.15,0], scale:[1,1.02,1], color:'#678d7c'},
    {kind:'annulus', parameters:[14.2,8.7,0.65], position:[0,0,0], rotation:[1.2,0.2,-0.2], color:'#edbb46'},
    {kind:'annulus', parameters:[11.5,8.6,0.8], position:[0,0,0], rotation:[0,0.3,-0.15], color:'#4d66ad'},
    {kind:'cylinder', parameters:[0,4,9,3], position:[7,2,-4], rotation:[0,0,-0.8], scale:[1,1,0.22], color:'#68a294'},
    {kind:'cylinder', parameters:[0,4,9,3], position:[-6,-3,-2], rotation:[0,0,2.5], scale:[1,1,0.22], color:'#e9987e'},
    {kind:'sphere', parameters:[2.1], position:[-18,-3,-7], color:'#d3bd8b'},
    {kind:'torus', parameters:[3,0.5], position:[-17,5,8], color:'#e7b74c'},
    {kind:'box', parameters:[7,0.6,6], position:[-17,0,8], color:'#516aa8'},
  ];
  for (let row=0; row<4; row++) for(let column=0;column<4;column++) {
    shapes.push({kind:'box',parameters:[1.7,0.1,1.45],position:[-19.6+column*1.75,0.35,5.8+row*1.5],color:(row+column)%2?'#ebdfc8':'#242632',collision:false});
  }
  return shapes;
}

export const worldRecipes = {
  'ettore-sottsass': {shapes:sottsassShapes, background:'#0c0914', accent:'#efb864',
    description:'赤い惑星、黄色い環、青いアーチ。色と幾何学が重なる宇宙を、裏側まで。',
    spawn:{position:[23,12,34],target:[0,1,0]},
    passage:{position:[-17,5,8],radius:3,tube:0.5},
    landmarks:[{name:'環の手前へ',position:[-17,5,16],target:[-17,5,0]},
      {name:'惑星のそばへ',position:[13,2,10],target:[0,0,0]},
      {name:'着地できる台へ',position:[-17,5,10],target:[-17,0,10]}]},
};
