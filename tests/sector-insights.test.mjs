import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sectorFamily,sectorRows,sectorSeries,sectorChange,sectorBudget,formatSectorValue,latestSectorRows} from '../src/lib/sectorInsights.mjs';
const row=(extra={})=>({id:'one',nombre:'Cobertura neta en educación rural',sector:'Educación',valor:40,unidad:'%',anio:2023,fuente:'MEN, serie municipal',clase:'Publicado',origen:'Estadística oficial',...extra});
test('topics route to distinct sector families and unsupported topics have no rows',()=>{
 assert.equal(sectorFamily('educacion'),'education');assert.equal(sectorFamily('mortalidad'),'health');assert.equal(sectorFamily('ambiente'),'environment');assert.equal(sectorFamily('gobierno'),'economy');assert.equal(sectorFamily('seguridad'),null);
 assert.deepEqual(sectorRows([row()],'seguridad'),[]);assert.equal(sectorRows([row(),row({valor:NaN}),row({nombre:'Dengue',sector:'Salud'})],'educacion').length,1);
});
test('historical grouping never combines urban/rural, different units, source or class',()=>{
 const records=[row(),row({id:'two',anio:2024,valor:45}),row({id:'u',nombre:'Cobertura neta en educación urbana',anio:2024}),row({id:'s',fuente:'Otra fuente',anio:2024}),row({id:'v',unidad:'personas',anio:2024}),row({id:'c',clase:'Calculado',anio:2024}),row({id:'m',origen:'Gestión municipal',anio:2024})];
 const grouped=sectorSeries(records);assert.equal(grouped.length,6);assert.deepEqual(grouped[0].points.map(r=>r.anio),[2023,2024]);
});
test('same-year conflicting records are omitted instead of averaged or summed',()=>{
 const grouped=sectorSeries([row(),row({id:'duplicate'}),row({anio:2024,valor:50}),row({id:'conflict',anio:2024,valor:55})]);
 assert.equal(grouped[0].points.length,1);assert.equal(latestSectorRows(grouped[0].points)[0].valor,40);
 assert.equal(sectorChange(row(),row({anio:2023,valor:42})),null);
});
test('percentage changes use percentage points; numeric changes preserve units',()=>{
 assert.deepEqual(sectorChange(row(),row({anio:2024,valor:45})),{delta:5,percent:12.5,unit:'puntos porcentuales',from:2023,to:2024});
 const baseline=row({unidad:'casos',valor:0});assert.deepEqual(sectorChange(baseline,row({unidad:'casos',anio:2025,valor:4})),{delta:4,percent:null,unit:'casos',from:2023,to:2025});
 assert.equal(sectorChange(row(),row({anio:2024,unidad:'personas'})),null);
 assert.equal(sectorChange(row(),row({anio:2024,nombre:'Cobertura neta en educación urbana'})),null);
});
test('uncertain precision, undefined rate scales and partial cuts cannot produce a comparative conclusion',()=>{
 for(const extra of [{clase:'Estimación'},{precision:'aproximado'},{unidad:'escala de la fuente por confirmar'},{nota:'Corte parcial a septiembre'},{nota:'Acumulado histórico'}])assert.equal(sectorChange(row(extra),row({...extra,anio:2024})),null);
 assert.match(formatSectorValue(row({valor:2000,precision:'superior a'})),/^> /);
 assert.match(formatSectorValue(row({valor:4293,precision:'aproximado'})),/^≈ /);
 assert.match(formatSectorValue(row({valor:5.61})),/5,61/);
});
test('actual 2025 budget sums only the eight parent records, never consolidated or projects',()=>{
 const data=JSON.parse(readFileSync(new URL('../src/data/rendicion2025.json',import.meta.url)));
 const records=data.registros.map(r=>({...r,clase:'Publicado',origen:'Gestión municipal',fuente:data.fuente}));
 const budget=sectorBudget(records);
 assert.equal(budget.complete,true);assert.equal(budget.rows.length,8);assert.equal(budget.total,13435321251);
 assert.ok(Math.abs(budget.rows.reduce((sum,r)=>sum+r.share,0)-100)<1e-9);
 assert.equal(sectorBudget(records.filter(r=>r.id!=='RC25-INV-PL')).total,null);
 assert.equal(sectorBudget(records.map(r=>({...r,anio:2024}))).complete,false);
 assert.equal(sectorBudget([...records,...records]).total,budget.total);
});

test('different quarterly cuts cannot form a historical change',()=>{const a={id:'a',nombre:'Accesos a internet fijo, último trimestre disponible del año',sector:'Gobierno',valor:939,unidad:'accesos',anio:2022,fuente:'MinTIC',clase:'Calculado',nota:'San Pedro 76670 · trimestre 4.'};const b={...a,id:'b',valor:978,anio:2023,nota:'San Pedro 76670 · trimestre 3.'};assert.equal(sectorChange(a,b),null);assert.equal(sectorSeries([a,b]).length,2);});
