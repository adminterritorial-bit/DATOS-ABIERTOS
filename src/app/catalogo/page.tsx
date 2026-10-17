'use client';
import CatalogoClient from '@/components/CatalogoClient';
import {usePublicFeed} from '@/lib/usePublicFeed';
export default function Catalogo(){
 const {feed,error,loading}=usePublicFeed();
 if(loading)return <main style={{padding:40}} role="status">Consultando las estadísticas de San Pedro...</main>;
 if(error)return <main style={{padding:40}} role="alert">Los datos no están disponibles en este momento. Intenta actualizar la página.</main>;
 return <CatalogoClient rows={feed?.registros||[]}/>;
}
