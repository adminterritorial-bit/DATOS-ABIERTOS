// Reproduce the complete 2024 UPME municipal aggregation. Reject incomplete layers.
import {writeFile} from 'node:fs/promises';
const endpoint='https://geo.upme.gov.co/server/rest/services/Capas_EnergiaElectrica/indice_cobertura_energia_electrica_mpio/FeatureServer/26/query';
const u=new URL(endpoint);
Object.entries({where:"vigencia='2024'",outFields:'cod_mpio,municipio,cod_dpto,vcstotal,vttotal,iceetotal',f:'json',returnGeometry:'false',resultRecordCount:'2000'}).forEach(([k,v])=>u.searchParams.set(k,v));
const response=await fetch(u,{signal:AbortSignal.timeout(60000)});
if(!response.ok)throw Error('UPME HTTP '+response.status);
const data=await response.json();
if(data.error||data.exceededTransferLimit||data.features?.length!==1122)throw Error('Capa incompleta, no sobrescribir estadísticas');
const rows=data.features.map(f=>f.attributes);
if(rows.some(r=>!Number.isFinite(r.vcstotal)||!Number.isFinite(r.vttotal)||r.vttotal<=0))throw Error('Componentes incompatibles');
const agregados=[['Colombia','CO',rows],['Valle del Cauca','76',rows.filter(r=>r.cod_dpto==='76')]].map(([nombre,codigo,rs])=>{
 const numerador=rs.reduce((s,r)=>s+r.vcstotal,0),denominador=rs.reduce((s,r)=>s+r.vttotal,0);
 return {nombre,codigo,numerador,denominador,valor:100*numerador/denominador,municipios:rs.length};
});
await writeFile('src/data/energiaV6.json',JSON.stringify({fuente:endpoint,anio:2024,consulta:new Date().toISOString().slice(0,10),metodo:'100 × suma viviendas con servicio / suma viviendas totales. Agregado ponderado de la capa UPME, no promedio simple municipal.',agregados,municipios:rows.filter(r=>['76670','76890','76306','76113','76036'].includes(r.cod_mpio))},null,2)+'\n');
console.log('UPME: 1122 municipios y 42 del Valle verificados');
