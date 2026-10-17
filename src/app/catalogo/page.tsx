import {obtenerFeed} from '@/lib/publicFeed';
import CatalogoClient from '@/components/CatalogoClient';
export const dynamic='force-dynamic';
export default async function Catalogo(){try{const d=await obtenerFeed();return <CatalogoClient rows={d.registros}/>;}catch{return <main style={{padding:40}}>La biblioteca de datos está temporalmente fuera de servicio. <a href="/">Volver al observatorio</a>.</main>}}
