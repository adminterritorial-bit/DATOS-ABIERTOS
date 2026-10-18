'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {createPortal} from 'react-dom';
import {BookOpen,Database,FileSearch,Home,Search,ShieldCheck,Users2,X,ArrowUpRight,Compass} from 'lucide-react';
import {reunirEstadisticas} from '@/lib/territorialDataset';
import {indicadoresICET} from '@/lib/icetCatalog';
import type {FeedPublico} from '@/lib/publicFeed';
import {useDialogFocus} from '@/components/useDialogFocus';

type Entrada={id:string;titulo:string;descripcion:string;href:string;clase:'ruta'|'indicador'|'dato';anio?:number};
const rutas:Entrada[]=[
 {id:'rendicion',titulo:'Rendición de cuentas 2025',descripcion:'Inversión, beneficiarios, programas y compromisos',href:'/rendicion/',clase:'ruta'},
 {id:'territorios',titulo:'Comparadores territoriales',descripcion:'San Pedro, Valle del Cauca y Colombia · UPME, MinTIC y DANE',href:'/territorios/',clase:'ruta'},
 {id:'inicio',titulo:'Inicio y panorama',descripcion:'Visión general del municipio',href:'/',clase:'ruta'},
 {id:'icet',titulo:'66 indicadores territoriales',descripcion:'Diccionario ICET del DANE',href:'/icet/',clase:'ruta'},
 {id:'catalogo',titulo:'Explorar los datos abiertos',descripcion:'Estadísticas, fuentes y períodos',href:'/catalogo/',clase:'ruta'},
 {id:'demografia',titulo:'Población y demografía',descripcion:'Proyecciones oficiales DANE',href:'/poblacion/',clase:'ruta'},
 {id:'seguridad',titulo:'Seguridad ciudadana 2025',descripcion:'Registros policiales por conducta',href:'/seguridad/',clase:'ruta'},
 {id:'documentos',titulo:'Biblioteca de fuentes',descripcion:'Enlaces documentales y metadatos',href:'/documentos/',clase:'ruta'},
];
const normalizar=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export default function CitizenSearch({feed,openRequest=0,initialQuery=''}:{feed:FeedPublico|null;openRequest?:number;initialQuery?:string}){
 const [abierto,setAbierto]=useState(false),[q,setQ]=useState('');
 const dialogRef=useDialogFocus(abierto,()=>setAbierto(false));
 useEffect(()=>{if(openRequest>0){setQ(initialQuery);setAbierto(true)}},[openRequest,initialQuery]);
 useEffect(()=>{
  const handle=(e:KeyboardEvent)=>{
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setAbierto(s=>!s);}
   if(e.key==='Escape')setAbierto(false);
  };
  document.addEventListener('keydown',handle);
  return ()=>document.removeEventListener('keydown',handle);
 },[]);
 useEffect(()=>{if(!abierto)setQ('')},[abierto]);
 const resultados=useMemo(()=>{
  const term=normalizar(q.trim());
  if(!term)return rutas;
  const items:Entrada[]=[
   ...rutas,
   ...indicadoresICET.map(i=>({id:i.codigo,titulo:i.nombre,descripcion:i.codigo+' · '+i.area,href:'/icet/?q='+encodeURIComponent(i.codigo),clase:'indicador' as const})),
   ...reunirEstadisticas(feed).map(r=>({id:'registro-'+r.id+'-'+r.anio,titulo:r.nombre,descripcion:r.sector+' · '+r.anio+' · '+r.fuente,href:(r.origen==='Gestión municipal'?'/rendicion/?buscar=':'/catalogo/?buscar=')+encodeURIComponent(r.nombre),clase:'dato' as const,anio:r.anio}))
  ];
  return items.filter(e=>normalizar(e.titulo+' '+e.descripcion).includes(term)).slice(0,14);
 },[feed,q]);
 const cerrar=()=>setAbierto(false);
 return <>
  <button type="button" className="ot-global-search" onClick={()=>setAbierto(true)} aria-haspopup="dialog" aria-label="Buscar en el Observatorio">
   <Search size={16}/><span>Buscar datos, indicadores...</span><kbd>Ctrl K</kbd>
  </button>
  {abierto&&createPortal(<div className="ot-cmd-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)cerrar()}}>
   <section ref={dialogRef} className="ot-cmd-dialog" role="dialog" aria-modal="true" aria-label="Búsqueda global de datos">
    <div className="ot-cmd-head"><Search size={21}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar indicador, fuente o sector..." aria-label="Escribe tu búsqueda" onKeyDown={e=>{if(e.key==='Enter'&&resultados.length){window.location.assign('/DATOS-ABIERTOS'+resultados[0].href);}}}/><button type="button" onClick={cerrar} aria-label="Cerrar buscador"><X size={18}/></button></div>
    <div className="ot-cmd-results">
     <p className="ot-cmd-caption">{q?'RESULTADOS DEL OBSERVATORIO':'ACCESOS DIRECTOS'}</p>
     {resultados.map(item=><Link key={item.id} href={item.href} className="ot-cmd-result" onClick={cerrar}>
      <span className="ot-cmd-result-icon">{item.clase==='indicador'?<BookOpen size={18}/>:item.clase==='dato'?<Database size={18}/>:<Compass size={18}/>}</span>
      <span><strong>{item.titulo}</strong><small>{item.descripcion}</small></span><ArrowUpRight size={15}/>
     </Link>)}
     {!resultados.length&&<p className="ot-cmd-empty">No hay coincidencias. Prueba con un sector, un código ICET o una palabra más general.</p>}
    </div><p className="ot-cmd-foot">Atajo Ctrl/⌘ K · Enter abre el primer resultado · Esc cierra</p>
   </section>
  </div>,document.body)}
 </>;
}
