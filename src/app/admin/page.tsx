'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Database,FileUp,LockKeyhole,LogOut,ShieldCheck,UploadCloud} from 'lucide-react';
const BASE='https://dvdpgllezrmttrknbcjq.supabase.co/functions/v1/observatorio-admin';
type Config={supabase_url:string;anon_key:string};
type Indicator={id:string;nombre:string;tema:string;grupo:string;unidad:string|null};
type ImportRow={indicador_id:string;anio:number;valor:number;unidad:string;nota?:string};
function decodeCsv(text:string):string[][]{
 let cells:string[]=[],rows:string[][]=[],buf='',quoted=false;
 const sep=(text.split('\n')[0].match(/;/g)||[]).length>(text.split('\n')[0].match(/,/g)||[]).length?';':',';
 for(let i=0;i<text.length;i++){const c=text[i];
  if(c==='"'&&quoted&&text[i+1]==='"'){buf+='"';i++;continue;}
  if(c==='"'){quoted=!quoted;continue;}
  if(!quoted&&(c===sep||c==='\n'||c==='\r')){
   if(c==='\r'&&text[i+1]==='\n')i++;
   cells.push(buf.trim());buf='';
   if(c!==sep){if(cells.some(x=>x.length))rows.push(cells);cells=[];}
  }else buf+=c;
 }
 cells.push(buf.trim());if(cells.some(x=>x.length))rows.push(cells);
 return rows;
}
function validateRows(input:unknown):ImportRow[]{
 if(!Array.isArray(input))throw new Error('El archivo debe contener una tabla de filas.');
 const result=input.map((r,index)=>{
  if(!r||typeof r!=='object')throw new Error('Fila '+(index+1)+' incompatible');
  const obj=r as Record<string,unknown>;
  const codigo=String(obj.indicador_id||obj.codigo||obj.indicador||'').trim();
  const anio=Number(obj.anio||obj.año);
  const value=String(obj.valor??'').trim().replace(/\s/g,'').replace(',', '.');
  const valor=Number(value),unidad=String(obj.unidad||'').trim();
  if(!codigo||!Number.isInteger(anio)||anio<1990||anio>2050||!Number.isFinite(valor)||!unidad)throw new Error('Faltan código, año, valor numérico o unidad en fila '+(index+1));
  return {indicador_id:codigo,anio,valor,unidad,nota:String(obj.nota||'').slice(0,240)};
 });
 if(result.length>200)throw new Error('Máximo 200 filas por lote para proteger el servicio.');
 return result;
}
export default function AdminPage(){
 const [config,setConfig]=useState<Config|null>(null),[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [access,setAccess]=useState(''),[indicadores,setIndicadores]=useState<Indicator[]>([]);
 const [file,setFile]=useState(''),[preview,setPreview]=useState<ImportRow[]>([]),[notice,setNotice]=useState('');
 const [working,setWorking]=useState(false);
 useEffect(()=>{fetch(BASE+'?config=1').then(r=>r.ok?r.json():Promise.reject()).then(setConfig).catch(()=>setNotice('No se pudo inicializar la conexión de autenticación.'));},[]);
 const known=useMemo(()=>new Set(indicadores.map(i=>i.id)),[indicadores]);
 async function loadCatalog(token:string){
  const r=await fetch(BASE,{headers:{Authorization:'Bearer '+token}});
  if(!r.ok)throw new Error('Este usuario no tiene acceso al Observatorio. Comprueba su rol en Supabase.');
  const data=await r.json();setIndicadores(data.indicadores||[]);
 }
 async function login(ev:React.FormEvent){ev.preventDefault();if(!config)return;setWorking(true);setNotice('');
  try{
   const r=await fetch(config.supabase_url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:config.anon_key,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
   const data=await r.json();if(!r.ok||!data.access_token)throw new Error('Credenciales inválidas o acceso no configurado.');
   await loadCatalog(data.access_token);setAccess(data.access_token);setPassword('');
  }catch(e){setNotice(e instanceof Error?e.message:'No fue posible iniciar sesión');}
  finally{setWorking(false)}
 }
 async function readFile(f:File|null){if(!f)return;setPreview([]);setFile(f.name);setNotice('');
  if(f.size>3_000_000){setNotice('Archivo superior al límite de 3 MB.');return;}
  try{const s=await f.text();const obj=f.name.toLowerCase().endsWith('.json')?JSON.parse(s):(()=>{
   const r=decodeCsv(s);const keys=r.shift()?.map(x=>x.toLowerCase().trim().replace(/^\uFEFF/,''))||[];
   return r.map(row=>Object.fromEntries(keys.map((k,i)=>[k,row[i]??''])));
  })();const valid=validateRows(obj);setPreview(valid);setNotice('Vista previa lista. Comprueba código, unidad y vigencia antes de importar.');}
  catch(e){setNotice(e instanceof Error?e.message:'No se pudo interpretar el archivo.');}
 }
 async function importar(){if(!access||!preview.length)return;setWorking(true);setNotice('');
  try{const r=await fetch(BASE,{method:'POST',headers:{Authorization:'Bearer '+access,'content-type':'application/json'},body:JSON.stringify({op:'import',rows:preview})});
   const j=await r.json();if(!r.ok)throw new Error('No se pudo guardar el lote. Comprueba que los códigos pertenezcan al catálogo.');
   setNotice('Guardadas '+j.insertadas+' observaciones. Duplicadas omitidas: '+j.duplicadas+'. Registro disponible para revisión administrativa.');
   setFile('');setPreview([]);
  }catch(e){setNotice(e instanceof Error?e.message:'Importación interrumpida');}finally{setWorking(false)}
 }
 return <main className="ot-app" style={{display:'block',minHeight:'100vh'}}><div className="ot-main" style={{maxWidth:1050}}>
 <Link href="/" style={{display:'inline-flex',alignItems:'center',gap:8,color:'#166ddb',fontWeight:800,fontSize:12}}><ArrowLeft size={17}/> Volver al Observatorio</Link>
 <div className="ot-heading-strip"><div><span className="ot-small-heading">ÁREA RESTRINGIDA</span><h1 style={{font:'800 32px Manrope,Arial',margin:'8px 0'}}>Gestión de información territorial</h1><p>Importación segura de valores estadísticos agregados · Alcaldía de San Pedro</p></div><ShieldCheck color="#1489c2" size={32}/></div>
 {!access?<section className="ot-panel" style={{maxWidth:520,margin:'40px auto'}}><div className="ot-panel-head"><div><span className="ot-small-heading">ACCESO INSTITUCIONAL</span><h3>Iniciar sesión</h3><p>Solo usuarios autorizados por el Observatorio.</p></div><LockKeyhole size={25} color="#1372d2"/></div><form onSubmit={login} style={{display:'grid',gap:14}}><label>Correo institucional<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:13,marginTop:7,border:'1px solid #e2eaf2',borderRadius:9}}/></label><label>Contraseña<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:13,marginTop:7,border:'1px solid #e2eaf2',borderRadius:9}}/></label><button className="ot-btn ot-export" type="submit" disabled={!config||working}>{working?'Verificando...':'Acceder'}</button></form></section>:
 <><div style={{display:'flex',justifyContent:'flex-end'}}><button className="ot-icon-action" onClick={()=>{setAccess('');setIndicadores([]);setPreview([])}}><LogOut size={16}/> Cerrar sesión</button></div><div className="ot-kpis" style={{gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))'}}><div className="ot-kpi"><div className="ot-kpi-top">Catálogo disponible<Database size={18}/></div><strong>{indicadores.length}</strong><small>Indicadores para relacionar</small></div><div className="ot-kpi"><div className="ot-kpi-top">Filas para importar<FileUp size={18}/></div><strong>{preview.length}</strong><small>Registros preparados</small></div></div>
 <section className="ot-panel"><div className="ot-panel-head"><div><span className="ot-small-heading">CARGA ASISTIDA</span><h3>Subir registros estadísticos</h3><p>El archivo debe contener columnas: indicador_id, anio, valor, unidad, nota (opcional).</p></div><UploadCloud size={28} color="#1673d9"/></div><label style={{display:'block',padding:22,border:'2px dashed #afccea',borderRadius:12,background:'#f7faff',textAlign:'center',cursor:'pointer'}}><UploadCloud size={26} style={{margin:'0 auto 10px'}}/><strong>Selecciona CSV o JSON</strong><small style={{display:'block',marginTop:8}}>Máximo 200 filas por lote y 3 MB. Sin datos personales ni archivos nominativos.</small><input type="file" accept=".csv,.json,text/csv,application/json" onChange={e=>readFile(e.target.files?.[0]||null)} style={{display:'block',margin:'15px auto 0',maxWidth:'100%'}}/></label>
 {preview.length>0&&<><div style={{overflowX:'auto',marginTop:24}}><table style={{minWidth:550,width:'100%',borderCollapse:'collapse',fontSize:11}}><thead><tr>{['Indicador','Año','Valor','Unidad','Catálogo'].map(x=><th key={x} style={{padding:12,textAlign:'left',background:'#eaf3ff'}}>{x}</th>)}</tr></thead><tbody>{preview.slice(0,30).map((r,i)=><tr key={i}><td style={{padding:11}}>{r.indicador_id}</td><td>{r.anio}</td><td>{r.valor}</td><td>{r.unidad}</td><td style={{color:known.has(r.indicador_id)?'#138c76':'#a36a1b'}}>{known.has(r.indicador_id)?'Encontrado':'Código no existente'}</td></tr>)}</tbody></table></div><p style={{fontSize:11,color:'#778da6'}}>Se muestran las primeras 30 filas de {preview.length}.</p><button className="ot-btn ot-export" onClick={importar} disabled={working||preview.some(r=>!known.has(r.indicador_id))}><FileUp size={16}/> {working?'Guardando...':'Confirmar importación'}</button></>}
 </section></>}
 {notice&&<p role="status" style={{background:'#eef6ff',borderRadius:10,padding:14,fontSize:12,color:'#35668c',marginTop:15}}>{notice}</p>}
 <p className="ot-fineprint">Las cargas se conservan internamente con trazabilidad de usuario. No se publican automáticamente en el portal público.</p>
 </div></main>;
}
