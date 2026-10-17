import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const json=p=>JSON.parse(readFileSync('src/data/'+p,'utf8'));
const r=json('rendicion2025.json'),e=json('energiaV6.json'),c=json('conectividadV6.json'),d=json('contextoDaneV6.json');
test('municipal figures retain source pages, qualifiers and reconcile eight main amounts only',()=>{
 assert.equal(r.registros.length,60);
 assert.equal(new Set(r.registros.map(x=>x.id)).size,60);
 const b=r.registros.filter(x=>x.grupo==='dependencias');assert.equal(b.length,8);
 assert.equal(b.reduce((s,x)=>s+x.valor,0),13435321251);
 assert.ok(r.registros.every(x=>Number.isFinite(x.valor)&&x.pagina>=1&&x.pagina<=15));
 assert.equal(r.sha256,createHash('sha256').update(readFileSync('public/fuentes/rendicion-cuentas-2025.pdf')).digest('hex'));
 assert.equal(r.registros.find(x=>x.id==='RC25-PIC').calificador,'aproximado');
 assert.equal(r.registros.find(x=>x.id==='RC25-CULT').calificador,'superior a');
 assert.ok(r.registros.filter(x=>x.grupo==='compromisos').every(x=>x.anio===2026&&x.calificador==='estimación institucional'));
});
test('energy aggregates use the full municipal layer and weighted numerators, never simple percentages',()=>{
 assert.equal(e.agregados.find(x=>x.codigo==='CO').municipios,1122);
 assert.equal(e.agregados.find(x=>x.codigo==='76').municipios,42);
 assert.equal(e.municipios.length,5);
 for(const x of e.agregados){assert.ok(x.denominador>=x.numerador);assert.ok(Math.abs(x.valor-x.numerador/x.denominador*100)<1e-9)}
 const sp=e.municipios.find(x=>x.cod_mpio==='76670');assert.equal(sp.vcstotal,5812);assert.equal(sp.vttotal,6164);
});
test('internet has real quarterly stocks, matching geographic aggregates and no invented 2025 data',()=>{
 assert.equal(c.municipal.length,27);assert.equal(c.comparables.length,5);
 assert.equal(c.municipal.at(-1).anno,'2023');assert.equal(c.municipal.at(-1).trimestre,'3');
 for(const x of c.municipal){
  const dep=c.departamental.find(y=>y.anno===x.anno&&y.trimestre===x.trimestre);
  const nat=c.nacional.find(y=>y.anno===x.anno&&y.trimestre===x.trimestre);
  assert.ok(Number(nat.accesos)>=Number(dep.accesos)&&Number(dep.accesos)>=Number(x.accesos));
 }
});
test('national context stays national and seven dated values exist per series',()=>{
 assert.equal(d.alcance,'Colombia');assert.equal(d.series.length,7);
 for(const s of d.series){assert.equal(s.valores.length,d.anios.length);assert.ok(s.pagina>0)}
 assert.equal(d.series[0].valores.at(-1),25.6);
 assert.equal(d.series[4].valores.at(-1),82.3);
});
