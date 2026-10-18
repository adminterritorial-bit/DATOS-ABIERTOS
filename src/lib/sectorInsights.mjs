/** Sector views preserve source, scope, unit and methodological class. */
export const normalizeSectorText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function sectorFamily(topic) {
 if (topic === 'educacion') return 'education';
 if (['atencion','epidemiologia','mortalidad'].includes(topic)) return 'health';
 if (['ambiente','servicios'].includes(topic)) return 'environment';
 if (['economia','gobierno'].includes(topic)) return 'economy';
 return null;
}
const patterns = {
 education:/educacion|matricula|escolar|estudiante|saber 11|alfabet/,
 health:/salud|mortalidad|defuncion|epidemiolog|dengue|tubercul|malaria|vacuna|prenatal|parto|aseguramiento/,
 environment:/ambiente|residuo|recicl|quebrada|esteriliz|acueducto|alcantarillado|energia|electric|servicios publicos|saneamiento basico/,
 economy:/economia|presupuesto|hacienda|finanza|recaudo|ingresos|valor agregado|inversion reportada|emprendimiento|transparencia|gobierno/
};
export function sectorRows(rows, topic) {
 const family = sectorFamily(topic);
 return family ? rows.filter(r => Number.isFinite(r.valor) && Number.isInteger(r.anio) && patterns[family].test(normalizeSectorText(r.sector+' '+r.nombre))) : [];
}
export function sectorSeriesKey(r) {
 // The name includes urban/rural, population and indicator scope. Never group on ICET alone.
 return JSON.stringify([normalizeSectorText(r.nombre),r.codigoSerie || '',normalizeSectorText(r.nota).match(/trimestre\s+([1-4])/)?.[1] || '',normalizeSectorText(r.unidad),r.fuente,r.clase,r.origen || '',r.precision || 'exacto']);
}
export function sectorSeries(rows) {
 const groups = new Map();
 for (const r of rows) {
  if (!Number.isFinite(r.valor) || !Number.isInteger(r.anio)) continue;
  const key = sectorSeriesKey(r);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(r);
 }
 return [...groups.entries()].map(([key, records]) => {
  const years = new Map();
  for (const r of records) years.set(r.anio,[...(years.get(r.anio) || []),r]);
  // Conflicting observations for the same source/indicator/year cannot define a trend.
  const points = [...years.values()].filter(rr => rr.every(r => r.valor === rr[0].valor)).map(rr => rr[0]).sort((a,b) => a.anio-b.anio);
  return {key,points};
 }).filter(s => s.points.length).sort((a,b) => b.points.length-a.points.length || a.key.localeCompare(b.key,'es'));
}
export function latestSectorRows(rows) {
 return sectorSeries(rows).map(s => s.points.at(-1)).sort((a,b) => b.anio-a.anio || a.nombre.localeCompare(b.nombre,'es'));
}
export function sectorChange(previous, latest) {
 if (!previous || !latest || sectorSeriesKey(previous) !== sectorSeriesKey(latest) || previous.anio >= latest.anio) return null;
 const uncertain = r => r.clase === 'Estimación' || (r.precision && r.precision !== 'exacto') || /por confirmar|sin unidad|escala de la fuente/.test(normalizeSectorText(r.unidad)) || /acumulad|corte|parcial|preliminar/.test(normalizeSectorText(r.nota));
 if (uncertain(previous) || uncertain(latest) || !Number.isFinite(previous.valor) || !Number.isFinite(latest.valor)) return null;
 const delta = latest.valor-previous.valor;
 return {delta,percent:previous.valor === 0 ? null : delta/Math.abs(previous.valor)*100,unit:latest.unidad === '%' ? 'puntos porcentuales' : latest.unidad,from:previous.anio,to:latest.anio};
}
export function formatSectorValue(row) {
 const n = new Intl.NumberFormat('es-CO',{maximumFractionDigits:row.unidad === 'COP' ? 0 : 3}).format(row.valor);
 const p = normalizeSectorText(row.precision);
 return (p === 'superior a' ? '> ' : p === 'inferior a' ? '< ' : p.includes('aproximad') || row.clase === 'Estimación' ? '≈ ' : '') + n;
}
const parentIds = ['RC25-INV-PL','RC25-INV-GO','RC25-INV-ED','RC25-INV-BS','RC25-INV-AM','RC25-INV-HA','RC25-INV-SA','RC25-INV-SG'];
export function sectorBudget(rows) {
 const candidates = rows.filter(r => parentIds.includes(r.id) && r.unidad === 'COP' && r.anio === 2025 && r.origen === 'Gestión municipal' && Number.isFinite(r.valor) && r.valor >= 0);
 const unique = new Map(candidates.map(r => [r.id,r]));
 const complete = unique.size === parentIds.length;
 const total = complete ? [...unique.values()].reduce((sum,r) => sum+r.valor,0) : null;
 return {complete,total,rows:[...unique.values()].sort((a,b) => b.valor-a.valor).map(r => ({...r,share:total > 0 ? r.valor/total*100 : null}))};
}
