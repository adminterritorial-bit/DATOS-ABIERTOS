'use client';
import Link from 'next/link';
import {reportePolicial2025 as p} from '@/lib/policia2025Draft';
import {ArrowLeft,ShieldAlert,ExternalLink} from 'lucide-react';
export default function Seguridad2025(){
 const total=p.conteos.reduce((n,r)=>n+r.filas,0);
 return <main style={{maxWidth:1100,margin:'auto',padding:'35px 22px'}}>
 <Link href="/" style={{color:'#0967d5',display:'inline-flex',gap:8,alignItems:'center'}}><ArrowLeft size={16}/> Volver al observatorio</Link>
 <p style={{color:'#0d6bcf',fontWeight:800,letterSpacing:2,fontSize:10,marginTop:32}}>FUENTE NACIONAL · SEGURIDAD Y DEFENSA</p>
 <h1 style={{fontSize:'clamp(27px,4vw,40px)',margin:'9px 0'}}>Delitos registrados en 2025</h1>
 <p style={{color:'#7188a1',maxWidth:850,lineHeight:1.8}}>Conteo exploratorio de filas del archivo de información de delitos a nivel de registro de la Policía Nacional, filtrado por municipio San Pedro y departamento Valle del Cauca. No confundir filas con víctimas o hechos estadísticos únicos.</p>
 <section style={{display:'flex',flexWrap:'wrap',gap:13,margin:'24px 0'}}><article style={{padding:21,background:'white',borderRadius:13,flex:'1 1 220px',border:'1px solid #e6edf5'}}><small>Filas del archivo</small><h2 style={{fontSize:32,margin:'11px 0 3px'}}>{total}</h2><small>Vigencia del archivo: 2025</small></article><article style={{padding:21,background:'white',borderRadius:13,flex:'1 1 220px',border:'1px solid #e6edf5'}}><small>Tipos reportados</small><h2 style={{fontSize:32,margin:'11px 0 3px'}}>{p.conteos.length}</h2><small>Clasificación de conductas</small></article></section>
 <div style={{padding:16,display:'flex',gap:11,background:'#fff8e9',border:'1px solid #ffeac1',borderRadius:12,marginBottom:24}}><ShieldAlert color="#bd821c" size={23}/><div><strong>Advertencia metodológica</strong><p style={{fontSize:12,color:'#816b49',lineHeight:1.7,margin:'5px 0'}}>Estas cifras NO son todavía las cantidades definitivas del DANE ICET. Debe comprobarse el campo de cantidad, definición, duplicados, tentativas y unidad de análisis. El registro no representa directamente tasas.</p></div></div>
 <section style={{background:'white',borderRadius:14,border:'1px solid #e6eef7',overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:550}}><thead><tr style={{background:'#eef5ff'}}><th style={{padding:16,textAlign:'left'}}>Categoría (ICCS A.C. / Policía)</th><th style={{padding:16,textAlign:'right'}}>Filas</th></tr></thead><tbody>{p.conteos.map(r=><tr key={r.tipo}><td style={{padding:14,borderBottom:'1px solid #e9eff6',fontSize:12}}>{r.tipo}</td><td style={{padding:14,borderBottom:'1px solid #e9eff6',textAlign:'right',fontWeight:800,color:'#0667d3'}}>{r.filas}</td></tr>)}</tbody></table></section>
 <div style={{marginTop:22,fontSize:12,color:'#70849c'}}><p><strong>Integridad:</strong> SHA256 de archivo descargado: <code>{p.hash}</code></p><p><strong>Fecha consulta:</strong> {p.fechaConsulta} · Fuente 2025.</p><a href="https://www.policia.gov.co/index.php/estadistica-delictiva" target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',gap:7,alignItems:'center',color:'#0968d6',fontWeight:700}}>Ver publicación de Policía Nacional <ExternalLink size={15}/></a></div>
 <p style={{margin:'25px 0',fontSize:12}}><Link href="/icet" style={{color:'#0968d6'}}>Ver los nueve indicadores ICET de Seguridad y Defensa →</Link></p></main>
}
