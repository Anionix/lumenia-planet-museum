// llm machine contract; UUIDv5: 1f48c934-c233-51d6-b99c-5c8e6e5278d0.
// transition: fifteen source-linked art directions -> individually authored spatial compositions.
// Geometry and colours are creative reconstructions; provenance is attached by build-exploration.
const shape=(kind,parameters,position,color,extra={})=>({kind,parameters,position,color,...extra});
const sphere=(radius,position,color,extra={})=>shape('sphere',[radius],position,color,extra);
const box=(size,position,color,extra={})=>shape('box',size,position,color,extra);
const ring=(radius,tube,position,color,extra={})=>shape('torus',[radius,tube],position,color,extra);
const beam=(start,end,width,color)=>box([Math.hypot(end[0]-start[0],end[1]-start[1]),width,width],start.map((value,index)=>(value+end[index])/2),color,{rotation:[0,0,Math.atan2(end[1]-start[1],end[0]-start[0])]});
const farPlanet=()=>sphere(26,[8,-32,-80],'#567a99',{collision:false});

function morris(){
  const result=[sphere(8,[0,0,0],'#254b3b'),sphere(1.6,[-14,10,-18],'#dec99a')];
  for(let row=1;row<8;row++)for(let column=0;column<10;column++){
    const latitude=row/8*Math.PI,longitude=column/10*Math.PI*2+row*0.3;
    const position=[Math.sin(latitude)*Math.cos(longitude)*8.1,Math.cos(latitude)*8.1,Math.sin(latitude)*Math.sin(longitude)*8.1];
    result.push(sphere(.65,position,row%2?'#cab783':'#9b9b65',{scale:[.5,1.5,.55],rotation:[0,longitude,.6],collision:false}));
    if(column%3===0)result.push(sphere(.23,position.map(value=>value*1.02),'#b35e54',{collision:false}));
  }
  for(let strand=0;strand<3;strand++){
    const points=Array.from({length:24},(_,index)=>{const angle=index*.2;return [Math.cos(angle)*(8+index*.45),Math.sin(angle)*(8+index*.45),-5-strand*1.2];});
    result.push(shape('tube',[points,.12],[-3,4,-4],'#b6a264',{collision:false}));
  }
  return result;
}
function mucha(){
  const result=[sphere(6,[0,0,0],'#ddd1b8'),ring(9,.14,[0,0,0],'#bca167'),ring(10,.12,[0,0,-.3],'#d4b56e')];
  for(let index=0;index<20;index++){
    const angle=index/20*Math.PI*2;result.push(sphere(.7,[Math.cos(angle)*9.5,Math.sin(angle)*9.5,.1],'#b4a275',{scale:[.5,1.5,.6],rotation:[0,0,angle-Math.PI/2]}));
    if(index%2===0)result.push(sphere(.8,[Math.cos(angle)*11.2,Math.sin(angle)*11.2,-.4],'#a47a82',{scale:[.6,2,.4],rotation:[0,0,angle-Math.PI/2]}));
  }
  for(let index=0;index<5;index++)result.push(shape('tube',[[[-3,-5,0],[-12,-7-index,1],[-19,-4-index,3],[-24,1-index,4]],.1],[0,0,0],index%2?'#bca167':'#a47a82',{collision:false}));
  return result;
}
function mackintosh(){
  const result=[sphere(2.5,[0,1,0],'#e8dcc0',{emissive:'#8d795d'}),box([10,.35,9],[0,-9,0],'#baa17e'),box([10,.35,9],[0,11,0],'#43323c')];
  for(const side of [-4,4])for(const position of [-4,-2,0,2,4]){
    result.push(box([.17,20,.17],[position,1,side],'#2c252e'));
    result.push(box([.17,20,.17],[side,1,position],'#2c252e'));
  }
  for(const height of [-7,-3,3,8])for(const side of [-4,4])result.push(box([8,.15,.15],[0,height,side],'#b99c78'));
  for(const position of [[-3,6,4],[3,-1,4],[1,8,-4],[-1,-5,-4]]){
    result.push(ring(.6,.16,position,'#a57187'));result.push(sphere(.32,position,'#d0a2b7',{scale:[1,1,.3]}));
  }
  return result;
}
function mondrian(){
  const result=[];
  const coordinates=[-11,-5,2,10];
  for(const depth of [-5,5])for(const position of coordinates){result.push(box([.28,22,.3],[position,0,depth],'#1b1b1e'));result.push(box([22,.28,.3],[0,position,depth],'#1b1b1e'));}
  for(const position of [[-8,6,5,'#e6dfc9'],[6,6,0,'#a73932'],[-8,-7,-5,'#d8b343'],[6,-7,-3,'#304d86'],[-1,0,-5,'#e6dfc9']])result.push(box([5.4,5.5,.45],position.slice(0,3),position[3]));
  for(const position of [-11,10])result.push(box([.3,.3,10],[position,10,0],'#1b1b1e'));
  return result;
}
function rietveld(){
  const result=[farPlanet(),box([14,.5,8],[0,-2,0],'#344f8b'),box([.5,12,8],[5,3,-3],'#ad3f36'),box([8,.4,7],[-4,6,-4],'#e0d4b9')];
  for(const position of [-6,0,6]){result.push(box([.5,16,.5],[position,1,-4],'#23242a'));result.push(box([18,.5,.5],[0,position,4],'#23242a'));result.push(box([.6,.5,.5],[9.05,position,4],'#d9b244'));}
  for(const position of [-5,5])result.push(box([.5,.5,15],[position,-4,0],'#25242a'));
  return result;
}
function bayer(){
  return [shape('cylinder',[7,7,.4],[3,3,0],'#c44d36',{rotation:[Math.PI/2,0,0]}),shape('cylinder',[5,5,.6],[7,3,1],'#202026',{rotation:[Math.PI/2,0,0]}),
    sphere(2.5,[-6,-5,2],'#a59b8e'),box([16,.4,.4],[-1,-7,-1],'#d3c4a6',{rotation:[0,0,.18]}),
    box([.35,18,.5],[-7,3,-3],'#c6b798'),shape('annulus',[11,10.7,.18,.2,4.6],[0,0,-2],'#dbcfb5'),box([10,20,.3],[-11,0,-6],'#bcae94')];
}
function muller(){
  const result=[sphere(7,[0,-1,0],'#17171c'),sphere(1.3,[-16,12,-22],'#aa3d30')];
  for(let group=0;group<3;group++)for(let band=0;band<3;band++)result.push(shape('annulus',[8+group*2+band*.35,7.85+group*2+band*.35,.15,.3+group*.4,4.7],[0,-1,-.8],'#dad2c0'));
  return result;
}
function vignelli(){
  const result=[],colors=['#ac504b','#be9a4f','#6686a0','#6e9177','#d7cebc'];
  for(let route=0;route<5;route++){
    const points=[[-12,-10+route*3,route-2],[-4,-10+route*3,route-2],[2,-4+route*3,route-2],[12,-4+route*3,route-2]];
    for(let index=1;index<points.length;index++)result.push(beam(points[index-1],points[index],.2,colors[route]));
    for(const point of points)result.push(sphere(.42,point,'#e0d5bf'));
  }
  result.push(sphere(2,[3,10,-8],'#aab9c2'));return result;
}
function rams(){
  const result=[farPlanet(),sphere(7,[0,0,0],'#d4d2c7'),ring(7.08,.12,[0,0,0],'#33353a',{rotation:[Math.PI/2,0,0]}),
    shape('cylinder',[1.8,1.8,.35],[2,1,6.65],'#878d90',{rotation:[Math.PI/2,0,0],metalness:.8,roughness:.3}),sphere(.22,[4,-1,5.8],'#bd6b38')];
  for(let row=0;row<3;row++)for(let index=0;index<18;index++){
    const angle=-.8+index/17*1.6;result.push(sphere(.08,[Math.sin(angle)*6.95,2.2+row*.22,Math.cos(angle)*6.6],'#43484b',{collision:false}));
  }
  return result;
}
function fukasawa(){
  return [farPlanet(),shape('roundedBox',[12,12,4,1.8],[0,0,0],'#d5d5cb'),shape('cylinder',[3,3,.12],[0,.4,2.03],'#c1c5bd',{rotation:[Math.PI/2,0,0]}),
    ring(3.08,.06,[0,.4,2.1],'#e3e2d7'),shape('tube',[[[1,-5,0],[1,-9,0],[4,-12,1],[8,-11,3]],.075],[0,0,0],'#d2cbb6'),sphere(.65,[8,-11,3],'#b79c70'),sphere(1.1,[-15,8,-18],'#bac6c5')];
}
function kawakubo(){
  const result=[ring(7.5,2,[0,0,0],'#22232b',{scale:[1,1.1,.9]}),shape('annulus',[10.5,10.35,.12,.2,4],[0,0,-5],'#c8c2b9',{collision:false})];
  for(let index=0;index<10;index++){
    const angle=index/10*Math.PI*2;result.push(sphere(2,[Math.cos(angle)*8,Math.sin(angle)*8,(index%3-1)*.7],index%2?'#282932':'#343440',{scale:[1.2,1.5+(index%3)*.3,1],rotation:[0,0,angle]}));
    result.push(shape('tube',[[[Math.cos(angle)*6,Math.sin(angle)*6,1],[Math.cos(angle)*8,Math.sin(angle)*8,2.2],[Math.cos(angle)*10,Math.sin(angle)*10,1]],.055],[0,0,0],'#686572',{collision:false}));
  }
  return result;
}
function charlesEames(){
  const result=[sphere(3,[0,0,0],'#39322f'),sphere(1.7,[-13,9,-22],'#91a9b9')];
  for(let index=0;index<3;index++)result.push(shape('shell',[5.5+index*2,.32],[0,index*.5-1,0],['#795137','#9a7047','#b58b58'][index],{rotation:[.6+index*1.2,index*.7,.2+index*.4]}));
  for(let index=0;index<6;index++){const angle=index*Math.PI/3;result.push(shape('cylinder',[.08,.08,11],[Math.cos(angle)*3,0,Math.sin(angle)*3],'#858b8d',{metalness:.8}));}
  return result;
}
function rayEames(){
  const result=[],palette=['#ad5042','#b09a45','#457d7f','#b68e92','#32363c'];
  for(let index=0;index<28;index++){
    const angle=index*2.399963,vertical=1-2*(index+.5)/28,horizontal=Math.sqrt(1-vertical*vertical),position=[Math.cos(angle)*horizontal*8,vertical*8,Math.sin(angle)*horizontal*8];
    result.push(box([3.1,4,.16],position,palette[index%5],{rotation:[angle*.2,angle,angle*.35]}));
    if(index%3===0)result.push(sphere(.33,position.map((value,axis)=>value+(axis===2?.2:0)),'#d6c8ac',{scale:[1,1,.2],collision:false}));
  }
  return result;
}
function gropius(){
  const result=[farPlanet(),box([15,.5,14],[0,0,0],'#b7b8b0'),box([15,.4,14],[0,11,0],'#c9c8bd'),
    box([12,5,7],[12,2.5,-3],'#c7c6ba'),box([10,7,8],[-10,3.5,-5],'#aaaeb0'),box([14,.4,3],[0,5,-10],'#c7c6ba')];
  for(const horizontal of [-7,-3.5,3.5,7])for(const depth of [-6.5,6.5])result.push(box([.2,11,.2],[horizontal,5.5,depth],'#424951'));
  for(const height of [3,6,9])for(const depth of [-6.5,6.5])result.push(box([14,.12,.15],[0,height,depth],'#424951'));
  for(const horizontal of [-5,5])result.push(box([3.6,10.5,.12],[horizontal,5.5,6.5],'#8fbbc6',{opacity:.22,collision:true}));
  for(const horizontal of [-7,7])result.push(box([.12,10.5,13],[horizontal,5.5,0],'#8fbbc6',{opacity:.2,collision:true}));
  result.push(box([14,10.5,.12],[0,5.5,-6.5],'#8fbbc6',{opacity:.22,collision:true}));
  for(const horizontal of [-4,4])result.push(box([2,1.5,2],[horizontal,1,0],'#ba9262',{emissive:'#6a4223'}));
  return result;
}

