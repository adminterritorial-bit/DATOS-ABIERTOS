/**
 * Deterministic ArcGIS DANE place geometry snapshot for static GitHub Pages.
 * Executed at build time to mitigate browser CORS restrictions on the DANE portal.
 * If the official service does not respond, retain existing known-good snapshot.
 */
import {writeFile,readFile} from 'node:fs/promises';
const path='src/data/centrosPoblados76670.json';
const root='https://geoportal.dane.gov.co/mparcgis/rest/services/Divipola/Serv_DIVIPOLA_MGN_2025/FeatureServer/305/query';
const params=new URLSearchParams({
 where:"MPIO_CDPMP = '76670'",outFields:'ZU_CDIVI,ZU_CNMBRE,ZU_NAREA,ZU_NALTD,ZU_NANO,CLAS_CCDGO',
 returnGeometry:'true',outSR:'4326',geometryPrecision:'5',f:'json'
});
try{
 const response=await fetch(root+'?'+params,{signal:AbortSignal.timeout(17000)});
 if(!response.ok)throw Error('DANE HTTP '+response.status);
 const body=await response.json();
 if(body.error||!Array.isArray(body.features))throw Error(body.error?.message||'Sin respuesta de entidades');
 const unique=new Map();
 for(const f of body.features){
  const a=f.attributes||{},ring=f.geometry?.rings?.[0];
  if(!a.ZU_CDIVI||!a.ZU_CNMBRE||!Array.isArray(ring)||ring.length<3)continue;
  const points=ring.filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
  if(!points.length)continue;
  const lon=points.reduce((n,p)=>n+p[0],0)/points.length;
  const lat=points.reduce((n,p)=>n+p[1],0)/points.length;
  if(lon>=-75||lon<=-78||lat<=3||lat>=6)continue;
  unique.set(String(a.ZU_CDIVI),{code:String(a.ZU_CDIVI),name:String(a.ZU_CNMBRE),
   longitude:lon,latitude:lat,area:Number(a.ZU_NAREA)||null,altitude:Number(a.ZU_NALTD)||null,
   year:Number(a.ZU_NANO)||2025,clas:String(a.CLAS_CCDGO||'')});
 }
 if(!unique.size)throw Error('Consulta sin geometrías verificables para San Pedro');
 await writeFile(path,JSON.stringify({source:root,divipola:'76670',generatedAt:new Date().toISOString(),items:[...unique.values()]},null,2)+'\n');
 console.log('DANE: '+unique.size+' centros poblados/cabeceras verificados, geocodificados y empaquetados para GitHub Pages');
 console.log('DANE_CENTER_CACHE='+JSON.stringify([...unique.values()]));
}catch(err){
 console.log('DANE: sin actualización geoespacial '+String(err).slice(0,260)+'. Se conserva el último respaldo; el mapa base sigue funcional.');
 try{const original=JSON.parse(await readFile(path,'utf8'));console.log('DANE: cache existente '+original.items.length+' lugares')}catch{process.exitCode=1}
}
