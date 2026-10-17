import Link from 'next/link';
import {reportePolicial2025 as p} from '@/lib/policia2025Draft';
import {ArrowLeft,ExternalLink,Shield,FileSpreadsheet} from 'lucide-react';
import {formatear} from '@/lib/publicFeed';
const clases=p.conteos.map(r=>({...r,nombre:r.tipo.replace(/^\(\d+\)\s*/,'' )}));
const total=clases.reduce((n,r)=>n+r.filas,0);
const max=Math.max(...clases.map(x=>x.filas),1);
export default function Seguridad(){
 const robo=clases.filter(x=>/HURTO A AUTOMOTORES|HURTO A MOTOCICLETAS/.test(x.nombre)).reduce((n,r)=>n+r.filas,0);
 const personas=clases.find(x=>x.nombre==='HURTO A PERSONAS')?.filas||0;
 const homicidio=clases.find(x=>x.nombre==='HOMICIDIO INTENCIONAL')?.filas||0;
 return <main className="ot-app" style={{display:'block',minHeight:'100vh'}}><div className="ot-main" style={{maxWidth:1160}}>
 <Link href="/" style={{color:'#0e6edf',display:'inline-flex',gap:8,alignItems:'center',fontWeight:800,fontSize:12}}><ArrowLeft size={17}/> Volver al Observatorio</Link>
 <div className="ot-heading-strip"><div><span className="ot-small-heading">SEGURIDAD CIUDADANA · POLICÍA NACIONAL</span><h1 style={{font:'800 32px Manrope',margin:'8px 0'}}>Registro de conductas · 2025</h1><p>Distribución de registros delictivos del municipio de San Pedro. Las cifras expresan filas del archivo, no víctimas o hechos únicos.</p></div><Shield color="#1273d6" size={28}/></div>
 <div className="ot-kpis"><article className="ot-kpi"><div className="ot-kpi-top">Registros territoriales <FileSpreadsheet size={17}/></div><strong>{formatear(total,0)}</strong><small>Filas en el archivo 2025</small></article><article className="ot-kpi"><div className="ot-kpi-top">Hurtos a automotores y motos</div><strong>{robo}</strong><small>Filas, dos categorías distintas</small></article><article className="ot-kpi"><div className="ot-kpi-top">Hurto a personas</div><strong>{personas}</strong><small>Filas de esta clasificación</small></article><article className="ot-kpi"><div className="ot-kpi-top">Homicidio intencional</div><strong>{homicidio}</strong><small>Filas; no tasa ICET 57</small></article></div>
 <section className="ot-panel"><div className="ot-panel-head"><div><span className="ot-small-heading">DISTRIBUCIÓN POR CONDUCTA</span><h2 style={{font:'800 19px Manrope',margin:'7px 0'}}>Categorías del registro 2025</h2><p>{clases.length} categorías · lectura directa de archivo oficial filtrado a San Pedro, Valle</p></div></div>
 <div style={{display:'grid',gap:15}}>{[...clases].sort((a,b)=>b.filas-a.filas).map(r=><div key={r.tipo} style={{display:'grid',gridTemplateColumns:'minmax(160px,1.25fr) minmax(70px,1fr) 48px',gap:12,alignItems:'center',fontSize:11}}>
 <span style={{color:'#58718f',lineHeight:1.5}}>{r.nombre.charAt(0)+r.nombre.slice(1).toLocaleLowerCase('es-CO')}</span><span style={{height:11,borderRadius:12,background:'#edf2f9',overflow:'hidden'}}><span style={{height:'100%',width:(r.filas/max*100)+'%',display:'block',borderRadius:12,background:'linear-gradient(90deg,#146bd2,#36b0cd)'}}/></span><strong style={{textAlign:'right',color:'#0c67c8'}}>{r.filas}</strong></div>)}</div>
 <div style={{marginTop:25,display:'flex',gap:12,flexWrap:'wrap',fontSize:11,color:'#69839a'}}>
 <span>Vigencia: {p.anio}</span><span>Fuente: Policía Nacional</span><span>Unidad: filas de registro</span>
 </div></section>
 <section className="ot-panel" style={{marginTop:18}}><span className="ot-small-heading">TRAZABILIDAD DOCUMENTAL</span><h3 style={{font:'800 18px Manrope',margin:'10px 0'}}>Procedencia y unidad estadística</h3><p style={{fontSize:12,color:'#617c98',lineHeight:1.85}}>Las 209 filas del archivo de registro no se homologan automáticamente a hechos, personas víctimas, robos únicos ni tasas de criminalidad. La extracción permite calcular por separado la columna CANTIDAD cuando está disponible y es válida para todas las filas de una categoría. Hasta contar con ese consolidado comprobado, el portal muestra únicamente filas, sin inflar indicadores ICET.</p>
 <p style={{fontSize:11,color:'#7a8da5'}}>SHA256 del archivo fuente: <code style={{overflowWrap:'anywhere'}}>{p.hash}</code> · Consulta: {p.fechaConsulta.slice(0,10)}</p>
 <a className="ot-btn ot-export" href="https://www.policia.gov.co/index.php/estadistica-delictiva" target="_blank" rel="noopener noreferrer">Fuente Policía Nacional <ExternalLink size={15}/></a>
 </section>
 </div></main>;
}
