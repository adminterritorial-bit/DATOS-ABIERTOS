
'use client';
import {Suspense,useMemo} from 'react';
import CatalogoClient from '@/components/CatalogoClient';
import {usePublicFeed} from '@/lib/usePublicFeed';
import {reunirEstadisticas} from '@/lib/territorialDataset';
export default function Catalogo(){
 const {feed}=usePublicFeed();
 const rows=useMemo(()=>reunirEstadisticas(feed).map(r=>({id:r.id,codigo:r.codigoSerie||r.nombre+'|'+r.unidad,nombre:r.nombre,tema:r.sector,grupo:r.origen||'Estadística documentada',anio:r.anio,valor:r.valor,unidad:r.unidad,pagina:r.pagina||null,fuente:r.fuente,fuente_url:r.fuenteUrl||'',tipo:r.tipoFuente||r.clase,precision:r.precision,nota:r.nota||''})),[feed]);
 return <Suspense fallback={<div className="shell-loading" role="status">Abriendo el catálogo…</div>}><CatalogoClient rows={rows}/></Suspense>;
}
