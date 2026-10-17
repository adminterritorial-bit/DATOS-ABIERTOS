import {NextResponse} from 'next/server';
import {indicadoresICET} from '@/lib/icetCatalog';
import {observacionesDocumentales} from '@/lib/observacionesDocumentales2026';
import {observacionesExternas} from '@/lib/observacionesFuentesExternas';
import {indicadoresCalculados} from '@/lib/indicadoresCalculados';
import datosMasivos from '@/data/fuentesMasivas76670.json';
import {observacionesTerriData} from '@/lib/terriDataExpanded';

export const dynamic='force-static';

export async function GET(){
 const territorial=observacionesTerriData.filter(x=>x.divipola==='76670').map(x=>({
  id:x.id,nombre:x.titulo,tema:x.sector,valor:x.valor,unidad:x.unidad,
  anio:x.anio,periodo:String(x.anio),fuente:x.fuente,pagina:x.pagina,
  icet:undefined,clase:'observacion',divipola:'76670'
 }));
 const anexos=[...observacionesDocumentales,...observacionesExternas,...indicadoresCalculados].map(x=>({
  id:x.id,nombre:x.nombre,tema:x.sector,valor:x.valor,unidad:x.unidad,
  anio:x.anio,periodo:x.periodo,fuente:x.fuente,pagina:x.pagina,
  icet:x.codigoIcet,clase:x.vinculacion,metodo:x.id.startsWith('DER-')?'CALCULADO':'PUBLICADO',divipola:'76670',nota:x.nota??null
 }));
 const masivos=datosMasivos.observaciones.filter(r=>r.divipola==='76670'&&Number.isFinite(r.valor)).map(r=>({
  id:r.id,nombre:r.nombre,tema:r.sector,valor:r.valor,unidad:r.unidad,
  anio:r.anio,periodo:'Corte registrado en el conjunto de origen',fuente:r.fuente,
  pagina:0,icet:r.icet,clase:r.clase,metodo:r.metodo,divipola:'76670',nota:r.nota
 }));
 const cobertura=new Set([...anexos,...masivos].filter(x=>x.clase==='directa'&&x.icet).map(x=>x.icet));
 const directas=new Set([16,23,36,41,45,46].map(n=>'ICET-'+String(n).padStart(2,'0')));
 for(const c of directas)cobertura.add(c);
 return NextResponse.json({municipio:'San Pedro',departamento:'Valle del Cauca',
  divipola:'76670',catalogo_icet:indicadoresICET.length,
  indicadores_con_valores_directos:cobertura.size,
  fuentes_estadisticas:territorial.length+anexos.length+masivos.length,
  observaciones:[...territorial,...anexos,...masivos],
  nota:'Serie histórica y procedencia explícitas; los valores del informe no demuestran publicación en micrositio durante la vigencia ICET evaluada.'},
  {headers:{'Cache-Control':'public, max-age=300, s-maxage=3600','X-Content-Type-Options':'nosniff'}});
}
