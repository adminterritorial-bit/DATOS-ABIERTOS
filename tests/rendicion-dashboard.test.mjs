import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {budgetComposition,revenuePerformance,marginComparison,formatReportValue} from '../src/lib/rendicionMetrics.mjs';
const records=JSON.parse(readFileSync(new URL('../src/data/rendicion2025.json',import.meta.url))).registros;
test('budget chart includes only parent amounts and keeps the full base when filtered',()=>{
 const all=budgetComposition(records);assert.equal(all.base,13435321251);assert.equal(all.segments.length,8);assert.equal(all.remainder,0);assert.ok(Math.abs(all.segments.reduce((s,x)=>s+x.share,0)-100)<1e-9);
 const selected=budgetComposition(records,'Hacienda');assert.equal(selected.segments.length,1);assert.ok(selected.segments[0].share>3&&selected.segments[0].share<4);assert.equal(selected.remainder,all.base-501938794);
 assert.equal(budgetComposition(records,'Inexistente').segments.length,0);
});
test('revenue above target keeps 139 percent and separates the excess from the target',()=>{
 const r=revenuePerformance(records);assert.ok(Math.abs(r.percent-139.07048683333334)<1e-9);assert.equal(r.excess,703268763);assert.equal(r.target,1800000000);assert.ok(r.scale>=r.actual);assert.ok(r.targetPosition<r.actualPosition);
 assert.equal(revenuePerformance(records.filter(r=>r.id!=='RC25-META')),null);
 assert.equal(revenuePerformance(records.map(r=>r.id==='RC25-META'?{...r,valor:0}:r)),null);
 assert.equal(revenuePerformance(records.map(r=>r.id==='RC25-META'?{...r,anio:2024}:r)),null);
});
test('IBR comparison is a margin gap in percentage points, never monetary savings',()=>{
 const r=marginComparison(records);assert.equal(r.before,7.35);assert.equal(r.after,2.4);assert.ok(Math.abs(r.gap-4.95)<1e-9);assert.equal(r.unit,'puntos porcentuales');assert.equal(r.savings,undefined);
 assert.equal(marginComparison(records.map(r=>r.id==='RC25-IBR-NUE'?{...r,unidad:'COP'}:r)),null);
});
test('compact chart labels preserve lower bounds, approximations and full monetary detail',()=>{
 const culture=records.find(r=>r.id==='RC25-CULT'),pic=records.find(r=>r.id==='RC25-PIC'),money=records.find(r=>r.id==='RC25-BASE');
 assert.equal(formatReportValue(culture),'> 8.000');assert.equal(formatReportValue(pic),'≈ 4.293');assert.equal(formatReportValue(money,true),'13.435,3');assert.equal(formatReportValue(money),'13.435.321.251');
});
