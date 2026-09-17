import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = await realpath(path.resolve(directory,'../..'));
const entryPath = '/' + path.basename(path.dirname(directory)) + '/interactive/';
const contentTypes = {'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jsonl':'application/x-ndjson; charset=utf-8','.png':'image/png','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};

// Machine contract: serve generated exhibition artifacts on loopback only; source research stays outside this root.
const server = http.createServer(async(request,response)=>{
  if(!['GET','HEAD'].includes(request.method)){response.writeHead(405);response.end();return;}
  try {
    const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
    if(pathname==='/'){response.writeHead(302,{Location:entryPath});response.end();return;}
    let filename=path.resolve(publicRoot,'.'+pathname);
    if(!(filename===publicRoot||filename.startsWith(publicRoot+path.sep)))throw new Error('Outside public artifacts');
    if((await stat(filename)).isDirectory())filename=path.join(filename,'index.html');
    filename=await realpath(filename);
    if(!filename.startsWith(publicRoot+path.sep))throw new Error('Outside public artifacts');
    const contentType=contentTypes[path.extname(filename)];
    if(!contentType)throw new Error('Unsupported artifact');
    const body=await readFile(filename);
    response.writeHead(200,{'Content-Type':contentType,'Content-Length':body.length,'Cache-Control':path.extname(filename)==='.png'?'public, max-age=3600':'no-store','X-Content-Type-Options':'nosniff'});
    response.end(request.method==='HEAD'?undefined:body);
  }catch{response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});response.end('Artifact not found');}
});
server.on('error', error => { console.error(`Preview server could not start: ${error.message}`); process.exitCode = 1; });
server.listen(Number(process.env.LUMENIA_EXHIBITION_PORT||0),'127.0.0.1',()=>{
  console.log(`Lumenia interactive exhibition: http://127.0.0.1:${server.address().port}${entryPath}`);
});
