'use client';
import {ArrowDown,ArrowUpRight,Compass,Search,MapPinned} from 'lucide-react';
import TopBannerCarousel from './TopBannerCarousel';
import './immersive-home.css';

export default function ImmersiveHero({onExplore,onMap,onSearch}:{onExplore:()=>void;onMap:()=>void;onSearch:(query?:string)=>void}){
 return <section className="immersive-hero" aria-labelledby="immersive-title">
  <svg className="immersive-contours" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1">{Array.from({length:12},(_,i)=><path key={i} d={`M ${-150+i*25} 900 C ${400+i*24} ${680-i*30}, ${780-i*8} ${130+i*18}, 1700 ${-100+i*32}`}/>)}</g></svg>
  <div className="immersive-masthead"><span><Compass size={18}/> SAN PEDRO <i/> VALLE DEL CAUCA</span><small>OBSERVATORIO DE DATOS ABIERTOS</small></div>
  <div className="immersive-art"><TopBannerCarousel/></div>
  <div className="immersive-intro"><div><span className="immersive-eyebrow">CONOCER NOS ACERCA. LOS DATOS NOS CONECTAN.</span><h1 id="immersive-title">Un territorio.<br/><em>Miles de historias.</em></h1><p>Descubre cómo vivimos, cómo cambia nuestro municipio y qué cuentan sus cifras. Explora San Pedro con información abierta y fuentes a un clic.</p><button className="immersive-primary" onClick={onExplore}>Comenzar a explorar <ArrowDown size={18}/></button></div>
   <div className="immersive-discover"><span>¿QUÉ QUIERES DESCUBRIR?</span><button className="immersive-search" onClick={()=>onSearch()} aria-label="Buscar en todos los datos"><Search size={23}/><span>Encuentra un dato, un tema<br/><strong>o una nueva perspectiva.</strong></span><ArrowUpRight size={23}/></button><div className="immersive-suggestions">{['Población','Educación','Inversión'].map(query=><button key={query} onClick={()=>onSearch(query)} aria-label={'Buscar '+query}>{query}<ArrowUpRight size={11}/></button>)}</div><button className="immersive-map" onClick={onMap}><span><MapPinned size={20}/> El municipio, punto a punto</span><ArrowUpRight size={19}/></button><small>Consulta cada cifra con su año, fuente y alcance.</small></div>
  </div>
  <div className="immersive-bottom"><span>ESTADÍSTICAS PARA TODAS LAS PERSONAS</span><button onClick={onExplore}>Desliza para descubrir <ArrowDown size={15}/></button></div>
 </section>;
}
