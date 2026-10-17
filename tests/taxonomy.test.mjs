import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/lib/territorialTaxonomy.ts',import.meta.url),'utf8');
const matches=[...source.matchAll(/items:\[([\d,\s]+)\]/g)];
const numbers=matches.flatMap(m=>m[1].split(',').map(Number).filter(Number.isFinite));
test('los 66 reactivos DANE se asignan exactamente una vez a 14 temas',()=>{
 assert.equal(matches.length,14);
 assert.equal(numbers.length,66);
 assert.deepEqual([...new Set(numbers)].sort((a,b)=>a-b),Array.from({length:66},(_,i)=>i+1));
});
test('no se confunde taxonomía ciudadana con dimensiones propias de capacidad estadística DANE',()=>{
 assert.match(source,/no altera la clasificación del cuestionario DANE/i);
 assert.match(source,/El ICET evalúa capacidad estadística territorial/i);
});
