// Aggregated official MinTIC observations only. No personal records.
import {writeFile} from 'node:fs/promises';
const root='https://www.datos.gov.co/resource/n48w-gutb.json';
async function query(params){const u=new URL(root);Object.entries(params).forEach(([k,v])=>u.searchParams.set('$'+k,v));const r=await fetch(u,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(await r.text());return r.json()}
const common={select:'anno,trimestre,sum(no_de_accesos::number) as accesos',group:'anno,trimestre',order:'anno,trimestre',limit:'1000'};
const [municipal,departamental,nacional,comparables]=await Promise.all([
 query({...common,where:"cod_municipio='76670'"}),
 query({...common,where:"cod_departamento='76'"}),
 query(common),
 query({select:'cod_municipio,municipio,sum(no_de_accesos::number) as accesos',where:"anno='2023' and trimestre='3' and cod_municipio in ('76670','76890','76306','76113','76036')",group:'cod_municipio,municipio',limit:'10'})
]);
await writeFile('src/data/conectividadV6.json',JSON.stringify({fuente:root,organismo:'MinTIC · Colombia TIC',consulta:new Date().toISOString(),metodo:'Suma de no_de_accesos por año y trimestre, entre proveedores, tecnologías y segmentos. Stocks trimestrales: no sumar trimestres. No equivale a hogares ni personas conectadas.',criterioComparables:'Mismo departamento del Valle del Cauca, municipios no capitales del centro del departamento: Andalucía, Bugalagrande, Ginebra y Yotoco. Contexto geográfico, sin afirmar equivalencia socioeconómica ni ranking de cobertura.',municipal,departamental,nacional,comparables},null,2)+'\n');
console.log(JSON.stringify({municipal:municipal.length,departamental:departamental.length,nacional:nacional.length,comparables:comparables.length}));
