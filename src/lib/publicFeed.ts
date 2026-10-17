export const PUBLIC_FEED_URL = 'https://dvdpgllezrmttrknbcjq.supabase.co/functions/v1/observatorio-public-feed';

export interface ObservacionPublica {
 id: string; codigo: string; nombre: string; tema: string; grupo: string;
 anio: number; valor: number; unidad: string; pagina: number | null;
 fuente: string; fuente_url: string; tipo: string; nota: string;
}
export interface FeedPublico {
 municipio: string; departamento: string; divipola: string; aviso: string;
 actualizado_consulta: string; registros: ObservacionPublica[];
}
export async function obtenerFeed(): Promise<FeedPublico> {
 const response = await fetch(PUBLIC_FEED_URL, {next: { revalidate: 300 }, headers: { accept: 'application/json' }});
 if (!response.ok) throw new Error('Fuente estadística temporalmente no disponible');
 const data: unknown = await response.json();
 if (typeof data !== 'object' || data === null || !('registros' in data) || !Array.isArray(data.registros)) {
  throw new Error('Respuesta estadística incompatible');
 }
 const feed = data as FeedPublico;
 if (feed.divipola !== '76670') throw new Error('Identificación municipal inválida');
 return { ...feed, registros: feed.registros.filter(x => x && typeof x.nombre==='string' && Number.isFinite(Number(x.valor)) && Number.isInteger(x.anio) && x.anio >= 1900 && x.anio <= 2100 && typeof x.unidad==='string' && typeof x.fuente === 'string') };
}
export const formatear = (v: number, max = 1) => new Intl.NumberFormat('es-CO',{ maximumFractionDigits: max }).format(v);
export function encontrar(feed: ObservacionPublica[], palabras: string, anio: number) {
 const all = palabras.toLowerCase().split('|');
 return feed.find(r => r.anio === anio && all.some(s => r.nombre.toLowerCase().includes(s)));
}
export function reducirSerie(rows: ObservacionPublica[], codigo: string, maxAnio=2026) {
 return rows.filter(r => r.codigo===codigo && r.anio<=maxAnio).sort((a,b)=>a.anio-b.anio);
}
