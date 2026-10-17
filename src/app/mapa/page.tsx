'use client';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,Compass,Globe2,MapPinned,ShieldCheck} from 'lucide-react';
import {useMemo} from 'react';
import {usePublicFeed} from '@/lib/usePublicFeed';
import {reunirEstadisticas} from '@/lib/territorialDataset';
import ArcgisLocalMap from '@/components/maps/ArcgisLocalMap';
export default function MapaMunicipal(){
 const {feed}=usePublicFeed();
 const datos=useMemo(()=>reunirEstadisticas(feed),[feed]);
 return <main className="xp-map-page"><header className="xp-map-page-head"><Link href="/"><ArrowLeft size={16}/> Observatorio</Link><span><Globe2 size={20}/> GEOEXPLORACIÓN · SAN PEDRO</span><Link href="/mapa/region/">Comparación regional <ArrowUpRight size={16}/></Link></header>
 <div className="xp-map-page-body">
  <div className="xp-map-heading"><span className="xp-overline">NUEVA EXPERIENCIA TERRITORIAL</span><h1>Explorar San Pedro en el mapa.</h1><p>Conoce las zonas urbanas y centros poblados que aparecen en el Marco Geoestadístico Nacional 2025, con fichas verificables y sin atribuciones geográficas artificiales.</p></div>
  <ArcgisLocalMap datos={datos}/>
  <div className="xp-map-insight-grid"><article><MapPinned size={28}/><h2>Límites oficiales</h2><p>El límite municipal proviene del MGN DIVIPOLA DANE 2025 y se conserva como respaldo local para consultar el mapa incluso si el servicio está intermitente.</p></article><article><Compass size={28}/><h2>Centros poblados</h2><p>Los marcadores se obtienen por la consulta ArcGIS REST del DANE, usando el código municipal 76670 y la geometría entregada por la entidad.</p></article><article><ShieldCheck size={28}/><h2>Información con alcance</h2><p>No se convierte una tasa municipal en una cifra de barrio ni se atribuyen necesidades a una zona cuando el dato carece de desagregación.</p></article></div>
  <div className="xp-map-next"><div><span className="xp-overline">ESTADÍSTICAS CONTEXTUALIZADAS</span><h2>¿Quieres comparar con los municipios vecinos?</h2><p>El geovisor regional original se conserva y sigue disponible para comparar coberturas de servicios sin mezclarlas con los valores de San Pedro.</p></div><Link href="/mapa/region/">Abrir geovisor regional <ArrowUpRight size={16}/></Link></div>
 </div></main>;
}