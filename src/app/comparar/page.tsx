'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,BarChart3,Download,Info,Share2} from 'lucide-react';
import {usePublicFeed} from '@/lib/usePublicFeed';
import {formatear} from '@/lib/publicFeed';
import type {ObservacionPublica} from '@/lib/publicFeed';
import LineChart from '@/components/charts/LineChart';
const palette=['#176ed5','#24a7af','#8c6bd5'];
const safeCsv=(v:unknown)=>{let s=String(v??'');if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
export default function CompararPeriodos(){
 const {feed,error,loading}=usePublicFeed();
 const [codigos,setCodigos]=useState<string[]>(['DANE-POB-TOTAL','DANE-POB-CABECERA']);
 const [desde,setDesde]=useState('2018'),[hasta,setHasta]=useState('2026');
 const [copiado,setCopiado]=useState(false);
 useEffect(()=>{
  const s=new URLSearchParams(location.search).get('series');
  const a=Number(new URLSearchParams(location.search).get('desde'));
  const b=Number(new URLSearchParams(location.search).get('hasta'));
  if(s&&s.length<150)setCodigos(s.split(',').filter(x=>/^[A-Za-z0-9_-]+$/.test(x)).slice(0,3));
  if(a>=1990&&a<=2100)setDesde(String(a));
  if(b>=1990&&b<=2100)setHasta(String(b));
 },[]);
 const multi=useMemo(()=>{
  const m=new Map<string,ObservacionPublica[]>();
  for(const r of feed?.registros||[]){
   const arr=m.get(r.codigo)||[];arr.push(r);m.set(r.codigo,arr);
  }
  return [...m.entries()].filter(([_,arr])=>new Set(arr.map(r=>r.anio)).size>=2).map(([codigo,arr])=>({codigo,nombre:arr[0].nombre,unidad:arr[0].unidad,rows:arr.sort((a,b)=>a.anio-b.anio)})).sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
 },[feed]);
 const chosen=multi.filter(s=>codigos.includes(s.codigo));
 const unit=chosen[0]?.unidad;
 const years=[...new Set(chosen.flatMap(s=>s.rows.map(r=>r.anio)))].filter(y=>y>=Number(desde)&&y<=Number(hasta)).sort((a,b)=>a-b);
 const series=chosen.filter(s=>s.unidad===unit).map((s,i)=>({nombre:s.nombre,color:palette[i%palette.length],valores:s.rows.filter(r=>years.includes(r.anio)).map(r=>({anio:r.anio,valor:Number(r.valor)}))}));
 const yearOptions=[...new Set(multi.flatMap(m=>m.rows.map(r=>r.anio)))].filter(x=>x>=2018&&x<=2042).sort((a,b)=>a-b);
 const toggle=(codigo:string)=>{
  const found=multi.find(s=>s.codigo===codigo);
  if(!found)return;
  if(codigos.includes(codigo))setCodigos(a=>a.length===1?a:a.filter(x=>x!==codigo));
  else if(found.unidad===unit||!chosen.length)setCodigos(a=>[...a.slice(-2),codigo]);
 };
 const rows=years.map(y=>({anio:y,values:series.map(s=>s.valores.find(p=>p.anio===y)?.valor??null)}));
 const exportar=()=>{
  const header=['Vigencia',...series.map(s=>s.nombre+' ('+unit+')')];
  const csv=[header,...rows.map(r=>[r.anio,...r.values.map(v=>v??'')])].map(r=>r.map(safeCsv).join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='san-pedro-comparacion-'+desde+'-'+hasta+'.csv';a.click();URL.revokeObjectURL(url);
 };
 const compartir=async()=>{
  const url=new URL(location.href);url.searchParams.set('series',codigos.join(','));url.searchParams.set('desde',desde);url.searchParams.set('hasta',hasta);
  try{await navigator.clipboard.writeText(url.toString());setCopiado(true);window.setTimeout(()=>setCopiado(false),1400)}catch{location.href=url.toString()}
 };
 return <main className="ot-app" style={{display:'block',minHeight:'100vh'}}><div className="ot-main" style={{maxWidth:1180}}>
 <Link className="ot-back-link" href="/"><ArrowLeft size={16}/> Inicio del Observatorio</Link>
 <div className="ot-heading-strip"><div><span className="ot-small-heading">EXPLORACIÓN TEMPORAL</span><h1 className="ot-library-heading">Comparar series y vigencias</h1><p>Selecciona variables de la misma unidad. Las tasas, los porcentajes y los conteos no se suman ni se comparan en la misma escala.</p></div><BarChart3 color="#176ed5" size={31}/></div>
 <section className="ot-panel"><div className="ot-filters">
 <label className="ot-select-label">Desde <select value={desde} onChange={e=>setDesde(e.target.value)}>{yearOptions.map(y=><option key={y} value={y}>{y}</option>)}</select></label>
 <label className="ot-select-label">Hasta <select value={hasta} onChange={e=>setHasta(e.target.value)}>{yearOptions.map(y=><option key={y} value={y}>{y}</option>)}</select></label>
 <button className="ot-icon-action" onClick={compartir}><Share2 size={15}/>{copiado?'Enlace copiado':'Compartir'}</button>
 <button disabled={!rows.length} className="ot-btn ot-export" onClick={exportar}><Download size={15}/> CSV</button></div>
 {loading?<div className="ot-empty" role="status">Consultando las series públicas...</div>:error?<p className="ot-doc-notice" role="alert">Servicio estadístico temporalmente fuera de línea.</p>:<>
 <div className="ot-series-options">{multi.map(s=><button key={s.codigo} type="button" aria-pressed={codigos.includes(s.codigo)} disabled={!codigos.includes(s.codigo)&&chosen.length>0&&s.unidad!==unit} onClick={()=>toggle(s.codigo)} className={'ot-series-choice '+(codigos.includes(s.codigo)?'chosen':'')}><strong>{s.nombre}</strong><span>{s.unidad} · {s.rows.length} períodos</span></button>)}</div>
 <p className="ot-fineprint"><Info size={15}/> Puedes visualizar hasta tres series con unidad compatible. Las series históricas mantienen sus fuentes originales.</p>
 <div style={{marginTop:25}}><LineChart series={series}/></div>
 <div style={{overflowX:'auto',marginTop:25}}><table className="ot-compare-table"><thead><tr><th>Vigencia</th>{series.map(s=><th key={s.nombre}>{s.nombre}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.anio}><td>{r.anio}</td>{r.values.map((v,i)=><td key={i}>{v===null?'—':formatear(v,2)}</td>)}</tr>)}</tbody></table></div>
 </>}
 </section>
 </div></main>;
}
