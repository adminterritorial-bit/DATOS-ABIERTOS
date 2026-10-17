import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
const port=Number(process.env.PORT||3000);
const root=resolve('out');
const prefix='/DATOS-ABIERTOS';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.avif':'image/avif','.webp':'image/webp','.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
 const url=new URL(req.url||'/', 'http://localhost');
 if(!url.pathname.startsWith(prefix)){res.writeHead(302,{Location:prefix+'/'});res.end();return;}
 let path=decodeURIComponent(url.pathname.slice(prefix.length));
 if(path.includes('..')){res.writeHead(403);res.end();return;}
 if(path==='/'||!path)path='/index.html';
 if(path.endsWith('/'))path+='index.html';
 let file=resolve(root,'.'+path);
 if(!(file===root||file.startsWith(root+sep))){res.writeHead(403);res.end();return;}
 try{
  const info=await stat(file);
  if(info.isDirectory())file=resolve(file,'index.html');
  const bytes=await readFile(file);
  const ext=file.slice(file.lastIndexOf('.'));
  res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream','Cache-Control':'no-cache'});
  res.end(bytes);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log('GitHub Pages preview: http://localhost:'+port+prefix+'/'));
