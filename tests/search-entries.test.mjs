import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createSearchEntries,searchEntries,normalizeSearch} from '../src/lib/searchEntries.mjs';
const rows=[
 {id:'pob',nombre:'Población rural',sector:'Demografía',anio:2023,fuente:'DANE',valor:9000,unidad:'personas'},
 {id:'pob22',nombre:'Población rural',sector:'Demografía',anio:2022,fuente:'DANE',valor:8900,unidad:'personas'},
 {id:'internet',nombre:'Accesos a internet fijo',sector:'Conectividad',anio:2023,fuente:'MinTIC',valor:978,unidad:'accesos',nota:'San Pedro · trimestre 3'},
 {id:'r1',nombre:'Estudiantes beneficiarios',sector:'Educación',anio:2025,fuente:'Rendición de cuentas',valor:20,unidad:'estudiantes',origen:'Gestión municipal'},
];
const indicators=[{codigo:'ICET-01',nombre:'Porcentaje de aguas residuales urbanas tratadas',area:'Ambiental'},{codigo:'ICET-02',nombre:'Población rural',area:'Sociodemográfico'}];
const entries=createSearchEntries(rows,indicators);
test('search ignores accents, case, extra spaces and punctuation',()=>{
 assert.equal(normalizeSearch('  POBLACIÓN,   Rurál '),'poblacion rural');
 const found=searchEntries(entries,'POBLACION rural 2023 DÁNE');
 assert.equal(found.total,1);assert.equal(found.items[0].id,'dato-pob');
});
test('every query term must match, independently of term order or adjacency',()=>{
 assert.equal(searchEntries(entries,'2023 DANE rural').items[0].id,'dato-pob');
 assert.equal(searchEntries(entries,'rural MinTIC').total,0);
 assert.equal(searchEntries(entries,'internet trimestre 3').items[0].id,'dato-internet');
});
test('exact titles and codes outrank incidental descriptions without mutating the index',()=>{
 const sample=[{...entries[0],id:'incidental',titulo:'Otra sección',descripcion:'Población rural'},{...entries[0],id:'exact',titulo:'Población rural',descripcion:''}];
 const order=sample.map(e=>e.id);
 assert.equal(searchEntries(sample,'poblacion rural').items[0].id,'exact');
 assert.deepEqual(sample.map(e=>e.id),order);
 assert.equal(searchEntries(entries,'ICET 01').items[0].id,'indicador-ICET-01');
});
test('empty search suggests route shortcuts; type filters expose catalog entries and counts',()=>{
 const initial=searchEntries(entries,'');assert.ok(initial.items.every(e=>e.clase==='ruta'));
 const figures=searchEntries(entries,'','dato');assert.equal(figures.total,4);assert.ok(figures.items.every(e=>e.clase==='dato'));
 const all=searchEntries(entries,'rural');assert.equal(all.counts.dato,2);assert.equal(all.counts.indicador,1);
 assert.equal(searchEntries(entries,'rural','ruta').total,0);
});
test('entries retain original figure period, source and value; ICET is labelled as a dictionary',()=>{
 const internet=entries.find(e=>e.id==='dato-internet');assert.equal(internet.periodo,'2023 · trimestre 3');assert.equal(internet.fuente,'MinTIC');assert.match(internet.valor,/978 accesos/);
 const icet=entries.find(e=>e.id==='indicador-ICET-01');assert.equal(icet.fuente,'DANE · diccionario ICET');assert.match(icet.periodo,/Catálogo 2025/);assert.equal(icet.valor,undefined);
 const municipal=entries.find(e=>e.id==='dato-r1');assert.ok(municipal.href.startsWith('/rendicion/?buscar='));
});
test('result limits report the full count and stable ranking breaks ties by newest observation',()=>{
 const result=searchEntries(entries,'rural','dato',1);assert.equal(result.total,2);assert.equal(result.items.length,1);assert.equal(result.items[0].id,'dato-pob');
 assert.equal(searchEntries(entries,'no existe ningún resultado').total,0);
});
test('query text is never inserted into destination URLs and metadata does not create false years',()=>{
 assert.equal(searchEntries(entries,'javascript:alert').total,0);
 const encoded=createSearchEntries([{...rows[0],nombre:'Nombre & sector?'}],[]).find(e=>e.clase==='dato').href;
 assert.equal(new URL(encoded,'https://example.test').searchParams.get('buscar'),'Nombre & sector?');
 assert.equal(searchEntries(entries,'rural 2026','dato').total,0);
});
test('actual municipal culture, PIC and 2026 projections retain source qualifiers and nature',()=>{
 const report=JSON.parse(readFileSync(new URL('../src/data/rendicion2025.json',import.meta.url),'utf8'));
 const actual=report.registros.filter(r=>['RC25-CULT','RC25-PIC','RC25-DOBLE'].includes(r.id)).map(r=>({...r,sector:r.dependencia,fuente:report.fuente,precision:r.calificador,clase:r.calificador==='estimación institucional'?'Estimación':'Publicado',origen:'Gestión municipal'}));
 const indexed=createSearchEntries(actual,[]);
 const culture=indexed.find(r=>r.id==='dato-RC25-CULT');assert.equal(culture.valor,'> 8.000 personas');assert.equal(culture.calificador,'Superior a');assert.equal(culture.precision,'superior a');
 const pic=indexed.find(r=>r.id==='dato-RC25-PIC');assert.equal(pic.valor,'≈ 4.293 personas');assert.equal(pic.calificador,'Aproximado');
 const projection=indexed.find(r=>r.id==='dato-RC25-DOBLE');assert.equal(projection.periodo,'2026');assert.match(projection.valor,/^≈ /);assert.equal(projection.naturaleza,'Estimación');assert.equal(projection.origen,'Gestión municipal');assert.equal(projection.calificador,'Estimado');
 assert.equal(searchEntries(indexed,'doble calzada estimacion 2026').items[0].id,'dato-RC25-DOBLE');
});
test('mayor_que, aproximado and estimado aliases preserve meaning without changing the source class',()=>{
 const indexed=createSearchEntries(['mayor_que','aproximado','estimado'].map((precision,index)=>({...rows[0],id:String(index),precision,clase:'Publicado',origen:'Estadística oficial',valor:8000})),[]).filter(r=>r.clase==='dato');
 assert.deepEqual(indexed.map(r=>r.valor),['> 8.000 personas','≈ 8.000 personas','≈ 8.000 personas']);
 assert.deepEqual(indexed.map(r=>r.calificador),['Superior a','Aproximado','Estimado']);
 assert.ok(indexed.every(r=>r.naturaleza==='Publicado'&&r.origen==='Estadística oficial'));
});
