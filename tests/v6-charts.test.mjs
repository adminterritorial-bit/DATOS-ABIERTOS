import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('src/components/experience/ChartWall.tsx','utf8');
test('coverage uses separate accessible progress bars, not overlapping gauges',()=>{
 assert.ok(!source.includes("type:'gauge'"));
 assert.match(source,/role="progressbar"/);
 assert.match(source,/aria-valuemax=\{100\}/);
});
test('treemap does not zoom or display redundant breadcrumb and offers keyboard list',()=>{
 assert.match(source,/breadcrumb:\{show:false\}/);
 assert.match(source,/nodeClick:false/);
 assert.match(source,/v6-chart-values/);
});
