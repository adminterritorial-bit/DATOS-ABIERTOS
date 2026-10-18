'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowRight,ArrowUpRight,BookOpen,ChevronRight,Menu,Search,X} from 'lucide-react';
import CitizenSearch from '@/components/CitizenSearch';
import {useDialogFocus} from '@/components/useDialogFocus';
import {PublicFeedProvider,usePublicFeed} from '@/lib/usePublicFeed';
import {normalizeAppPath,sectionForPath} from '@/lib/shellNavigation.mjs';
import {temasTerritoriales,macroDimensiones} from '@/lib/territorialTaxonomy';
import {formatSourceDate} from '@/lib/citizenNavigation.mjs';
import SidebarTree from './SidebarTree';
import {ShellContext} from './ShellContext';
import './observatory-shell.css';

function PersistentFrame({children}:{children:React.ReactNode}){
 const rawPath=usePathname(),path=normalizeAppPath(rawPath),router=useRouter();
 const section=sectionForPath(path),isHome=path==='/';
 const {feed,loading}=usePublicFeed();
 const [menu,setMenu]=useState(false),[mobile,setMobile]=useState(false);
 const [searchRequest,setSearchRequest]=useState({id:0,query:''});
 const [homeContext,setHomeContext]=useState({tema:'Todos',macro:'Todos'});
 const previousPath=useRef(path);
 const drawerRef=useDialogFocus(menu&&mobile,()=>setMenu(false));
 const api=useMemo(()=>({openSearch:(query='')=>{setMenu(false);setSearchRequest(r=>({id:r.id+1,query}))}}),[]);
 useEffect(()=>{const media=window.matchMedia('(max-width:900px)');const sync=()=>{setMobile(media.matches);if(!media.matches)setMenu(false)};sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync)},[]);
 useEffect(()=>{
  const update=(event:Event)=>{const detail=(event as CustomEvent).detail;if(!detail)return;setHomeContext({tema:temasTerritoriales.some(t=>t.id===detail.tema)?detail.tema:'Todos',macro:macroDimensiones.includes(detail.macro)?detail.macro:'Todos'})};
  window.addEventListener('observatorio:home-context',update);return()=>window.removeEventListener('observatorio:home-context',update);
 },[]);
 useEffect(()=>{
  if(previousPath.current===path)return;
  previousPath.current=path;setMenu(false);
  const frame=requestAnimationFrame(()=>{const heading=document.querySelector<HTMLElement>('#xp-main h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}});
  return()=>cancelAnimationFrame(frame);
 },[path]);
 const navigate=(destination:string)=>{setMenu(false);router.push(destination)};
 const homeAction=(kind:'home'|'map'|'topic',topic?:string)=>{
  setMenu(false);
  if(isHome){window.dispatchEvent(new CustomEvent('observatorio:home-action',{detail:{kind,topic}}));return;}
  navigate(kind==='home'?'/':kind==='map'?'/mapa/':'/?tema='+encodeURIComponent(topic||'Todos'));
 };
 const theme=temasTerritoriales.find(t=>t.id===homeContext.tema);
 const title=isHome?theme?.nombre||(homeContext.macro==='Todos'?section.title:homeContext.macro):section.title;
 return <ShellContext.Provider value={api}><div className="xp-app observatory-shell" data-shell="persistent">
  <a className="xp-skip" href="#xp-main">Ir al contenido estadístico</a>
  <aside ref={drawerRef} id="observatory-navigation" className={'xp-side shell-sidebar '+(menu?'is-open':'')} aria-label="Navegación temática del Observatorio" onClick={e=>{if((e.target as Element).closest('a[href]'))setMenu(false)}} aria-hidden={mobile&&!menu?true:undefined} inert={mobile&&!menu}>
   <div className="xp-logo n5-official-logo"><div className="shell-brand-row"><span>DATOS ABIERTOS</span><button className="shell-menu-close" aria-label="Cerrar navegación" onClick={()=>setMenu(false)}><X size={18}/></button></div><Link href="/" className="g4-logo n5-crest-wrapper" aria-label="Inicio del Observatorio" onClick={e=>{if(isHome){e.preventDefault();homeAction('home')}else setMenu(false)}}><img src="/DATOS-ABIERTOS/escudo-san-pedro.png" alt="Alcaldía de San Pedro, Valle del Cauca: escudo y denominación oficial" width="234" height="95"/></Link><small>OBSERVATORIO DE DATOS ABIERTOS</small></div>
   <div className="shell-sidebar-scroll"><SidebarTree path={path} active={isHome?homeContext.tema:'Todos'} onTopic={id=>homeAction('topic',id)} onMap={()=>homeAction('map')} onExplore={()=>navigate('/temas/')} onHome={()=>homeAction('home')}/></div>
   <div className="xp-sidebar-bottom"><small>Alcaldía de San Pedro · Valle del Cauca</small><Link href="/documentos/" onClick={()=>setMenu(false)}>Biblioteca documental <BookOpen size={13}/></Link></div>
  </aside>
  {menu&&mobile&&<button className="xp-menu-overlay" aria-label="Cerrar menú lateral" onClick={()=>setMenu(false)}/>}
  <div className="xp-main shell-main">
   <header className="xp-header shell-header"><div className="shell-location"><button className="xp-mobile-nav" onClick={()=>setMenu(v=>!v)} aria-label="Abrir navegación" aria-expanded={menu} aria-controls="observatory-navigation"><Menu size={21}/></button><div><span className="shell-section-label">{isHome?'SAN PEDRO · VALLE DEL CAUCA':section.group}</span><nav className="xp-breadcrumb" aria-label="Ruta de navegación"><Link href="/" onClick={e=>{if(isHome){e.preventDefault();homeAction('home')}}}>Observatorio</Link><ChevronRight size={13}/><strong aria-current="page">{title}</strong></nav></div></div><div className="xp-header-actions"><CitizenSearch feed={feed} openRequest={searchRequest.id} initialQuery={searchRequest.query}/><span className="xp-period" title="La consulta del servicio no actualiza la vigencia de cada observación"><span/>{loading?'Consultando servicio':formatSourceDate(feed?.actualizado_consulta)?'Servicio consultado: '+formatSourceDate(feed?.actualizado_consulta):'Fuentes versionadas'}</span><Link href="/territorios/" title="Comparador territorial">Comparar datos <ArrowUpRight size={15}/></Link></div></header>
   <div className="shell-route-tools" aria-label="Herramientas para encontrar información"><span>Tu observatorio, siempre a mano.</span><nav aria-label="Herramientas de consulta"><Link href="/catalogo/">Consultar datos <ArrowRight size={13}/></Link><Link href="/documentos/">Ver fuentes <ArrowRight size={13}/></Link><button onClick={()=>api.openSearch()}><Search size={13}/> Buscar información</button></nav></div>
   <div id="xp-main" className="shell-page-area" tabIndex={-1}>{children}</div>
  </div>
 </div></ShellContext.Provider>;
}
export default function ObservatoryShell({children}:{children:React.ReactNode}){return <PublicFeedProvider><PersistentFrame>{children}</PersistentFrame></PublicFeedProvider>}
