'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,AlertTriangle,FileCheck2} from 'lucide-react';
import {borradorPDT2025 as fuente} from '@/lib/pdt2025Draft';
import {formatValor,csvSeguro} from '@/lib/metrics.mjs';
export default function PDTRevision(){
 const [query,setQuery]=useState('');const [incidencias,setIncidencias]=useState(false);
 const [dep,setDep]=useState('Todas');
 const depts=['Todas',...new Set(fuente.map(x=>x.dependencia))];
 const rows=useMemo(()=>fuente.filter(x=>(!incidencias||x.incidencia)&&(dep==='Todas'||x.dependencia===dep)&&
 (x.nombre_parcial.toLowerCase().includes(query.toLowerCase())||x.id.includes(query))),[query,incidencias,dep]);
 const download=()=>{const data=[['ID','Pagina','Dependencia','Nombre parcial','Meta extraida','Ejecutado extraido','Incidencia'],...rows.map(x=>[x.id,x.pagina,x.dependencia,x.nombre_parcial,x.meta,x.ejecutado,x.incidencia?'SI':'NO'])];
 const url=URL.createObjectURL(new Blob(['\uFEFF'+data.map(row=>row.map(csvSeguro).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='pdt-2025-revision-no-certificado.csv';a.click();URL.revokeObjectURL(url);};
 const s:React.CSSProperties={border:'1px solid #e0e9f4',borderRadius:10,background:'white',padding:12,fontSize:12};
 return <main style={{maxWidth:1190,margin:'auto',padding:'30px 20px 55px',color:'#193554'}}>
 <Link href="/" style={{display:'inline-flex',gap:7,alignItems:'center',color:'#0870d5',fontWeight:700}}><ArrowLeft size={16}/> Observatorio</Link>
 <p style={{color:'#0d6ad3',fontWeight:800,fontSize:10,letterSpacing:1.5,margin:'29px 0 5px'}}>SEGUIMIENTO MUNICIPAL · VIGENCIA 2025</p>
 <h1 style={{fontSize:'clamp(28px,4vw,40px)',margin:'8px 0'}}>Revisión de metas del PDT</h1>
 <p style={{color:'#74889f',lineHeight:1.7,maxWidth:900}}>Las 88 filas provienen de una extracción preliminar del informe municipal de ejecución. Sus títulos son parciales, no constituyen indicadores certificados y deben contrastarse con las páginas originales antes de publicación.</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:13,margin:'23px 0'}}>
 {[['Filas extraídas',88],['Con anomalías',17],['Aprobadas institucionalmente',0]].map(([name,value])=><div key={String(name)} style={{...s,padding:20}}><small style={{color:'#8195aa'}}>{name}</small><strong style={{display:'block',fontSize:30,marginTop:10}}>{value}</strong></div>)}</div>
 <div style={{display:'flex',gap:11,alignItems:'start',background:'#fff6e5',border:'1px solid #ffebc1',borderRadius:10,padding:17,marginBottom:20}}><AlertTriangle color="#ad7b16" size={20}/><p style={{margin:0,fontSize:12,lineHeight:1.7,color:'#816e4e'}}>No se calcula cumplimiento ni se publican cifras como oficiales. En los 17 registros con anomalías, el ejecutado se muestra vacío hasta corregir la extracción. El informe distingue metas programadas, ejecución y presupuesto.</p></div>
 <section style={{...s,padding:20}}><div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
 <input aria-label="Buscar extracto" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre o código" style={{...s,flex:'2 1 185px'}}/>
 <select aria-label="Filtrar dependencia" value={dep} onChange={e=>setDep(e.target.value)} style={{...s,flex:'1 1 160px'}}>{depts.map(x=><option key={x}>{x}</option>)}</select>
 <label style={{display:'inline-flex',gap:8,alignItems:'center',fontSize:11}}><input type="checkbox" checked={incidencias} onChange={e=>setIncidencias(e.target.checked)}/> Solo anomalías</label>
 <button onClick={download} style={{background:'#0b69d1',color:'white',border:0,borderRadius:9,padding:'11px 15px',fontWeight:800,fontSize:11}}>Exportar revisión CSV</button>
 </div><p style={{fontSize:11,color:'#8b9faf',margin:'18px 0 11px'}}>{rows.length} filas</p>
 <div style={{overflowX:'auto'}}><table style={{minWidth:830,borderCollapse:'collapse',width:'100%',fontSize:11,textAlign:'left'}}><thead><tr style={{background:'#f1f6fc'}}>{['Referencia','Dependencia tentativa','Nombre parcial','Meta extraída','Ejecutado extraído','Estado'].map(x=><th key={x} style={{padding:12}}>{x}</th>)}</tr></thead><tbody>{rows.map(x=><tr key={x.id}>{[x.id+' · p.'+x.pagina,x.dependencia,x.nombre_parcial,formatValor(x.meta),x.ejecutado===null?'—':formatValor(x.ejecutado),x.incidencia?'ANOMALÍA':'SIN VALIDAR'].map((v,i)=><td key={i} style={{padding:'12px 10px',borderBottom:'1px solid #eaf0f7',color:i===5&&x.incidencia?'#a65c08':'#52718e'}}>{v}</td>)}</tr>)}</tbody></table></div>
 <p style={{color:'#8a9dab',fontSize:11,lineHeight:1.7,display:'flex',gap:9}}><FileCheck2 size={17}/> Fuente original: 52005_informerendicioncuentassp.pdf, 115 páginas; fecha de generación 17/04/2026.</p></section></main>;
}
