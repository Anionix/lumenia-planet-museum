import {createEventIdentifier} from './model.mjs';

// machine contract; record_identifier=e79a0904-342f-5375-bbe9-cea2d52d88d1 (UUIDv5).
// transition: supported document -> registered tools -> validated action -> presented result -> aborted registration.
// Each execution receives a UUIDv7. Tools share the existing page controllers and never evaluate caller-provided code.
export const communityLinks=Object.freeze({
  wiki:'https://github.com/Anionix/lumenia-planet-museum/wiki',
  discussions:'https://github.com/Anionix/lumenia-planet-museum/discussions/20',
});
const object=(properties={},required=[])=>({type:'object',properties,required,additionalProperties:false});
const boolean={type:'boolean'};
const identifier={type:'string',pattern:'^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',maxLength:36};
const selection=values=>({type:'string',enum:values});

export function validateArguments(value,schema,label='input'){
  const fail=()=>{throw new TypeError(`Invalid ${label}`);};
  if(schema.type==='object'){
    if(value===null||typeof value!=='object'||Array.isArray(value))fail();
    const prototype=Object.getPrototypeOf(value);if(prototype!==Object.prototype&&prototype!==null)fail();
    const keys=Object.keys(value),allowed=new Set(Object.keys(schema.properties));
    if(keys.some(key=>!allowed.has(key))||schema.required.some(key=>!Object.hasOwn(value,key))||keys.length<(schema.minProperties??0))fail();
    for(const key of keys)validateArguments(value[key],schema.properties[key],`${label}.${key}`);
  }else if(schema.type==='array'){
    if(!Array.isArray(value)||value.length<schema.minItems||value.length>schema.maxItems)fail();
    for(let index=0;index<value.length;index++)validateArguments(value[index],schema.items,`${label}[${index}]`);
  }else if(schema.type==='number'||schema.type==='integer'){
    if(typeof value!=='number'||!Number.isFinite(value)||(schema.type==='integer'&&!Number.isInteger(value))||value<schema.minimum||value>schema.maximum)fail();
  }else if(typeof value!==schema.type)fail();
  if(schema.enum&&!schema.enum.includes(value))fail();
  if(schema.type==='string'&&((schema.maxLength!==undefined&&value.length>schema.maxLength)||(schema.pattern&&!new RegExp(schema.pattern).test(value))))fail();
  return structuredClone(value);
}

export function createPresentationCheckpoint(timeoutMilliseconds=5000){
  const waiting=new Set();
  return {
    next(){return new Promise((resolve,reject)=>{
      const entry={resolve:()=>{clearTimeout(entry.timer);waiting.delete(entry);resolve();},reject:()=>{clearTimeout(entry.timer);waiting.delete(entry);reject(new Error('The page has not presented the requested result.'));}};
      entry.timer=setTimeout(entry.reject,timeoutMilliseconds);waiting.add(entry);
    });},
    presented(){for(const entry of [...waiting])entry.resolve();},
    cancel(){for(const entry of [...waiting])entry.reject();},
  };
}

// machine contract; record_identifier=02656152-2558-5647-bf33-4eb4ecc3c652 (UUIDv5).
// transition: requested state -> asynchronous work -> rendered state -> compare every promised field.
// A concurrent human action is retained; it makes the earlier tool request incomplete.
export function assertPresentedState(expected,observed){
  for(const [field,value] of Object.entries(expected)){
    if(JSON.stringify(observed[field])!==JSON.stringify(value))throw new Error(`The requested ${field} changed while the action was running.`);
  }
}

export function imageConfigurationTarget(current,input){
  const physics=input.physics_enabled??(input.view==='single'?false:current.physics==='enabled');
  const starting=physics&&current.physics!=='enabled';
  const stopping=input.physics_enabled===false||input.view==='single';
  return {artistIdentifier:input.artist_identifier??current.artistIdentifier,
    view:starting?'all':input.view??current.view,
    playing:input.playing??(starting?true:stopping?false:current.playing),
    physics:physics?'enabled':'disabled',
    gravity:input.gravity_enabled??(starting||!physics?false:current.gravity)};
}

export function registerPageTools(context,definitions,{onStatus=()=>{},onExecution=()=>{}}={}){
  const lifecycle=new AbortController();let busy=false;
  const dispose=()=>{lifecycle.abort();onStatus('unregistered');};
  if(typeof context?.registerTool!=='function'){onStatus('unsupported');return {ready:Promise.resolve(false),dispose};}
  onStatus('registering');
  const registered=definitions.map(definition=>{
    const {name,title,description,inputSchema,readOnly=false,recordIdentifier,run}=definition;
    const tool={name,title,description,inputSchema,annotations:{readOnlyHint:readOnly,untrustedContentHint:true},
      async execute(value){
        const executionIdentifier=createEventIdentifier();
        if(lifecycle.signal.aborted)return {status:'unavailable',executionIdentifier};
        let input;try{input=validateArguments(value,inputSchema);}catch(error){return {status:'invalid_input',message:error.message,executionIdentifier};}
        if(!readOnly&&busy)return {status:'busy',message:'Another page action is still completing.',executionIdentifier};
        if(!readOnly)busy=true;
        try{
          const result=await run(input);
          if(lifecycle.signal.aborted)throw new Error('The page has closed.');
          if(!readOnly)onExecution({recordIdentifier,executionIdentifier,tool:name,transition:'validated action -> presented result'});
          return {status:'complete',recordIdentifier,executionIdentifier,completedAt:new Date().toISOString(),result};
        }catch(error){return {status:error instanceof TypeError?'invalid_input':'error',executionIdentifier,message:error instanceof Error?error.message:'The page action failed.'};}
        finally{if(!readOnly)busy=false;}
      }};
    try{return Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal}));}catch(error){return Promise.reject(error);}
  });
  const ready=Promise.all(registered).then(()=>{if(lifecycle.signal.aborted)return false;onStatus('available');return true;}).catch(()=>{lifecycle.abort();onStatus('registration_failed');return false;});
  return {ready,dispose};
}

