import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createComparisonData, commonPeriods, compareTerritories, relativeChange} from '../src/lib/interactiveComparison.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name,import.meta.url),'utf8'));
const energy=read('energiaV6.json'), internet=read('conectividadV6.json');
const data=createComparisonData(energy,internet);
test('energy recomputes weighted aggregates from actual numerators and denominators',()=>{
 const rows=compareTerritories(data,'energia','2024',['76670','76','CO']);
 assert.ok(Math.abs(rows[0].value-5812/6164*100)<1e-10);
 assert.ok(Math.abs(rows[1].value-1561861/1689454*100)<1e-10);
 assert.ok(Math.abs(rows[2].value-17423181/19293841*100)<1e-10);
 assert.equal(rows[1].gap,rows[1].value-rows[0].value);
 assert.equal(rows[1].gapUnit,'pp');
 assert.equal(commonPeriods(data,'energia',['76670','76036']).join(),'2024');
});
test('quarterly internet intersections exclude unmatched national 2016 and peer periods',()=>{
 const periods=commonPeriods(data,'internet',['76670','76','CO']);
 assert.equal(periods.length,27);assert.equal(periods[0],'2017-T1');assert.equal(periods.at(-1),'2023-T3');
 assert.equal(commonPeriods(data,'internet',['CO']).length,27);
 assert.ok(!commonPeriods(data,'internet',['CO']).includes('2016-T1'));
 assert.deepEqual(commonPeriods(data,'internet',['76670','76036','76']),['2023-T3']);
 assert.deepEqual(commonPeriods(data,'internet',['unknown']),[]);
 assert.deepEqual(commonPeriods(data,'internet',[]),[]);
});
test('invalid energy denominators cannot create coverage observations',()=>{
 const invalid={...energy,municipios:energy.municipios.map(r=>r.cod_mpio==='76670'?{...r,vttotal:0}:r)};
 assert.deepEqual(compareTerritories(createComparisonData(invalid,internet),'energia','2024',['76670','76']),[]);
});
test('missing periods and unknown indicators cannot silently yield a partial comparison',()=>{
 assert.deepEqual(compareTerritories(data,'internet','2022-T3',['76670','76036']),[]);
 assert.deepEqual(compareTerritories(data,'energia','2023',['76670','76']),[]);
 assert.deepEqual(compareTerritories(data,'ecv','2025',['76670','76']),[]);
});
test('internet compares stocks with absolute gaps and no invented household denominator',()=>{
 const rows=compareTerritories(data,'internet','2023-T3',['76670','76036','76113']);
 assert.deepEqual(rows.map(r=>r.value),[978,1682,2484]);
 assert.equal(rows[1].gap,704);assert.equal(rows[1].gapUnit,'accesos');
 assert.equal(rows[1].denominator,null);assert.equal(rows[1].relative,704/978*100);
});
test('relative differences handle zero, negative and nonfinite bases explicitly',()=>{
 assert.equal(relativeChange(120,100),20);assert.equal(relativeChange(80,100),-20);
 assert.equal(relativeChange(0,0),null);assert.equal(relativeChange(10,0),null);
 assert.equal(relativeChange(10,-1),null);assert.equal(relativeChange(Infinity,2),null);
});
test('rows retain matching indicator, period and distinct selected territories',()=>{
 const rows=compareTerritories(data,'internet','2017-T1',['76670','76670','76','CO']);
 assert.equal(rows.length,3);assert.ok(rows.every(r=>r.period==='2017-T1'&&r.indicator==='internet'));
 assert.deepEqual(rows.map(r=>r.value),[10,332797,2421640]);
});
