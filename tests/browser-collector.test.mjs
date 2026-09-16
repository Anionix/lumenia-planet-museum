import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {summarizeBrowserRuns} from '../scripts/browser-observations.mjs';

// machine contract; record_identifier=2595f513-6ef9-5311-81f6-ec4538c97727.
// Execute the actual collector with a deterministic page boundary, then feed its
// actual records to the consumer. No handwritten request or failure record substitutes.
test('the collector supplies enough evidence to reconcile one successful initial HEAD',async()=>{
  const collect=runInNewContext(await readFile(new URL('../mcp/chrome-measurements.js',import.meta.url),'utf8'));
  const origin='http://127.0.0.1:4173',url=origin+'/records/';let contextCount=0;
  const initial={heading:'光のかたち',headingFontSize:'56px',htmlBackground:'rgb(17, 19, 19)',overflow:false,
    navigation:[{entryType:'navigation',name:origin+'/',transferSize:1000,responseStatus:200}],
    resources:[{entryType:'resource',name:url,initiatorType:'fetch',transferSize:300,responseStatus:200,encodedBodySize:0,decodedBodySize:0}],
    largestContentfulPaint:[{startTime:10}],marks:[]};
  const browser={version:()=> 'test boundary',async newContext(){
    const index=contextCount++,handlers=new Map();
    const page={setDefaultTimeout(){},on(name,callback){handlers.set(name,callback);},async addInitScript(){},async bringToFront(){},
      async goto(){if(index>0)throw new Error('Only the independent empty stage is used in this regression');
        const request={url:()=>url,method:()=> 'HEAD',resourceType:()=> 'fetch',failure:()=>({errorText:'net::ERR_ABORTED'})};
        handlers.get('request')(request);handlers.get('response')({status:()=>200,url:()=>url,request:()=>request});handlers.get('requestfailed')(request);
      },async waitForFunction(){},async evaluate(){return structuredClone(initial);},locator(){return {async count(){return 0;}};}};
    return {async newPage(){return page;},async newCDPSession(){return {async send(){}};},async close(){}};
  }};
  const captured=JSON.parse(JSON.stringify(await collect({context:()=>({browser:()=>browser})})));
  const run=captured.runs[0];assert.equal(run.functional,true);
  assert.deepEqual(run.requests,[{url,method:'HEAD',type:'fetch'}]);
  assert.deepEqual(run.failedRequests,[{url,method:'HEAD',error:'net::ERR_ABORTED',phase:'initial'}]);
  const capture={data:{runs:['empty','css','surface','solid'].map(stage=>({...structuredClone(run),stage}))}};
  const summary=summarizeBrowserRuns(capture);assert.equal(summary.complete,true);
  assert.equal(summary.stages[0].functional,true);assert.equal(summary.stages[0].bytes.metadata,300);
  run.failedRequests[0].error='net::ERR_FAILED';capture.data.runs[0]=run;
  assert.equal(summarizeBrowserRuns(capture).stages[0].functional,false);
});
