/** Series y agregados extraídos de los documentos institucionales aportados.
 * Datos públicos agregados, sin información nominativa. El año NO se debe reemplazar
 * por la fecha de subida del archivo. El usuario puede consultar el documento y página.
 * Extraído del Informe de gestión y transición 2020-2023, PDF p. 367 (numeración PDF);
 * RUV, captura "Datos para la paz" corte 30/09/2026; RSH/SISBÉN sin fecha de corte legible.
 */
export interface ValorDocumental {
 id:string; nombre:string; sector:string; valor:number; unidad:string;
 anio:number|null; periodo:string; fuente:string; pagina:number;
 codigoIcet?:string; vinculacion:'directa'|'relacionada'|'adicional';
 nota?:string;
}
const HIST='35040_informe-completo.pdf';
const RUV='reporte victima.pdf';
const RSH='reporte RUI-SISBEN.pdf';
const historicos:ValorDocumental[]=[];
for(const item of [
 {icet:18,nombre:'Tasa de cobertura en educación superior',serie:[25,36.7,41.8,32.8]},
 {icet:21,nombre:'Tasa de cobertura bruta en educación media',serie:[47.8,48.4,52.1,43.8]},
 {icet:22,nombre:'Tasa de cobertura bruta en transición',serie:[39.1,43.7,41.7,39.6]}
]){
 item.serie.forEach((valor,idx)=>historicos.push({
 id:'DOC-EDU-'+item.icet+'-'+(2020+idx),nombre:item.nombre,sector:'Educación',
 valor,unidad:'%',anio:2020+idx,periodo:String(2020+idx),fuente:HIST,pagina:367,
 codigoIcet:'ICET-'+String(item.icet).padStart(2,'0'),vinculacion:'directa'
 }));
}
for(const [year,value] of [[2020,1.6],[2021,4.5],[2022,1.8]]){
 historicos.push({id:'DOC-EDU-REL-'+year,nombre:'Tasa de deserción escolar intra-anual (reporte histórico)',sector:'Educación',valor:value,unidad:'%',anio:year,periodo:String(year),fuente:HIST,pagina:367,vinculacion:'relacionada',nota:'El informe histórico no precisa que sea exclusivamente sector oficial de básica y media. No homologar automáticamente con ICET-23.'});
}
const ruv:ValorDocumental[]=[
 ['ocurrencia','Víctimas por ocurrencia acumuladas',4866],
 ['declaracion','Víctimas por declaración acumuladas',5117],
 ['ubicacion','Víctimas por ubicación acumuladas',3546],
 ['atencion','Víctimas sujetas de atención acumuladas',2971],
 ['eventos','Eventos victimizantes acumulados',5847]
].map(([slug,nombre,valor])=>({id:'DOC-RUV-'+slug,nombre:String(nombre),valor:Number(valor),sector:'Víctimas',unidad:slug==='eventos'?'eventos':'personas',anio:2026,periodo:'Corte 30/09/2026 — acumulado histórico',fuente:RUV,pagina:1,vinculacion:'adicional' as const,nota:'No representa hechos ocurridos únicamente durante 2026 ni completa los indicadores ICET 59, 62 o 63 por sí solo.'}));
const sisben:ValorDocumental[]=[
 ['personas','Personas registradas en SISBÉN',14500,'personas'],
 ['hogares','Hogares registrados en SISBÉN',5380,'hogares'],
 ['viviendas','Viviendas registradas en SISBÉN',5312,'viviendas'],
 ['salud-contributivo','Afiliados al régimen contributivo (RSH)',4370,'personas'],
 ['salud-subsidiado','Afiliados al régimen subsidiado (RSH)',7115,'personas'],
 ['victimas','Víctimas registradas (RSH)',3173,'personas'],
 ['migrantes','Migrantes registrados (RSH)',403,'personas'],
 ['renta-ciudadana','Beneficiarios de Renta Ciudadana',545,'personas'],
 ['renta-joven','Beneficiarios de Renta Joven',145,'personas'],
 ['iva','Beneficiarios devolución IVA',1290,'personas'],
 ['colombia-mayor','Beneficiarios Colombia Mayor',1090,'personas'],
 ['basica','Matrícula básica de primero a quinto',1180,'estudiantes'],
 ['secundaria','Matrícula secundaria sexto a noveno',914,'estudiantes'],
 ['media','Matrícula media décimo a undécimo',391,'estudiantes']
].map(([slug,nombre,valor,unidad])=>({id:'DOC-RSH-'+slug,nombre:String(nombre),valor:Number(valor),unidad:String(unidad),sector:['personas','hogares','viviendas','migrantes'].includes(String(slug))?'Demografía':['basica','secundaria','media'].includes(String(slug))?'Educación':String(slug).startsWith('salud')?'Salud':'Desarrollo social',anio:null,periodo:'El archivo suministrado no especifica fecha de corte',fuente:RSH,pagina:1,vinculacion:'adicional' as const,nota:'Registro Social de Hogares. Son universos distintos y no deben sumarse para construir una población municipal.'}));
export const observacionesDocumentales=[...historicos,...ruv,...sisben];
export const observacionesDocumentalesConAnio=observacionesDocumentales.filter((x):x is ValorDocumental & {anio:number}=>x.anio!==null);
