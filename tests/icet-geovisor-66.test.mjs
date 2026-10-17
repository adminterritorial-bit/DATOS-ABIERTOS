import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const file=(path)=>readFileSync(join(process.cwd(),path),'utf8');
const catalog=file('src/lib/icetCatalog.ts');
const links=file('src/lib/icetVinculos.ts');
const formulas=file('src/lib/recetasEstimacion.ts');
const sourceRegistry=file('src/lib/fuentesPublicas.ts');
function registry(name){
 const start=links.indexOf('export const '+name+':');
 assert.ok(start>=0,'missing '+name);
 const end=links.indexOf('};',start);
 return [...links.slice(start,end).matchAll(/(?:^|\n)\s*(\d+):'([^']+)'/g)].map(m=>Number(m[1]));
}
const ids=[...catalog.matchAll(/"numero":\s*(\d+),/g)].map(x=>Number(x[1]));
const d=registry('ICET_DIRECTAS'),r=registry('ICET_RELACIONADAS'),e=registry('ICET_ESCENARIOS');
const recipes=[...formulas.matchAll(/"numero": (\d+)/g)].map(x=>Number(x[1]));
test('66 real ICET definitions and 66 distinct numeric-or-procedural links',()=>{
 assert.equal(ids.length,66);
 assert.deepEqual([...ids].sort((a,b)=>a-b),Array.from({length:66},(_,i)=>i+1));
 assert.equal(d.length,26);
 assert.equal(r.length,20);
 assert.equal(e.length,2);
 assert.equal(recipes.length,25);
 assert.equal(new Set([...d,...r,...e,...recipes]).size,66);
});
test('A contextual indicator or exploratory projection cannot shadow an official value',()=>{
 for(const n of r)assert.ok(!d.includes(n),'context overrides direct ICET '+n);
 for(const n of e)assert.ok(!d.includes(n)&&!r.includes(n),'model overrides observed data ICET '+n);
 const lacking=ids.filter(n=>![...d,...r,...e].includes(n));
 assert.equal(lacking.length,18);
 for(const n of lacking)assert.ok(recipes.includes(n),'missing executable recipe for ICET '+n);
});
test('Official geographic and INS data are versioned in public sources',()=>{
 const geo=JSON.parse(file('src/data/geografiaMunicipal76670.json'));
 const ins=JSON.parse(file('src/data/insSivigilaSanPedro76670.json'));
 const energy=JSON.parse(file('src/data/energiaMunicipiosReferencia.json'));
 assert.ok(geo.features.some(f=>f.properties.codigo==='76670'));
 assert.ok(energy.registros.some(r=>r.divipola==='76670'&&r.anio===2024));
 assert.ok(ins.eventos.some(e=>e.codigo_evento==='820'&&e.anio===2018));
 const ids=[...sourceRegistry.matchAll(/"id": "(.*?)"/g)];
 assert.equal(ids.length,18);
});