export function explorationTools(controller){
  return [
    {name:'read_exploration_catalog',title:'探索できる15の宇宙を読む',recordIdentifier:'0482e305-4702-580a-9e1c-2e996f8da78c',readOnly:true,inputSchema:object(),
      description:'Read the fifteen available worlds and their full identifiers without loading their geometry or changing the page.',run:()=>controller.catalog()},
    {name:'read_exploration_state',title:'現在の宇宙と位置を読む',recordIdentifier:'17ebe324-ccc6-5b8c-99fd-8b574c1be4f5',readOnly:true,inputSchema:object(),
      description:'Read the current artist, camera position, immutable source coordinate, collision state and available viewpoints. Does not move anything.',run:()=>controller.snapshot()},
    {name:'navigate_exploration',title:'宇宙を選び、見どころへ移動する',recordIdentifier:'67967a29-8717-53da-9574-733e7e9a388e',
      inputSchema:{...object({world_identifier:identifier,viewpoint:selection(['entrance','passage','object','landing']),
        look_turns:{type:'integer',minimum:-12,maximum:12},
        movement:{type:'array',items:{type:'number',minimum:-1,maximum:1},minItems:3,maxItems:3},
        steps:{type:'integer',minimum:1,maximum:60}}),minProperties:1},
      description:'Complete a visible navigation: optionally enter one world, select a viewpoint, turn, and move. World identifiers come from read_exploration_catalog. A world change resets collision to off. This stops held input and landing. Positive look_turns turn left by 15 degrees each. Movement is camera-local [right, up, backward], normalized at 8 metres per second, in 0.05-second steps (at most 60, or 24 metres). A viewpoint relocates the camera; movement follows the current collision setting. Returns after rendering.',
      run:input=>{if(input.steps!==undefined&&input.movement===undefined)throw new TypeError('steps requires movement.');return controller.navigate(input);}},
    {name:'set_exploration_physics',title:'衝突と着地を設定する',recordIdentifier:'2912fc34-8b3a-5716-b122-f602abfc2bf1',
      inputSchema:object({enabled:boolean,landing:boolean},['enabled']),
      description:'Enable or disable collision in the current world. Enabling loads the optional local Rapier library. landing=true starts continuous slow descent until stopped, a viewpoint is chosen, or contact is reached; it requires enabled=true. Returns after the visible setting and renderer update.',
      run:input=>{if(input.landing&&!input.enabled)throw new TypeError('Landing requires collision.');return controller.physics(input);}},
  ];
}

export function imageExhibitionTools(controller){
  return [
    {name:'read_image_exhibition_catalog',title:'15枚の作家と識別子を読む',recordIdentifier:'d28458cd-1f95-5faa-b84b-58d9dda322c8',readOnly:true,inputSchema:object(),
      description:'Read the available image exhibits and full identifiers without loading additional image textures.',run:()=>controller.catalog()},
    {name:'read_image_exhibition_state',title:'画像展示の状態を読む',recordIdentifier:'070dd9e3-877f-5d05-9ab9-1bed0502a523',readOnly:true,inputSchema:object(),
      description:'Read the selected artist, display and original coordinates, view, motion, gravity, and physics state without changing them.',run:()=>controller.snapshot()},
    {name:'configure_image_exhibition',title:'作家・並べ方・動きをまとめて設定する',recordIdentifier:'7512e65e-466a-501a-aa88-01dd5d93e414',
      inputSchema:{...object({artist_identifier:identifier,view:selection(['single','all']),playing:boolean,physics_enabled:boolean,gravity_enabled:boolean}),minProperties:1},
      description:'Apply image-exhibition settings and return after required images and the renderer finish. Selecting single view disables physics. Enabling physics loads local Rapier, displays all images, starts motion, and resets gravity to off unless explicitly set. playing controls continuous motion; gravity requires physics. Artist identifiers come from read_image_exhibition_catalog. Original images and source coordinates remain unchanged.',
      run:input=>{if(input.view==='single'&&input.physics_enabled)throw new TypeError('Single view cannot enable physics.');return controller.configure(input);}},
    {name:'reset_image_exhibition',title:'画像の配置を戻して動きを止める',recordIdentifier:'1b3107fa-6965-55c6-a22b-806f7caefdc5',inputSchema:object(),
      description:'Restore original display positions, stop motion and gravity, and disable physics. Preserve the selected artist, view and source coordinates. Return after rendering.',run:()=>controller.reset()},
  ];
}
