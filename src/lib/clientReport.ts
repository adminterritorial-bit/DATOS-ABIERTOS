'use client';
import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import type {ObservacionPublica} from './publicFeed';
import {formatear} from './publicFeed';

/** Build the same institutional PDF directly in the browser: no Next.js server is required. */
export async function descargarInformePDF(rows:ObservacionPublica[],year:number,sector:string){
 if(!rows.length)throw new Error('No hay datos para elaborar el informe.');
 const pdf=await PDFDocument.create();
 pdf.setTitle('Observatorio Territorial San Pedro - '+year);
 pdf.setAuthor('Alcaldía Municipal de San Pedro');
 const reg=await pdf.embedFont(StandardFonts.Helvetica);
 const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const navy=rgb(.055,.18,.34),blue=rgb(.07,.41,.82),gray=rgb(.41,.49,.58);
 const safe=(v:unknown)=>String(v??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[–—]/g,'-').replace(/[^\x20-\x7e\xa0-\xff]/g,' ');
 const trunc=(s:string,max:number)=>s.length>max?s.slice(0,max-3)+'...':s;
 const W=595,H=842;
 let page=pdf.addPage([W,H]),y=H-50;
 function nextPage(){
  page=pdf.addPage([W,H]);y=H-50;
  page.drawText('OBSERVATORIO TERRITORIAL - SAN PEDRO',{x:38,y,font:bold,size:11,color:navy});
  y-=30;
 }
 function write(label:string,size=10,strong=false,color=navy){
  if(y<68)nextPage();
  page.drawText(trunc(safe(label),size<=9?115:92),{x:40,y,font:strong?bold:reg,size,color});
  y-=size+11;
 }
 page.drawRectangle({x:0,y:H-215,width:W,height:215,color:navy});
 page.drawText('ALCALDIA MUNICIPAL DE SAN PEDRO',{x:40,y:H-89,font:bold,size:14,color:rgb(.75,.88,.99)});
 page.drawText('OBSERVATORIO TERRITORIAL',{x:40,y:H-135,font:bold,size:24,color:rgb(1,1,1)});
 page.drawText('Informe estadistico '+year,{x:40,y:H-170,font:bold,size:17,color:rgb(.41,.89,.81)});
 y=H-248;
 write('Municipio: San Pedro, Valle del Cauca - DIVIPOLA 76670',10,true);
 write('Sector: '+sector+'  |  Vigencia: '+year+'  |  Registros: '+rows.length,10);
 y-=12;write('ESTADISTICAS Y FUENTES',13,true,blue);
 const sorted=[...rows].sort((a,b)=>a.tema.localeCompare(b.tema,'es')||a.nombre.localeCompare(b.nombre,'es'));
 for(const r of sorted){
  const name=safe(r.nombre);
  if(name.length>84){write(name.slice(0,84),10,true);write(name.slice(84,168),10,true);}
  else write(name,10,true);
  write('Valor: '+formatear(Number(r.valor),2)+' '+r.unidad+' | '+r.anio,10,false,blue);
  write('Fuente: '+r.fuente+(r.pagina?' · pagina '+r.pagina:''),9,false,gray);
  y-=6;
 }
 y-=8;write('ALCANCE',12,true,blue);
 write('Se conservan año, unidad y procedencia. Proyecciones no son censos.',9);
 write('Las sumas derivadas y presupuestos iniciales no representan ejecucion.',9);
 const pages=pdf.getPages();
 pages.forEach((p,i)=>p.drawText('Observatorio San Pedro | '+year+'                     Pagina '+(i+1)+' de '+pages.length,{x:40,y:23,font:reg,size:8,color:gray}));
 const bytes=await pdf.save();
 const blob=new Blob([new Uint8Array(bytes)],{type:'application/pdf'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='observatorio-san-pedro-'+year+'.pdf';document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),15000);
}
