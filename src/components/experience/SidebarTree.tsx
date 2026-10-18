'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {BookOpen,ChevronDown,Compass,Folder,FolderOpen,Heart,LayoutDashboard,MapPinned,PanelLeftClose,Pin,PinOff,Sparkles} from 'lucide-react';
import {sectionForPath} from '@/lib/shellNavigation.mjs';
import {macroDimensiones,temasTerritoriales} from '@/lib/territorialTaxonomy';
type Props={path?:string;active:string;onTopic:(id:string)=>void;onMap:()=>void;onExplore:()=>void;onHome:()=>void};
const STORAGE='sanpedro-observatorio-pinned-topics-v1';
export default function SidebarTree({path='/',active,onTopic,onMap,onExplore,onHome}:Props){
 const [folders,setFolders]=useState<string[]>([]);
 const [pinned,setPinned]=useState<string[]>([]);
 const route=sectionForPath(path).id;
 const reduced=useReducedMotion();
 useEffect(()=>{try{const p=JSON.parse(localStorage.getItem(STORAGE)||'[]');if(Array.isArray(p))setPinned(p.filter(v=>typeof v==='string'))}catch{}},[]);
 const toggleFolder=(id:string)=>setFolders(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 const togglePinned=(id:string)=>setPinned(v=>{const next=v.includes(id)?v.filter(x=>x!==id):[id,...v].slice(0,8);try{localStorage.setItem(STORAGE,JSON.stringify(next))}catch{}return next});
 const topicItem=(id:string,pinnable=true)=>{
  const t=temasTerritoriales.find(x=>x.id===id);if(!t)return null;
  return <motion.div layout={!reduced} key={id} className={'n5-tree-row '+(active===id?'is-current':'')}>
    <button className="n5-tree-item" aria-current={active===id?'page':undefined} onClick={()=>onTopic(id)}><span className="n5-file-bullet" style={{background:t.color}}/><span>{t.nombre}</span><small>{t.items.length}</small></button>
    {pinnable&&<button className="n5-pin-action" onClick={()=>togglePinned(id)} aria-label={(pinned.includes(id)?'Desfijar ':'Fijar ')+t.nombre} title={pinned.includes(id)?'Quitar de favoritos':'Fijar arriba'}>{pinned.includes(id)?<PinOff size={14}/>:<Pin size={14}/>}</button>}
   </motion.div>;
 };
 return <div className="n5-navigation">
  <div className="n5-navigation-heading"><span>ACCESOS PRINCIPALES</span><Sparkles size={15}/></div>
  <nav className="n5-toplinks" aria-label="Navegación principal">
   <button aria-current={route==='inicio'&&active==='Todos'?'page':undefined} onClick={onHome}><LayoutDashboard size={20}/><span>Inicio · Mi Observatorio</span></button>
   <button aria-current={route==='temas'?'page':undefined} onClick={onExplore}><BookOpen size={20}/><span>Explorar los 14 temas</span></button>
   <button aria-current={route==='mapa'?'page':undefined} onClick={onMap}><MapPinned size={20}/><span>Mapa de San Pedro</span></button>
   <Link href="/catalogo/" aria-current={route==='catalogo'?'page':undefined}><BookOpen size={20}/><span>Catálogo de datos</span></Link>
   <Link href="/rendicion/" aria-current={route==='rendicion'?'page':undefined}><LayoutDashboard size={20}/><span>Gestión municipal 2025</span></Link>
   <Link href="/territorios/" aria-current={route==='territorios'||route==='comparar'?'page':undefined}><MapPinned size={20}/><span>Comparar territorios</span></Link>
   <Link href="/icet/recuperados/" aria-current={route==='icet'?'page':undefined}><Compass size={20}/><span>Indicadores DANE</span></Link>
   <Link href="/documentos/" aria-current={route==='documentos'?'page':undefined}><BookOpen size={20}/><span>Fuentes y documentos</span></Link>
  </nav>
  <details className="shell-additional-tools"><summary>Más herramientas del observatorio</summary><nav aria-label="Más herramientas">{[['/poblacion/','Población y demografía'],['/seguridad/','Seguridad ciudadana'],['/comparar/','Comparar series históricas'],['/pdt/','Plan de Desarrollo'],['/estimador/','Laboratorio estadístico']].map(([href,label])=><Link key={href} href={href} aria-current={path.startsWith(href)?'page':undefined}>{label}</Link>)}</nav></details>
  <div className="n5-navigation-heading"><span>MIS TEMAS FAVORITOS</span><Heart size={15}/></div>
  <motion.div layout className="n5-pinned" aria-label="Temas fijados arriba">{pinned.length?pinned.map(id=>topicItem(id)):<p>Fija aquí tus temas preferidos con el icono de chincheta.</p>}</motion.div>
  <div className="n5-navigation-heading"><span>BIBLIOTECA DE TEMAS</span><Folder size={15}/></div>
  <div className="n5-folders" role="group" aria-label="Carpetas de temáticas">{macroDimensiones.map(m=>{
   const isOpen=folders.includes(m);
   const children=temasTerritoriales.filter(t=>t.macro===m);
   return <div key={m} className={'n5-folder '+(isOpen?'is-open':'')}>
     <button className="n5-folder-trigger" aria-expanded={isOpen} onClick={()=>toggleFolder(m)}>{isOpen?<FolderOpen size={20}/>:<Folder size={20}/>}<span>{m}</span><small>{children.length}</small><ChevronDown size={15}/></button>
     <AnimatePresence initial={false}>{isOpen&&<motion.div initial={reduced?false:{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.25}} className="n5-folder-content">{children.map(t=>topicItem(t.id))}</motion.div>}</AnimatePresence>
    </div>;
  })}</div>
  <button className="n5-more-topics" onClick={onExplore}><BookOpen size={17}/> Ver todas las categorías <span>→</span></button>
 </div>;
}
