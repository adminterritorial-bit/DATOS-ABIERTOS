'use client';
import {useEffect,useId,useState} from 'react';
import {Bookmark,ChevronDown,Trash2} from 'lucide-react';
import {addSavedQuery,normalizeSavedQueryUrl,parseSavedQueries,removeSavedQuery,SAVED_QUERIES_EVENT,SAVED_QUERIES_KEY,writeSavedQueries,type SavedQuery} from '@/lib/savedQueries.mjs';
import './saved-queries.css';
export type SavedQueriesProps={url:string;label:string;onRestore?:(url:string)=>void};
const dateLabel=(iso:string)=>new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso));
export default function SavedQueries({url,label,onRestore}:SavedQueriesProps){
 const id=useId();
 const [items,setItems]=useState<SavedQuery[]>([]),[status,setStatus]=useState(''),[open,setOpen]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{
  const refresh=()=>{
   try{const result=parseSavedQueries(window.localStorage.getItem(SAVED_QUERIES_KEY));setItems(result.items);if(result.invalid)setStatus('Algunas consultas guardadas no se pudieron recuperar. Puede guardar una consulta nueva.');}
   catch{setItems([]);setStatus('No se puede acceder a las consultas guardadas en este navegador.');}
   setReady(true);
  };
  const storageChanged=(event:StorageEvent)=>{if(event.key===SAVED_QUERIES_KEY||event.key===null)refresh();};
  refresh();window.addEventListener('storage',storageChanged);window.addEventListener(SAVED_QUERIES_EVENT,refresh);
  return ()=>{window.removeEventListener('storage',storageChanged);window.removeEventListener(SAVED_QUERIES_EVENT,refresh);};
 },[]);
 const update=(operation:'save'|'remove',removedUrl?:string)=>{
  try{
   const storage=window.localStorage;
   const current=parseSavedQueries(storage.getItem(SAVED_QUERIES_KEY));
   const next=operation==='save'?addSavedQuery(current.items,url,label,new Date().toISOString()):removeSavedQuery(current.items,removedUrl||'');
   if(!next){setStatus('Esta selección no se puede guardar. Use una consulta del observatorio con filtros válidos.');return;}
   if(!writeSavedQueries(storage,next)){setStatus(operation==='save'?'No se guardó la consulta. El navegador no permite escribir o no tiene espacio disponible.':'No se eliminó la consulta. El navegador no permite actualizar el almacenamiento.');return;}
   setItems(next);setStatus(operation==='save'?`Consulta guardada en este dispositivo.${current.items.length>=8&&!current.items.some(r=>r.url===normalizeSavedQueryUrl(url))?' Se reemplazó la más antigua para conservar hasta ocho.':''}`:'Consulta eliminada.');
   if(operation==='save')setOpen(true);
   window.dispatchEvent(new Event(SAVED_QUERIES_EVENT));
  }catch{setStatus(operation==='save'?'No se guardó la consulta. El almacenamiento de este navegador no está disponible.':'No se eliminó la consulta. El almacenamiento de este navegador no está disponible.');}
 };
 return <section className="saved-queries" aria-label="Consultas guardadas en este dispositivo"><div className="sq-actions"><button type="button" className="sq-save" disabled={!ready} onClick={()=>update('save')}><Bookmark size={15} aria-hidden="true"/>Guardar esta consulta</button><button type="button" className="sq-toggle" aria-expanded={open} aria-controls={`${id}-list`} onClick={()=>setOpen(!open)}>Mis consultas guardadas <span>{items.length}/8</span><ChevronDown size={15} aria-hidden="true" className={open?'sq-chevron-open':''}/></button></div><p className="sq-status" role="status" aria-live="polite" aria-atomic="true">{status}</p><div id={`${id}-list`} hidden={!open} className="sq-list"><p className="sq-device-note">Se conservan hasta ocho consultas en este navegador y dispositivo, sin cuenta ni sincronización. Guardar conserva los filtros, no una copia de los datos.</p>{items.length?<ul>{items.map(item=><li key={item.url}><a href={item.url} onClick={e=>{if(onRestore&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();onRestore(item.url);}}}><strong>{item.label}</strong><span>Guardada el <time dateTime={item.savedAt}>{dateLabel(item.savedAt)}</time></span></a><button type="button" className="sq-remove" aria-label={`Eliminar consulta: ${item.label}`} onClick={()=>update('remove',item.url)}><Trash2 size={15} aria-hidden="true"/><span>Eliminar</span></button></li>)}</ul>:<p className="sq-empty">Aún no tiene consultas guardadas. Ajuste los filtros y seleccione «Guardar esta consulta».</p>}</div></section>;
}
