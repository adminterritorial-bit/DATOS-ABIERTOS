import {NextRequest,NextResponse} from 'next/server';
import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {obtenerFeed,formatear} from '@/lib/publicFeed';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const WIDTH=595.28, HEIGHT=841.89;
const fixed=(s:unknown)=>String(s??'').replace(/[–—]/g,'-').replace(/[“”]/g,'"').replace(/[’‘]/g,"'").replace(/[^\x20-\x7E\xA0-\xFF]/g,' ');
function cortar(s:string,n=92){return s.length>n?s.slice(0,n-3)+'...':s}
export async function GET(request:NextRequest){
 const year=Number(request.nextUrl.searchParams.get('anio')||2025);
 const sector=(request.nextUrl.searchParams.get('sector')||'Panorama').slice(0,75);
 if(!Number.isInteger(year)||year<2018||year>2026)return NextResponse.json({error:'Año fuera de rango'},{status:400});
 try{
  const feed=await obtenerFeed();
  const rows=feed.registros.filter(x=>x.anio===year&&(sector==='Panorama'||x.tema===sector)).sort((a,b)=>a.tema.localeCompare(b.tema,'es')||a.nombre.localeCompare(b.nombre,'es'));
  if(!rows.length)return NextResponse.json({error:'No existen registros para esta combinación'},{status:404});
  const doc=await PDFDocument.create();
  doc.setTitle('Observatorio Territorial San Pedro - '+year);
  doc.setAuthor('Alcaldía Municipal de San Pedro - Observatorio Territorial');
  doc.setSubject('Reporte generado a partir del servicio estadístico público de Supabase');
  const regular=await doc.embedFont(StandardFonts.Helvetica), bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const navy=rgb(.045,.15,.31),blue=rgb(.045,.38,.78),grey=rgb(.40,.49,.60),line=rgb(.90,.93,.96);
  let page=doc.addPage([WIDTH,HEIGHT]);let y=HEIGHT-60;let pagina=1;
  function nueva(){
   page=doc.addPage([WIDTH,HEIGHT]);pagina+=1;y=HEIGHT-65;
   page.drawText('OBSERVATORIO TERRITORIAL / SAN PEDRO', {x:43,y,font:bold,size:10,color:navy});
   y-=33;
  }
  function escribir(texto:string,size=10,weight='regular',color=navy,indent=43){
   if(y<64)nueva();
   page.drawText(cortar(fixed(texto),108),{x:indent,y,font:weight==='bold'?bold:regular,size,color});
   y-=size+9;
  }
  page.drawRectangle({x:0,y:HEIGHT-245,width:WIDTH,height:245,color:navy});
  page.drawRectangle({x:42,y:HEIGHT-76,width:42,height:5,color:rgb(.20,.83,.75)});
  page.drawText('ALCALDIA MUNICIPAL DE SAN PEDRO',{x:42,y:HEIGHT-105,size:13,font:bold,color:rgb(.72,.85,.99)});
  page.drawText('OBSERVATORIO TERRITORIAL',{x:42,y:HEIGHT-147,size:24,font:bold,color:rgb(1,1,1)});
  page.drawText('Informe estadistico '+year,{x:42,y:HEIGHT-178,size:17,font:bold,color:rgb(.42,.89,.84)});
  page.drawText('Valle del Cauca, Colombia | DIVIPOLA 76670',{x:42,y:HEIGHT-202,size:11,font:regular,color:rgb(.76,.84,.94)});
  y=HEIGHT-289;
  escribir('RESUMEN DE CONTENIDO',13,'bold',blue);escribir('Tematica: '+sector,10,'bold');escribir('Vigencia estadistica: '+year);escribir('Cantidad de observaciones: '+rows.length);
  escribir('Consulta: '+feed.actualizado_consulta);
  y-=12;page.drawLine({start:{x:43,y},end:{x:WIDTH-43,y},thickness:1,color:line});y-=29;
  escribir('CIFRAS Y PROCEDENCIA',13,'bold',blue);
  for(const r of rows){
   if(y<150)nueva();
   const title=fixed(r.nombre);
   const max=82;const split=title.length>max?[title.slice(0,max),title.slice(max,max*2)]:[title];
   split.forEach((segment,i)=>escribir((i?'  ':'')+segment,10,'bold',navy));
   escribir('Dato: '+formatear(Number(r.valor),2)+' '+r.unidad+'  |  '+r.tema+'  |  '+r.anio,10,'regular',blue);
   escribir('Fuente: '+r.fuente+(r.pagina?' (pagina '+r.pagina+')':''),8,'regular',grey);
   y-=10;page.drawLine({start:{x:43,y},end:{x:WIDTH-43,y},thickness:.65,color:line});y-=18;
  }
  if(y<180)nueva();y-=7;
  escribir('ALCANCE Y LIMITACIONES',11,'bold',blue);
  for(const note of [
   'Cada valor conserva la vigencia y unidad de la fuente. No mezclar conteos con tasas.',
   'Las proyecciones del DANE no representan censos anuales ni hechos observados.',
   'Las cifras de fichas TerriData pueden corresponder a diferentes entidades productoras.',
   'No se hacen atribuciones causales ni comparaciones sin metodologias compatibles.',
   'Fuente en linea: https://terridata.dnp.gov.co/ y portal DANE.'
  ])escribir(note,8,'regular',grey);
  const all=doc.getPages();
  all.forEach((p,i)=>p.drawText('San Pedro - Observatorio Territorial | '+year+'                                          Pag. '+(i+1)+' / '+all.length,{x:43,y:26,size:8,font:regular,color:grey}));
  const bytes=await doc.save();
  return new NextResponse(new Uint8Array(bytes) as BodyInit,{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="observatorio-san-pedro-'+year+'.pdf"','Cache-Control':'private, max-age=0','X-Content-Type-Options':'nosniff'}});
 }catch(e){return NextResponse.json({error:'El informe no se encuentra disponible en este momento'},{status:503});}
}
