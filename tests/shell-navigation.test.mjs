import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAppPath,sectionForPath,shellSections} from '../src/lib/shellNavigation.mjs';
test('section resolution handles base paths, queries, slashes and nested map routes',()=>{assert.equal(normalizeAppPath('/DATOS-ABIERTOS/territorios/?indicador=internet'),'/territorios/');assert.equal(sectionForPath('/mapa/region/').id,'mapa');assert.equal(sectionForPath('/DATOS-ABIERTOS/icet/recuperados/').id,'icet');assert.equal(sectionForPath('/').id,'inicio');});
test('every primary destination resolves to one active section',()=>{for(const s of shellSections)assert.equal(sectionForPath(s.href).id,s.id);assert.equal(sectionForPath('/unknown/').id,'otro');assert.equal(sectionForPath('/mapamalo/').id,'otro');});
