import Link from 'next/link';
import {obtenerFeed,formatear} from '@/lib/publicFeed';
import type {ObservacionPublica} from '@/lib/publicFeed';
import {indicadoresICET} from '@/lib/icetCatalog';
import {ArrowLeft,BookOpen,ExternalLink} from 'lucide-react';
export const dynamic='force-dynamic';
const relaciones=[
 {icet:'ICET-16',source:'DANE-POB-TOTAL',year:2025,explica:'Proyección municipal DANE para la vigencia 2025.'},
 {icet:'ICET-23',source:'TERRI-021',year:2024,explica:'Tasa de deserción intra-anual según ficha TerriData de 2024.'},
 {icet:'ICET-36',source:'TERRI-014',year:2024,explica:'Atención del parto por personal calificado, dato de la ficha TerriData 2024.'}
];
export default async function ICET(){
 let registros:ObservacionPublica[]=[];try{registros=(await obtenerFeed()).registros}catch{registros=[]}
 const available=relaciones.flatMap(p=>{const registro=registros.find(x=>x.codigo===p.source&&x.anio===p.year);
  const meta=indicadoresICET.find(x=>x.codigo===p.icet);return registro&&meta?[{...p,registro,meta}]:[]});
 const areas=[...new Set(indicadoresICET.map(i=>i.area))];
 return <main className="ot-app" style={{display:'block',minHeight:'100vh'}}><div className="ot-main" style={{maxWidth:1180}}>
  <Link href="/" style={{color:'#106ed4',display:'inline-flex',gap:8,alignItems:'center',fontWeight:800,fontSize:12}}><ArrowLeft size={16}/> Volver al Observatorio</Link>
  <div className="ot-heading-strip"><div><span className="ot-small-heading">ESTADÍSTICA MUNICIPAL · DANE</span><h1 style={{font:'800 34px Manrope,Arial',margin:'10px 0'}}>Indicadores de la batería ICET</h1><p>Indicadores con cifras disponibles en las fuentes nacionales recopiladas, conservando la vigencia de cada dato.</p></div><BookOpen size={27} color="#0f78e0"/></div>
  <div className="ot-data-grid">{available.map(({icet,registro,meta,explica})=><article className="ot-data-card" key={icet} style={{minHeight:200}}>
    <span className="ot-small-heading">{icet} · {meta.area}</span><h3 style={{fontSize:13,margin:'14px 0'}}>{meta.nombre}</h3>
    <strong style={{font:'800 27px Manrope,Arial',color:'#176bdd'}}>{formatear(Number(registro.valor),2)} <small style={{fontSize:11}}>{registro.unidad}</small></strong>
    <p style={{fontSize:11,color:'#758aa4',lineHeight:1.7}}>{explica}</p>
    <a href={registro.fuente_url} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:800,color:'#0e69ce',marginTop:'auto'}}>Consultar fuente <ExternalLink size={13}/></a>
   </article>)}</div>
  <section className="ot-panel" style={{marginTop:25}}><span className="ot-small-heading">DICCIONARIO METODOLÓGICO</span><h2 style={{font:'800 21px Manrope',margin:'10px 0'}}>Estructura completa del instrumento</h2><p style={{fontSize:11,color:'#8396ab',lineHeight:1.7}}>Se identificaron 66 indicadores. El diccionario conserva su numeración y responsables propuestos. Una ficha numérica se presenta únicamente cuando existe un valor con período y fuente distinguibles.</p>
   {areas.map(area=><details key={area} style={{borderTop:'1px solid #eaf0f6',padding:'13px 0'}}><summary style={{cursor:'pointer',fontWeight:800,color:'#44617c',fontSize:12}}>{area} · {indicadoresICET.filter(x=>x.area===area).length} indicadores</summary>
    <div style={{padding:'14px 8px',display:'grid',gap:12}}>{indicadoresICET.filter(x=>x.area===area).map(x=><div key={x.codigo} style={{display:'flex',gap:10,fontSize:11,color:'#5d7790',lineHeight:1.6}}><b style={{color:'#0e6bce',minWidth:57}}>{x.codigo}</b><span>{x.nombre}</span></div>)}</div></details>)}
   <p className="ot-fineprint">Este catálogo no responde automáticamente las preguntas de disponibilidad web del DANE. Ese cuestionario debe conservar sus propias evidencias de publicación municipal.</p>
  </section>
 </div></main>
}