const definitions=[
  ['william-morris',morris,'#b7a36c','植物の反復が、惑星の表面と星のつるへ続く。葉の間から遠い光を探す。'],
  ['alphonse-mucha',mucha,'#c6ad78','月を囲む細い金の環と、花びらの軌道。その重なりの間を飛ぶ。'],
  ['charles-rennie-mackintosh',mackintosh,'#c6a0b1','細い格子と薔薇の光が浮かぶ天文室。構造の中から宇宙を眺める。'],
  ['piet-mondrian',mondrian,'#dac163','直角の面と黒い格子の奥に、別の空間が続く。色面の裏側へ回る。'],
  ['gerrit-rietveld',rietveld,'#b8ab7b','赤と青の面、独立した黒い梁。組み立ての隙間を通って構造を読む。'],
  ['herbert-bayer',bayer,'#d68d60','赤い円、黒い影、細い直線。紙の構成から飛び出した形の間へ。'],
  ['josef-muller-brockmann',muller,'#d6cab1','間隔を揃えた白い弧が、黒い天体を囲む。軌道の切れ目を探す。'],
  ['massimo-vignelli',vignelli,'#bd9e72','五つの色の線と点がつくる架空の星図。線の奥行きと交差をたどる。'],
  ['dieter-rams',rams,'#d9d6c5','静かな白い観測体。穴の反復、薄い継ぎ目、ひとつの小さな操作部へ近づく。'],
  ['naoto-fukasawa',fukasawa,'#c6c9be','丸みを帯びた白い物体と、浮かぶ紐。日常の形から生まれた小さな宇宙。'],
  ['rei-kawakubo',kawakubo,'#b6aec4','非対称の暗い量感が、大きな空洞を囲む。光が残る穴をくぐる。'],
  ['charles-eames',charlesEames,'#bc9463','木の曲面が、暗い芯を包む。重なった殻の内側と支持の間を探る。'],
  ['ray-eames',rayEames,'#c4968d','色のカードが組み合わさる、隙間の多い天体。面の向こうに別の色が見える。'],
  ['walter-gropius',gropius,'#c5b18c','ガラスの展示室、白い棟、細い橋。開いた正面から中へ入り、宇宙に囲まれる。'],
];
const rectangular=new Set(['charles-rennie-mackintosh','piet-mondrian','gerrit-rietveld','herbert-bayer','massimo-vignelli','walter-gropius']);
export const artistWorldRecipes=Object.fromEntries(definitions.map(([slug,makeShapes,accent,description])=>{
  const squared=rectangular.has(slug),passage={position:[-18,6,12],radius:3,tube:.5,kind:squared?'rectangular':'circular'};
  return [slug,{background:'#090d16',accent,description,passage,spawn:{position:[25,13,38],target:[0,1,0]},
    landmarks:[{name:squared?'枠の手前へ':'環の手前へ',position:[-18,6,20],target:[-18,6,0]},
      slug==='walter-gropius'?{name:'展示室の入口へ',position:[0,2,15],target:[0,2,0]}:{name:'形のそばへ',position:[14,4,15],target:[0,0,0]},
      {name:'着地できる台へ',position:[-18,5,14],target:[-18,0,14]}],
    shapes(){const result=makeShapes();
      if(squared){for(const side of [-1,1]){result.push(box([1,7,1],[-18+side*3,6,12],accent));result.push(box([5,1,1],[-18,6+side*3,12],accent));}}
      else result.push(ring(3,.5,passage.position,accent));
      result.push(box([7,.6,7],[-18,0,12],accent));return result;},
  }];
}));
