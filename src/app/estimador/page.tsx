'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,BookOpen,Calculator,Check,ClipboardCopy,Database,Info,MapPinned,RotateCcw,ShieldAlert,TrendingUp} from 'lucide-react';
import {indicadoresICET} from '@/lib/icetCatalog';
import {recetasEstimacion,escenarioEstimacion,type Receta} from '@/lib/recetasEstimacion';
import {poblacionDane} from '@/lib/danePopulation';
import escenarios from '@/data/escenariosComparables76670.json';
import './estimador.css';

const n=(x:number,d=2)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:d}).format(x);
const poblacion=poblacionDane.find(p=>p.anio===2026&&p.divipola==='76670')?.total??0;
const visibles=recetasEstimacion.map(r=>({...r,indicador:indicadoresICET.find(x=>x.numero===r.numero)!})).sort((a,b)=>a.numero-b.numero);
const catalogo= new Map(indicadoresICET.map(i=>[i.numero,i]));
const ejemplares=escenarios.estimaciones.filter(e=>e.tipo==='ESTIMACION_EXPLORATORIA_NO_OFICIAL');
function outputUnit(r:Receta){
 if(r.modelo==='proporcion')return '%';
 if(r.modelo==='tasa')return 'por 100.000 habitantes';
 if(r.modelo==='brecha')return 'puntos porcentuales';
 if(r.modelo==='referencia')return 'años (valor de referencia)';
 return r.numero===6?'toneladas estimadas':'unidades estimadas';
}
export default function Estimador(){
 const [selected,setSelected]=useState(1);
 const [numerador,setNumerador]=useState('');
 const [denominador,setDenominador]=useState('');
 const [universo,setUniverso]=useState(String(poblacion));
 const [fuente,setFuente]=useState('');
 const [anio,setAnio]=useState('2024');
 const [observaciones,setObservaciones]=useState('');
 const [comparables,setComparables]=useState('');
 const [copiado,setCopiado]=useState(false);
 const [buscar,setBuscar]=useState('');
 const [mostrarTodos,setMostrarTodos]=useState(false);
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const codigo=Number(params.get('icet'));
  if(recetasEstimacion.some(x=>x.numero===codigo))setSelected(codigo);
 },[]);
 const receta=recetasEstimacion.find(r=>r.numero===selected)!;
 const indicador=catalogo.get(receta.numero)!;
 const n1=numerador.trim()===''?NaN:Number(numerador);
 const n2=denominador.trim()===''?NaN:Number(denominador);
 const n3=universo.trim()===''?NaN:Number(universo);
 const result=escenarioEstimacion(receta,n1,n2,n3);
 const ratio=Number.isFinite(n1)&&Number.isFinite(n2)&&n2>0?n1/n2:null;
 const valid=(result!==null&&Number.isFinite(result))&&
  (receta.modelo!=='proporcion'||result<=100)&&
  (receta.modelo!=='brecha'||(n1<=100&&n2<=100))&&
  (receta.modelo==='referencia'||receta.modelo==='brecha'||receta.modelo==='conteo'||n1<=n2);
 const razonar=receta.modelo==='conteo'?'Se transfiere una razón de un municipio comparable a una población o universo objetivo municipal. Este enfoque requiere semejanza territorial documentada.':
  receta.modelo==='referencia'?'Se presenta el valor de referencia de un municipio o tabla de vida comparable, NO la esperanza de vida calculada de San Pedro.':
  receta.modelo==='brecha'?'Se muestra la magnitud absoluta de la brecha entre dos coberturas. Para analizar dirección, revisar cuál cobertura es mayor.':
  'Se calcula usando numerador y denominador de igual período y definición, con la escala indicada.';
 const resetInputs=()=>{setNumerador('');setDenominador('');setUniverso(String(poblacion));setFuente('');setObservaciones('');setComparables('');};
 const cambiar=(value:number)=>{setSelected(value);resetInputs();};
 const exportar=()=>{
  if(!valid||!result)return;
  const datos={municipio:'San Pedro, Valle del Cauca',divipola:'76670',
   icet:'ICET-'+String(receta.numero).padStart(2,'0'),definicion:indicador.nombre,
   resultado:Number(result.toFixed(4)),unidad:outputUnit(receta),vigencia:Number(anio),
   naturaleza:'ESCENARIO MANUAL NO OFICIAL - NO CERTIFICA MEDICIÓN LOCAL',
   fuente_original:fuente||'No suministrada',municipios_comparables:comparables||'No especificados',
   numerador:n1,denominador:n2,universo_objetivo:receta.modelo==='conteo'?n3:null,
   formula:receta.formula,supuestos:observaciones,creado_en:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(datos,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='escenario-icet-'+String(receta.numero).padStart(2,'0')+'.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2500);
 };
 const list=useMemo(()=>visibles.filter(item=>item.indicador.nombre.toLowerCase().includes(buscar.toLowerCase())||String(item.numero).includes(buscar)),[buscar]);
 return <main className="est-shell">
  <header className="est-topbar"><Link href="/" className="est-brand"><span><Calculator size={21}/></span><strong>OBSERVATORIO <em>· Laboratorio estadístico</em></strong></Link><nav><Link href="/mapa"><MapPinned size={15}/> Geovisor</Link><Link href="/icet/recuperados"><BookOpen size={15}/> 66 indicadores</Link><Link href="/"><ArrowLeft size={15}/> Inicio</Link></nav></header>
  <section className="est-hero"><div className="est-overline">INTELIGENCIA TERRITORIAL · DIVIPOLA 76670</div><h1>Calculadora de líneas base <em>territoriales.</em></h1><p>Los 66 indicadores cuentan con definiciones en el catálogo. Para los indicadores sin observación directa, esta herramienta permite reconstruir escenarios con componentes verificables, sin convertir promedios de otros municipios en hechos atribuidos a San Pedro.</p>
   <div className="est-metrics"><span><b>66</b> definiciones ICET</span><span><b>{recetasEstimacion.length}</b> recetas configurables</span><span><b>{ejemplares.length}</b> modelos regionales calculados</span><span><b>{n(poblacion,0)}</b> población PPED 2026 (referencia)</span></div>
  </section>
  <div className="est-main">
   <aside className="est-left"><div className="est-card"><div className="est-heading"><Database size={17}/><h2>Indicadores por reconstruir</h2></div><label className="est-search">Buscar en el catálogo<input placeholder="Ej. dengue, médicos, 31…" value={buscar} onChange={e=>setBuscar(e.target.value)}/></label><div className="est-recipes">{list.map(r=><button type="button" key={r.numero} className={selected===r.numero?'selected':''} onClick={()=>cambiar(r.numero)}><span>ICET {String(r.numero).padStart(2,'0')}</span><b>{r.indicador.nombre}</b><ArrowRight size={15}/></button>)}</div></div>
    <div className="est-card est-small"><h2><ShieldAlert size={17}/> Criterio de aceptación</h2><p>Solo se calcula cuando hay componentes adecuados. Si se usa un municipio comparable, la salida es una <strong>estimación exploratoria</strong> y debe conservar fuente, municipio y año. Sin componentes ingresados no se inventa un valor.</p></div>
   </aside>
   <div className="est-editor">
    <section className="est-card est-form">
     <div className="est-form-head"><div><span className="est-overline">MODELO PARAMETRIZABLE · ICET {String(receta.numero).padStart(2,'0')}</span><h2>{indicador.nombre}</h2><p>{receta.fuentes}</p></div><span className="est-type">{receta.modelo}</span></div>
     <div className="est-method"><b>Procedimiento matemático</b><p>{receta.formula}</p><small>{razonar}</small></div>
     <div className="est-fields">
      <label>{receta.etiquetaNumerador}<input type="number" min="0" step="any" inputMode="decimal" placeholder="Ingrese componente comprobable" value={numerador} onChange={e=>setNumerador(e.target.value)}/></label>
      <label>{receta.etiquetaDenominador}<input type="number" min="0" step="any" inputMode="decimal" placeholder={receta.modelo==='referencia'?'1':"Ingrese denominador"} value={denominador} onChange={e=>setDenominador(e.target.value)}/></label>
      {receta.modelo==='conteo'&&<label>Universo objetivo estimado de San Pedro<input type="number" min="0" step="any" inputMode="decimal" value={universo} onChange={e=>setUniverso(e.target.value)}/><small>Predeterminado: población DANE 2026 ({n(poblacion,0)}). Cambiar cuando el universo del indicador sean hogares, predios, empresas, etc.</small></label>}
      <label>Año de los datos de entrada<input type="number" min="1900" max="2100" step="1" value={anio} onChange={e=>setAnio(e.target.value)}/></label>
      <label>URL o documento de origen<input type="text" placeholder="Entidad y enlace verificable" value={fuente} onChange={e=>setFuente(e.target.value)}/></label>
      <label>Municipio(s) de referencia, si aplica<input type="text" placeholder="Código DIVIPOLA y localidad" value={comparables} onChange={e=>setComparables(e.target.value)}/></label>
     </div>
     <label className="est-comment">Supuestos y restricciones<textarea rows={3} placeholder="Compatibilidad entre municipios, período, cobertura de la fuente y margen de error…" value={observaciones} onChange={e=>setObservaciones(e.target.value)}/></label>
     <div className="est-actions"><button type="button" className="est-reset" onClick={resetInputs}><RotateCcw size={16}/> Limpiar componentes</button><button type="button" className="est-download" disabled={!valid||!fuente.trim()} onClick={exportar}><Database size={16}/> Exportar escenario JSON</button></div>
    </section>
    <section className="est-card est-result"><span className="est-overline"><TrendingUp size={15}/> RESULTADO DEL ESCENARIO</span>
      {valid?<><div className="est-result-num">{n(result!,4)} <small>{outputUnit(receta)}</small></div><p>Escenario numérico calculado, no una medición oficial de San Pedro. Si los insumos no se refieren a este municipio, son únicamente valores de referencia.</p></>:
      <><h2>Introduce componentes comprobables</h2><p>El sistema mostrará la cifra al disponer de numerador, denominador y, en conteos, universo objetivo. Los datos faltantes no se sustituyen por ceros ni promedios arbitrarios.</p></>}
      <div className="est-disclaimer"><Info size={16}/><span>Para la publicación oficial del ICET, utilizar únicamente valores con definición equivalente y fuente competente. Los escenarios externos sirven como referencia analítica, nunca como resultado certificado.</span></div>
    </section>
   </div>
  </div>
  <section className="est-models"><div className="est-models-head"><div><span className="est-overline">MODELACIÓN TERRITORIAL REPRODUCIBLE</span><h2>Escenarios exploratorios ya calculados</h2><p>INS SIVIGILA 2018 y DANE PPED 2018, con ponderación de siete municipios de referencia y error de validación fuera de muestra.</p></div><Link href="/mapa">Explorar en el geovisor <ArrowRight size={17}/></Link></div>
   <div className="est-model-grid">{ejemplares.map(e=><article className="est-model" key={e.id}><span>ICET {e.icet.split('-')[1]} · {e.anio}</span><h3>{e.nombre}</h3><strong>{n(e.valor)} <small>{e.unidad}</small></strong><p>{e.municipios_referencia.length} municipios de comparación · error mediano LOO {n(e.error_abs_loo_mediano??0)} por 100.000</p><small>Referencia exploratoria · no publicado como incidencia de San Pedro</small></article>)}</div>
  </section>
  <footer className="est-footer">DANE · INS · RUNT · Observatorio municipal de San Pedro. Los escenarios son reproducibles y no reemplazan las series oficiales.</footer>
 </main>;
}