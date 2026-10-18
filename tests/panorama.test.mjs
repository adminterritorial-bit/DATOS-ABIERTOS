import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const internet=require('../src/data/conectividadV6.json');
const energy=require('../src/data/energiaV6.json');
const management=require('../src/data/rendicion2025.json');

test('panorama compares the same quarter, never adds quarterly access stocks',async()=>{
 const {connectivityStory}=await import('../src/lib/panorama.mjs');
 const story=connectivityStory(internet.municipal);
 assert.equal(story.latest.accesos,978);
 assert.equal(story.previous.accesos,971);
 assert.equal(story.quarter,3);
 assert.equal(story.points.length,7);
 assert.ok(Math.abs(story.change-7/971*100)<1e-10);
 assert.ok(story.points.every(p=>p.trimestre===3));
});
test('panorama uses weighted electricity rates and separates pp from percent',async()=>{
 const {energyStory}=await import('../src/lib/panorama.mjs');
 const story=energyStory(energy);
 assert.equal(story.rows[0].nombre,'San Pedro');
 assert.equal(story.rows[0].valor,5812/6164*100);
 assert.equal(story.gap,5812/6164*100-1561861/1689454*100);
});
test('investment story counts eight departments without subproject double counting',async()=>{
 const {investmentStory}=await import('../src/lib/panorama.mjs');
 const story=investmentStory(management.registros);
 assert.equal(story.rows.length,8);
 assert.equal(story.total,13435321251);
 assert.equal(story.rows[0].valor,7772469282);
 assert.ok(Math.abs(story.rows.reduce((s,r)=>s+r.share,0)-100)<1e-10);
});
