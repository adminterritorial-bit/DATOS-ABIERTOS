export function formatValor(valor, decimales=1) {
 if (valor === null || valor === undefined || !Number.isFinite(valor)) return 'Sin dato';
 return new Intl.NumberFormat('es-CO', { maximumFractionDigits: decimales }).format(valor);
}
export function variacion(actual, anterior) {
 if (!Number.isFinite(actual) || !Number.isFinite(anterior)) return null;
 const absoluta = actual - anterior;
 return { absoluta, relativa: anterior === 0 ? null : 100 * absoluta / Math.abs(anterior) };
}
export function cumplimiento(meta, ejecutado, sentido='ascendente') {
 if (!Number.isFinite(meta) || !Number.isFinite(ejecutado) || meta <= 0) return null;
 if (sentido !== 'ascendente') return null;
 return Math.round((ejecutado / meta) * 10000) / 100;
}
export function csvSeguro(v) {
 const raw=String(v === null || v === undefined ? '' : v);
 const protectedValue=/^[\s]*[=+\-@\t\r]/.test(raw) ? "'"+raw : raw;
 return '"' + protectedValue.replace(/"/g,'""') + '"';
}
