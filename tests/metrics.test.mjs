import test from 'node:test';
import assert from 'node:assert/strict';
import {formatValor, variacion, cumplimiento, csvSeguro} from '../src/lib/metrics.mjs';
test('distingue ausencia de cero',()=>{assert.equal(formatValor(null),'Sin dato');assert.equal(formatValor(0),'0');});
test('nunca construye variación relativa con base cero',()=>{assert.equal(variacion(4,0).relativa,null);assert.equal(variacion(15,10).absoluta,5);});
test('metas no comparables requieren metodología',()=>{assert.equal(cumplimiento(10,5,'descendente'),null);assert.equal(cumplimiento(10,5),50);});
test('CSV escapa fórmulas peligrosas',()=>{assert.equal(csvSeguro('=1+1'),'"\'=1+1"');assert.equal(csvSeguro('dato "x"'),'"dato ""x"""');});
