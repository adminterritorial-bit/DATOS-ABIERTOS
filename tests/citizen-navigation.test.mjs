import test from 'node:test';
import assert from 'node:assert/strict';
import {readHomeQuery,homeQueryUrl,datumDates} from '../src/lib/citizenNavigation.mjs';
const topics=['educacion','servicios'];const macros=['Desarrollo humano'];
test('home queries preserve valid filters and discard unknown input',()=>{assert.deepEqual(readHomeQuery('?tema=educacion&anio=2023&clase=Calculado&buscar=matrícula&vista=catalogo',topics,macros),{tema:'educacion',macro:'Todos',anio:'2023',clase:'Calculado',buscar:'matrícula',vista:'catalogo'});assert.equal(readHomeQuery('?tema=javascript:foo&anio=oops&clase=Admin&vista=unknown',topics,macros).tema,'Todos');assert.equal(readHomeQuery('?anio=oops',topics,macros).anio,'Todos');});
test('canonical home links encode search and omit defaults',()=>{const state=readHomeQuery('?tema=educacion&anio=2023&buscar=a%26b',topics,macros);const url=homeQueryUrl(state);assert.equal(url,'/DATOS-ABIERTOS/?tema=educacion&anio=2023&buscar=a%26b');assert.deepEqual(readHomeQuery(url.split('?')[1],topics,macros),state);assert.equal(homeQueryUrl(readHomeQuery('',topics,macros)),'/DATOS-ABIERTOS/');});
test('source dates never turn an observation year into publication or consultation date',()=>{const dates=datumDates({anio:2023,nota:'San Pedro · trimestre 3',fuente:'Fuente sin metadatos'});assert.equal(dates.period,'2023 · trimestre 3');assert.equal(dates.published,null);assert.equal(dates.consulted,null);assert.equal(datumDates({anio:2025,publicadoEn:'2026-02-10',consultadoEn:'invalid'}).published,'10 de febrero de 2026');});

test('month-only publication metadata retains its documented precision',()=>{assert.equal(datumDates({anio:2025,publicadoEn:'2026-05'}).published,'mayo de 2026');});
