import TerritorialDashboard from '@/components/TerritorialDashboard';
import {obtenerFeed} from '@/lib/publicFeed';
export const dynamic='force-dynamic';
export default async function Page(){
 try{const feed=await obtenerFeed();return <TerritorialDashboard feed={feed}/>;}
 catch(err){return <TerritorialDashboard feed={null} error={err instanceof Error?err.message:'No se pudo consultar la fuente'}/>;}
}
