import {NextResponse} from 'next/server';
import {obtenerFeed} from '@/lib/publicFeed';
export const dynamic='force-dynamic';
export async function GET(){
 try{
 const feed=await obtenerFeed();
 return NextResponse.json({municipio:feed.municipio,divipola:feed.divipola,departamento:feed.departamento,actualizado:feed.actualizado_consulta,observaciones:feed.registros,total:feed.registros.length},{headers:{'Cache-Control':'public, max-age=120, s-maxage=300','X-Content-Type-Options':'nosniff'}});
 }catch{return NextResponse.json({error:'Servicio estadístico temporalmente no disponible'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
