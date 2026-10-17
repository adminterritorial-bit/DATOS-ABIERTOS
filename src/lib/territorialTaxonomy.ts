/**
 * Navegación temática ciudadana (no altera la clasificación del cuestionario DANE).
 * El ICET evalúa capacidad estadística territorial; los 66 reactivos del cuestionario
 * de disponibilidad se agrupan aquí por temas para facilitar exploración pública.
 */
export type MacroDimension='Territorio y ambiente'|'Desarrollo humano'|'Economía e instituciones'|'Seguridad y convivencia';
export type FamiliaVisual='tendencia'|'comparacion'|'porcentaje'|'indicador'|'mapa';
export interface TemaTerritorial {
 id:string; nombre:string; descripcion:string; macro:MacroDimension;
 color:string; icono:string; items:readonly number[]; visual:FamiliaVisual;
 pregunta:string;
}
export const temasTerritoriales:readonly TemaTerritorial[]=[
 {id:'ambiente',nombre:'Ambiente y sostenibilidad',descripcion:'Agua residual, residuos, biodiversidad y riesgo',macro:'Territorio y ambiente',color:'#16a394',icono:'leaf',items:[1,2,3,4,5,6],visual:'porcentaje',pregunta:'¿Cómo cuidamos nuestros recursos?'},
 {id:'suelo',nombre:'Ordenamiento y ruralidad',descripcion:'Suelo rural, formalización y catastro',macro:'Territorio y ambiente',color:'#a47747',icono:'map',items:[7,8,14],visual:'mapa',pregunta:'¿Cómo se organiza el territorio?'},
 {id:'servicios',nombre:'Agua, energía y saneamiento',descripcion:'Servicios públicos esenciales para los hogares',macro:'Territorio y ambiente',color:'#1887bb',icono:'droplets',items:[64,65,66],visual:'porcentaje',pregunta:'¿A qué servicios accede la población?'},
 {id:'poblacion',nombre:'Población y demografía',descripcion:'Habitantes, esperanza de vida y fecundidad',macro:'Desarrollo humano',color:'#7265ce',icono:'users',items:[15,16,43],visual:'tendencia',pregunta:'¿Cómo cambia la población?'},
 {id:'educacion',nombre:'Educación y aprendizaje',descripcion:'Cobertura, permanencia, conectividad y alimentación escolar',macro:'Desarrollo humano',color:'#347cdf',icono:'graduation-cap',items:[17,18,19,20,21,22,23,42],visual:'comparacion',pregunta:'¿Cómo avanza la educación?'},
 {id:'vivienda',nombre:'Vivienda y condiciones de vida',descripcion:'Déficit habitacional y pobreza multidimensional',macro:'Desarrollo humano',color:'#d68b44',icono:'house',items:[24,25,26],visual:'porcentaje',pregunta:'¿Cómo viven los hogares?'},
 {id:'epidemiologia',nombre:'Vigilancia epidemiológica',descripcion:'Enfermedades transmisibles y su prevención',macro:'Desarrollo humano',color:'#bd6d84',icono:'activity',items:[27,28,29,30,37,39,49],visual:'tendencia',pregunta:'¿Qué eventos requieren vigilancia?'},
 {id:'atencion',nombre:'Atención y protección en salud',descripcion:'Atención médica, maternidad, vacunación y afiliación',macro:'Desarrollo humano',color:'#1eaa9e',icono:'heart-pulse',items:[31,32,33,34,35,36,38,40],visual:'porcentaje',pregunta:'¿Cómo acceden las personas a la salud?'},
 {id:'mortalidad',nombre:'Mortalidad y salud de la vida',descripcion:'Salud maternoinfantil y enfermedades crónicas',macro:'Desarrollo humano',color:'#b35a9b',icono:'heart',items:[41,44,45,46,47,48,50,51,52,53],visual:'tendencia',pregunta:'¿Qué nos dicen las causas de mortalidad?'},
 {id:'economia',nombre:'Economía y finanzas públicas',descripcion:'Actividad económica, valor agregado y presupuesto',macro:'Economía e instituciones',color:'#16a0a0',icono:'chart-no-axes-combined',items:[9,10],visual:'comparacion',pregunta:'¿Cómo se mueve la economía local?'},
 {id:'gobierno',nombre:'Gobierno e instituciones',descripcion:'Desempeño institucional y representación femenina',macro:'Economía e instituciones',color:'#5873ab',icono:'landmark',items:[12,13],visual:'porcentaje',pregunta:'¿Cómo funciona el gobierno municipal?'},
 {id:'transporte',nombre:'Movilidad y transporte',descripcion:'Parque automotor, seguridad vial y robo de vehículos',macro:'Seguridad y convivencia',color:'#dd9551',icono:'route',items:[11,54,55],visual:'comparacion',pregunta:'¿Cómo nos movemos de forma segura?'},
 {id:'seguridad',nombre:'Convivencia y seguridad',descripcion:'Violencias, homicidios, feminicidios y victimización',macro:'Seguridad y convivencia',color:'#df6a6d',icono:'shield-check',items:[56,57,58,60,61],visual:'tendencia',pregunta:'¿Cómo evoluciona la seguridad?'},
 {id:'victimas',nombre:'Víctimas y construcción de paz',descripcion:'Registro de víctimas, atención y superación de vulnerabilidad',macro:'Seguridad y convivencia',color:'#8463c4',icono:'hand-heart',items:[59,62,63],visual:'comparacion',pregunta:'¿Cómo se acompaña a las víctimas?'},
] as const;
export const macroDimensiones:readonly MacroDimension[]=['Territorio y ambiente','Desarrollo humano','Economía e instituciones','Seguridad y convivencia'];
export const numeroTema=new Map(temasTerritoriales.flatMap(t=>t.items.map(n=>[n,t] as const)));
/** Uso tipográfico; no atribuir el código del tema a la taxonomía original del DANE. */
export const codigoICET=(n:number)=>'ICET-'+String(n).padStart(2,'0');
export function auditoriaTaxonomia(){
 const ids=temasTerritoriales.flatMap(t=>t.items);
 const sinAsignar=Array.from({length:66},(_,i)=>i+1).filter(n=>!ids.includes(n));
 const repetidos=ids.filter((n,i)=>ids.indexOf(n)!==i);
 const fuera=ids.filter(n=>n<1||n>66||!Number.isInteger(n));
 return {total:ids.length,unicos:new Set(ids).size,sinAsignar,repetidos,fuera,completa:ids.length===66&&!sinAsignar.length&&!repetidos.length&&!fuera.length};
}
