import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const raw=readFileSync('src/lib/comparableMetrics.ts','utf8');
const compiled=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
new Function('module','exports',compiled)(module,module.exports);
const {derivarProporciones}=module.exports;
const mk=(name,value,unit,year=2026,source='DANE')=>({id:name,nombre:name,valor:value,unidad:unit,anio:year,fuente:source,sector:'Demografía',clase:'Publicado'});
test('Población rural uses exact same-year population numerator and denominator',()=>{
 const values=derivarProporciones([mk('Población rural',8778,'personas'),mk('Población total',17244,'personas')]);
 assert.equal(values.length,1);
 assert.equal(values[0].valor,50.9);
 assert.match(values[0].nota,/100 ×/);
});
test('Mismatch of years or sources cannot create percentages',()=>{
 assert.equal(derivarProporciones([mk('Población rural',8778,'personas'),mk('Población total',17244,'personas',2025)]).length,0);
 assert.equal(derivarProporciones([mk('Población rural',8778,'personas'),mk('Población total',17244,'personas',2026,'OTRA')]).length,0);
});
test('Cannot use total municipal population as denominator for educational dropout',()=>{
 const r=[mk('Estudiantes desertores del sector oficial',18,'estudiantes'),mk('Población total',17244,'personas')];
 assert.equal(derivarProporciones(r).length,0);
});
test('Education dropout only uses total official enrollment of matching year and unit',()=>{
 const r=[mk('Estudiantes desertores del sector oficial',18,'estudiantes'),mk('Matrícula total oficial',600,'estudiantes')];
 const val=derivarProporciones(r);
 assert.equal(val.length,1);assert.equal(val[0].valor,3);
});
test('Never compute invalid ratios from zero or incompatible denominators',()=>{
 assert.equal(derivarProporciones([mk('Viviendas conectadas',500,'viviendas',2024),mk('Viviendas existentes',0,'viviendas',2024)]).length,0);
 assert.equal(derivarProporciones([mk('Viviendas conectadas',700,'viviendas',2024),mk('Viviendas existentes',600,'viviendas',2024)]).length,0);
});
