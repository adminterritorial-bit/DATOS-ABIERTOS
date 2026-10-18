import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createComparisonData} from '../src/lib/interactiveComparison.mjs';
import {readComparisonQuery,normalizeComparisonSelection,buildComparisonUrl,buildSavedComparisonPath} from '../src/lib/comparisonLinks.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name,import.meta.url),'utf8'));
const data=createComparisonData(read('energiaV6.json'),read('conectividadV6.json'));
test('comparison links round trip indicator, common quarter and reference order',()=>{
 const selection={indicator:'internet',period:'2022-T3',territories:['76','76670','CO']};
 const url=buildComparisonUrl('https://observatorio.example/another/',selection,data);
 assert.equal(new URL(url).pathname,'/DATOS-ABIERTOS/territorios/');
 assert.deepEqual(readComparisonQuery(new URL(url).search,data),selection);
});
test('URL updates preserve the existing source tab, unrelated parameters and hash',()=>{
 const url=new URL(buildComparisonUrl('https://observatorio.example/DATOS-ABIERTOS/territorios/?vista=contexto&origen=boletin#fuentes',{indicator:'energia',period:'2024',territories:['76670','76']},data));
 assert.equal(url.searchParams.get('vista'),'contexto');assert.equal(url.searchParams.get('origen'),'boletin');assert.equal(url.hash,'#fuentes');
 assert.equal(url.searchParams.get('territorios'),'76670,76');
});
test('unknown values and empty territory selections become a valid default comparison',()=>{
 assert.deepEqual(readComparisonQuery('?indicador=ecv&periodo=2026&territorios=unknown,',{...data}),{indicator:'energia',period:'2024',territories:['76670','76','CO']});
 assert.deepEqual(readComparisonQuery('',data),{indicator:'energia',period:'2024',territories:['76670','76','CO']});
});
test('sanitizing removes duplicate and unknown codes while retaining the chosen reference',()=>{
 assert.deepEqual(readComparisonQuery('?indicador=internet&periodo=2022-T3&territorios=CO,unknown,76,CO,76670',data),{indicator:'internet',period:'2022-T3',territories:['CO','76','76670']});
});
test('peer selections cannot restore unavailable quarters or invented years',()=>{
 assert.deepEqual(readComparisonQuery('?indicador=internet&periodo=2022-T3&territorios=76036,76670',data),{indicator:'internet',period:'2023-T3',territories:['76036','76670']});
 assert.equal(readComparisonQuery('?indicador=internet&periodo=2016-T1&territorios=CO',data).period,'2023-T3');
 assert.equal(readComparisonQuery('?indicador=energia&periodo=2023&territorios=76',data).period,'2024');
});
test('normalization is idempotent and URL values cannot inject parameters or protocols',()=>{
 const raw={indicator:'internet',period:'2022-T3',territories:['76670','CO&vista=contexto','76','javascript:alert(1)']};
 const normalized=normalizeComparisonSelection(raw,data);
 assert.deepEqual(normalizeComparisonSelection(normalized,data),normalized);
 const url=new URL(buildComparisonUrl('https://observatorio.example/',raw,data));
 assert.equal(url.searchParams.get('vista'),null);assert.equal(url.protocol,'https:');
 assert.deepEqual(readComparisonQuery(url.search,data),normalized);
});
test('duplicate query parameters collapse to one normalized canonical set',()=>{
 const base='https://observatorio.example/?indicador=internet&indicador=ecv&periodo=2022-T3&territorios=76670,76';
 const url=new URL(buildComparisonUrl(base,readComparisonQuery(new URL(base).search,data),data));
 assert.equal(url.searchParams.getAll('indicador').length,1);
 assert.equal(url.searchParams.get('indicador'),'internet');
});
test('saved comparisons expose only the relative canonical path and supported query fields',()=>{
 const selection={indicator:'internet',period:'2022-T3',territories:['76','76670']};
 const path=buildSavedComparisonPath('https://observatorio.example/?vista=contexto&origen=boletin#fuentes',selection,data);
 assert.ok(path.startsWith('/DATOS-ABIERTOS/territorios/?'));
 assert.ok(!path.includes('https:'));assert.ok(!path.includes('origen'));assert.ok(!path.includes('#'));
 const params=new URL(path,'https://observatorio.example').searchParams;
 assert.equal(params.get('vista'),'contexto');assert.equal(params.get('territorios'),'76,76670');
 assert.ok(!buildSavedComparisonPath('https://observatorio.example/?vista=unknown',selection,data).includes('vista='));
});
