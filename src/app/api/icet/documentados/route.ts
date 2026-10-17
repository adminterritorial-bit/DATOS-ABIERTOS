import {NextResponse} from 'next/server';
import {indicadoresICET} from '@/lib/icetCatalog';
import {observacionesDocumentales} from '@/lib/observacionesDocumentales2026';
import {observacionesExternas} from '@/lib/observacionesFuentesExternas';
import {observacionesTerriData} from '@/lib/terriDataExpanded';

export const dynamic='force-static';

export async function GET(){
 const territorial=observacionesTerriData.filter(x=>x.divipola==='76670').map(x=>({
  id:x.id,nombre:x.titulo,tema:x.sector,valor:x.valor,unidad:x.unidad,
  anio:x.anio,periodo:String(x.anio),fuente:x.fuente,pagina:x.pagina,
  icet:undefined,clase:'observacion',divipola:'76670'
 }));
 const anexos=[...observacionesDocumentales,...observacionesExternas].map(x=>({
  id:x.id,nombre:x.nombre,tema:x.sector,valor:x.valor,unidad:x.unidad,
  anio:x.anio,periodo:x.periodo,fuente:x.fuente,pagina:x.pagina,
  icet:x.codigoIcet,clase:x.vinculacion,divipola:'76670',nota:x.nota??null
 }));
 const cobertura=new Set(anexos.filter(x=>x.clase==='directa'&&x.icet).map(x=>x.icet));
 const directas=new Set([16,23,36,41,45,46].map(n=>'ICET-'+String(n).padStart(2,'0')));
 for(const c of directas)cobertura.add(c);
 return NextResponse.json({municipio:'San Pedro',departamento:'Valle del Cauca',
  divipola:'76670',catalogo_icet:indicadoresICET.length,
  indicadores_con_valores_directos:cobertura.size,
  fuentes_estadisticas:territorial.length+anexos.length,
  observaciones:[...territorial,...anexos],
  nota:'Serie histórica y procedencia explícitas; los valores del informe no demuestran publicación en micrositio durante la vigencia ICET evaluada.'},
  {headers:{'Cache-Control':'public, max-age=300, s-maxage=3600','X-Content-Type-Options':'nosniff'}});
}
