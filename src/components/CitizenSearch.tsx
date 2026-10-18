'use client';
import {useEffect,useId,useMemo,useRef,useState,type KeyboardEvent} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {createPortal} from 'react-dom';
import {BookOpen,Database,Search,X,ArrowUpRight,Compass} from 'lucide-react';
import {reunirEstadisticas} from '@/lib/territorialDataset';
import {indicadoresICET} from '@/lib/icetCatalog';
import {createSearchEntries,searchEntries,type SearchFilter,type SearchKind} from '@/lib/searchEntries.mjs';
import type {FeedPublico} from '@/lib/publicFeed';
import {useDialogFocus} from '@/components/useDialogFocus';
import './citizen-search.css';

const kinds:SearchKind[]=['ruta','dato','indicador'];
const headings={ruta:'Secciones y accesos directos',dato:'Cifras documentadas',indicador:'Diccionario · 66 indicadores ICET'};
const filters:{id:SearchFilter;label:string}[]=[{id:'todos',label:'Todos'},{id:'ruta',label:'Secciones'},{id:'dato',label:'Cifras'},{id:'indicador',label:'ICET'}];

export default function CitizenSearch({feed,openRequest=0,initialQuery=''}:{feed:FeedPublico|null;openRequest?:number;initialQuery?:string}){
 const [abierto,setAbierto]=useState(false),[q,setQ]=useState(''),[filter,setFilter]=useState<SearchFilter>('todos'),[active,setActive]=useState(0);
 const id=useId(),router=useRouter(),inputRef=useRef<HTMLInputElement>(null);
 const dialogRef=useDialogFocus(abierto,()=>setAbierto(false));
 const entries=useMemo(()=>createSearchEntries(reunirEstadisticas(feed),indicadoresICET),[feed]);
 const result=useMemo(()=>searchEntries(entries,q,filter),[entries,q,filter]);
 // Groups follow their highest ranked result, with relevance preserved inside each group.
 const groups=kinds.map(kind=>({kind,items:result.items.filter(item=>item.clase===kind)})).filter(group=>group.items.length).sort((a,b)=>result.items.indexOf(a.items[0])-result.items.indexOf(b.items[0]));
 const visible=groups.flatMap(group=>group.items);
 const selected=visible[Math.min(active,Math.max(0,visible.length-1))];
 useEffect(()=>{if(openRequest>0){setQ(initialQuery);setFilter('todos');setActive(0);setAbierto(true)}},[openRequest,initialQuery]);
 useEffect(()=>{
  const handle=(e:globalThis.KeyboardEvent)=>{
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setAbierto(s=>!s);}
  };
  document.addEventListener('keydown',handle);
  return ()=>document.removeEventListener('keydown',handle);
 },[]);
 useEffect(()=>{if(!abierto){setQ('');setActive(0);setFilter('todos')}},[abierto]);
 useEffect(()=>{if(abierto&&selected)document.getElementById(`${id}-result-${selected.id}`)?.scrollIntoView({block:'nearest'});},[abierto,active,q,filter,id,selected?.id]);
 const cerrar=()=>setAbierto(false);
 const prepareNavigation=(href:string)=>{if(href==='/')window.dispatchEvent(new CustomEvent('observatorio:home-action',{detail:{kind:'home'}}));cerrar();};
 const clearQuery=()=>{setQ('');setActive(0);inputRef.current?.focus();};
 const navigateSelected=(e:KeyboardEvent<HTMLInputElement>)=>{
  if(e.nativeEvent.isComposing)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   e.preventDefault();
   if(visible.length)setActive(current=>(current+(e.key==='ArrowDown'?1:-1)+visible.length)%visible.length);
  }else if(e.key==='Enter'&&selected){e.preventDefault();prepareNavigation(selected.href);router.push(selected.href);}
 };
 const totalKinds=result.counts.ruta+result.counts.dato+result.counts.indicador;
 return <>
  <button type="button" className="ot-global-search" onClick={()=>setAbierto(true)} aria-haspopup="dialog" aria-label="Buscar en el Observatorio">
   <Search size={16} aria-hidden="true"/><span>Buscar datos, indicadores...</span><kbd>Ctrl K</kbd>
  </button>
  {abierto&&createPortal(<div className="ot-cmd-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)cerrar()}}>
   <section ref={dialogRef} className="ot-cmd-dialog" role="dialog" aria-modal="true" aria-label="Búsqueda global de datos">
    <div className="ot-cmd-head"><Search size={21} aria-hidden="true"/><input ref={inputRef} value={q} onChange={e=>{setQ(e.target.value);setActive(0)}} placeholder="Buscar indicador, fuente, sector o año..." aria-label="Escribe tu búsqueda" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-results`} aria-activedescendant={selected?`${id}-result-${selected.id}`:undefined} aria-describedby={`${id}-count`} onKeyDown={navigateSelected}/>{q&&<button type="button" onClick={clearQuery} aria-label="Limpiar búsqueda"><X size={15}/></button>}<button type="button" onClick={cerrar} aria-label="Cerrar buscador"><X size={18}/></button></div>
    <div className="ot-search-filters" role="group" aria-label="Tipo de resultado">{filters.map(item=><button type="button" key={item.id} aria-pressed={filter===item.id} onClick={()=>{setFilter(item.id);setActive(0);inputRef.current?.focus();}}>{item.label}<span>{item.id==='todos'?totalKinds:result.counts[item.id]}</span></button>)}</div>
    <p id={`${id}-count`} className="ot-search-count" role="status">{q.trim()?`${result.total} ${result.total===1?'coincidencia':'coincidencias'} para «${q.trim()}»`:filter==='todos'?`${result.total} accesos directos. Busca palabras, una fuente, un año o un código ICET.`:`${result.total} ${filter==='dato'?'cifras documentadas':filter==='indicador'?'definiciones ICET':'secciones disponibles'}`}{result.total>visible.length&&` · Mostrando ${visible.length}; afina la búsqueda para ver más.`}</p>
    <div className="ot-cmd-results" id={`${id}-results`} role="listbox" aria-label="Resultados de búsqueda">
     {groups.map(group=><div key={group.kind} role="group" aria-label={headings[group.kind]}><h2 className="ot-cmd-caption">{headings[group.kind]}</h2>{group.items.map(item=>{
      const index=visible.indexOf(item),isActive=selected?.id===item.id;
      return <Link key={item.id} id={`${id}-result-${item.id}`} href={item.href} className={'ot-cmd-result'+(isActive?' is-active':'')} role="option" aria-selected={isActive} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey)prepareNavigation(item.href);}} onFocus={()=>setActive(index)} onMouseEnter={()=>setActive(index)}>
       <span className="ot-cmd-result-icon" aria-hidden="true">{item.clase==='indicador'?<BookOpen size={18}/>:item.clase==='dato'?<Database size={18}/>:<Compass size={18}/>}</span>
       <span><strong>{item.titulo}</strong><small className="ot-search-description">{item.descripcion}{item.valor?' · '+item.valor:''}</small><small className="ot-search-metadata">Período: {item.periodo} <span aria-hidden="true">·</span> Fuente: {item.fuente}</small>{item.clase==='dato'&&<small className="ot-search-metadata">Naturaleza: {item.naturaleza||'No documentada'} · Procedencia: {item.origen||'No documentada'}{item.calificador?' · '+item.calificador:''}</small>}</span><ArrowUpRight size={15} aria-hidden="true"/>
      </Link>;
     })}</div>)}
     {!visible.length&&<div className="ot-cmd-empty"><strong>No hay coincidencias{filter!=='todos'?' en '+filters.find(item=>item.id===filter)?.label.toLowerCase():''}.</strong><p>Prueba con menos palabras, una fuente como DANE o MinTIC, un año o un código como ICET-01.</p>{filter!=='todos'&&<button type="button" onClick={()=>{setFilter('todos');setActive(0);inputRef.current?.focus();}}>Buscar en todas las secciones</button>}</div>}
    </div><p className="ot-cmd-foot">Ctrl/⌘ K abre · ↑ ↓ seleccionan · Enter abre la selección · Esc cierra</p>
   </section>
  </div>,document.body)}
 </>;
}
