import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_SAVED_QUERIES,SAVED_QUERIES_KEY,normalizeSavedQueryUrl,normalizeSavedQueryLabel,parseSavedQueries,addSavedQuery,removeSavedQuery,serializeSavedQueries,writeSavedQueries} from '../src/lib/savedQueries.mjs';
const item=(extra={})=>({url:'/DATOS-ABIERTOS/?tema=educacion',label:'Educación · todas las vigencias',savedAt:'2026-10-18T10:00:00.000Z',...extra});
test('whitelisted app queries normalize without losing selections or reference order',()=>{
 assert.equal(normalizeSavedQueryUrl('/DATOS-ABIERTOS/?tema=educacion&buscar=agua%20potable&anio=2024&clase=Publicado&vista=historias'),'/DATOS-ABIERTOS/?anio=2024&buscar=agua+potable&clase=Publicado&tema=educacion&vista=historias');
 assert.equal(normalizeSavedQueryUrl('/territorios?indicador=internet&periodo=2023-T3&territorios=CO,76670,76&vista=contexto'),'/territorios/?indicador=internet&periodo=2023-T3&territorios=CO%2C76670%2C76&vista=contexto');
 assert.equal(normalizeSavedQueryUrl('/?macro=Econom%C3%ADa+e+instituciones'),'/?macro=Econom%C3%ADa+e+instituciones');
});
test('external protocols, path tricks, arbitrary HTML and unknown parameters are rejected',()=>{
 for(const input of ['https://evil.test/','//evil.test/','javascript:alert(1)','data:text/html,x','/\\evil.test/','/other/','/DATOS-ABIERTOS/../','/territorios/%2f','/?next=https://evil.test','/?tema=educacion&tema=ambiente','/?buscar=%3Cscript%3E','/?buscar=%00','/?vista=unknown','/?tema=unknown','/territorios/?territorios=76670,EVIL','/territorios/?indicador=fake','/territorios/?periodo=2024-T9','/territorios/?territorios=76670,76670','/?tema=educacion#external'])assert.equal(normalizeSavedQueryUrl(input),null,input);
 assert.equal(normalizeSavedQueryLabel('<img onerror=alert(1)>'),null);
 assert.equal(normalizeSavedQueryLabel('  Educación   rural  '),'Educación rural');
});
test('malformed and unsupported storage formats return an empty safe list',()=>{
 for(const raw of ['{broken','null','[]','{"version":2,"queries":[]}',JSON.stringify({version:1,queries:[{url:'javascript:alert(1)',label:'Injected',savedAt:'2026-10-18T10:00:00.000Z'}]})]){const parsed=parseSavedQueries(raw);assert.deepEqual(parsed.items,[]);assert.equal(parsed.invalid,true);}
 assert.deepEqual(parseSavedQueries(null),{items:[],invalid:false});
});
test('valid stored records survive invalid entries while timestamps and fields are validated',()=>{
 const parsed=parseSavedQueries(JSON.stringify({version:1,queries:[item(),item({url:'/?tema=poblacion',savedAt:'yesterday'}),item({url:'/?tema=vivienda',savedAt:'2026-99-99T00:00:00.000Z'})]}));
 assert.equal(parsed.items.length,1);assert.equal(parsed.invalid,true);assert.deepEqual(parsed.items[0],item());
});
test('saving refreshes existing selections, preserves actual supplied save dates, and retains at most eight',()=>{
 let items=[];
 for(let i=0;i<10;i++)items=addSavedQuery(items,`/?anio=${2000+i}`,`Consulta ${i}`,`2026-10-18T10:00:0${i}.000Z`);
 assert.equal(items.length,MAX_SAVED_QUERIES);assert.equal(items[0].url,'/?anio=2009');assert.equal(items.at(-1).url,'/?anio=2002');
 items=addSavedQuery(items,'/?anio=2005','Consulta actualizada','2026-10-18T11:00:00.000Z');
 assert.equal(items.length,8);assert.equal(items[0].label,'Consulta actualizada');assert.equal(items[0].savedAt,'2026-10-18T11:00:00.000Z');
 assert.equal(addSavedQuery(items,'https://evil.test','Invalid','2026-10-18T11:00:00.000Z'),null);
 assert.equal(removeSavedQuery(items,'/?anio=2005').length,7);
});
test('serialization safely round trips canonical queries, deduplicates and rejects injected extra fields',()=>{
 const parsed=parseSavedQueries(serializeSavedQueries([item({onClick:'javascript:bad'}),item({savedAt:'2026-10-18T11:00:00.000Z'})]));
 assert.equal(parsed.items.length,1);assert.equal(parsed.items[0].savedAt,'2026-10-18T11:00:00.000Z');assert.equal('onClick' in parsed.items[0],false);
});
test('write failure reports failure without mutating the caller list or claiming persistence',()=>{
 const items=[item()];let stored;
 assert.equal(writeSavedQueries({setItem(key,value){assert.equal(key,SAVED_QUERIES_KEY);stored=value;}},items),true);
 assert.equal(parseSavedQueries(stored).items.length,1);
 assert.equal(writeSavedQueries({setItem(){throw new Error('QuotaExceededError');}},items),false);
 assert.deepEqual(items,[item()]);
});
