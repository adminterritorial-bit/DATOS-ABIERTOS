import type {DatoExplorador} from './territorialDataset';
/** Derived municipal statistics only when the exact municipality, year, compatible scope
 * and a genuine numerator/denominator are present. Zero denominators never compute. */
type Rule={id:string;name:string;sector:string;num:RegExp;den:RegExp;unit:string;allowedDenominator:(d:DatoExplorador)=>boolean};
const rules:Rule[]=[
 {id:'DER-PROP-RURAL',name:'Participación de población rural',sector:'Demografía',num:/^poblaci[oó]n rural$/i,den:/^poblaci[oó]n total$/i,unit:'%',allowedDenominator:d=>d.unidad==='personas'},
 {id:'DER-PROP-MUJERES',name:'Participación de mujeres en la población',sector:'Demografía',num:/^poblaci[oó]n total de mujeres$/i,den:/^poblaci[oó]n total$/i,unit:'%',allowedDenominator:d=>d.unidad==='personas'},
 {id:'DER-UPME-HOGARES',name:'Proporción de viviendas conectadas a electricidad',sector:'Servicios públicos',num:/^viviendas conectadas$/i,den:/^viviendas existentes$/i,unit:'%',allowedDenominator:d=>d.unidad==='viviendas'},
 {id:'DER-EDU-INTERNET',name:'Proporción de estudiantes oficiales con conectividad escolar',sector:'Educación',num:/^estudiantes oficiales (con|que tienen) (acceso a )?internet$/i,den:/^matr[ií]cula total oficial$/i,unit:'%',allowedDenominator:d=>/^(estudiantes|alumnos|personas)$/.test(d.unidad.toLowerCase())},
 {id:'DER-EDU-DESERTORES',name:'Deserción respecto a matrícula oficial del mismo año',sector:'Educación',num:/^estudiantes desertores del sector oficial$/i,den:/^matr[ií]cula total oficial$/i,unit:'%',allowedDenominator:d=>/^(estudiantes|alumnos|personas)$/.test(d.unidad.toLowerCase())}
];
const normalized=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
/** Educational gross/net coverage uses official population by educational age, NOT total pupils. */
export function derivarProporciones(rows:DatoExplorador[]):DatoExplorador[]{
 const out:DatoExplorador[]=[];
 for(const rule of rules){
  const numerators=rows.filter(d=>rule.num.test(normalized(d.nombre))&&d.valor>=0&&Number.isFinite(d.valor));
  for(const numerator of numerators){
   const den=rows.find(d=>d.anio===numerator.anio&&rule.den.test(normalized(d.nombre))&&rule.allowedDenominator(d)&&d.valor>0&&Number.isFinite(d.valor)&&d.fuente===numerator.fuente);
   if(!den||numerator.valor>den.valor||numerator.unidad!==den.unidad)continue;
   const value=Math.round(numerator.valor/den.valor*10000)/100;
   if(rows.some(d=>d.nombre===rule.name&&d.anio===numerator.anio))continue;
   out.push({id:rule.id+'-'+numerator.anio,nombre:rule.name,sector:rule.sector,valor:value,unidad:rule.unit,anio:numerator.anio,fuente:numerator.fuente,clase:'Calculado',nota:'Fórmula: 100 × ('+numerator.nombre+' = '+numerator.valor+') / ('+den.nombre+' = '+den.valor+'), misma fuente y vigencia '+numerator.anio+'.'});
  }
 }
 return out;
}
export function seriesComparables(rows:DatoExplorador[]){
 const units=new Map<string,DatoExplorador[]>();
 rows.filter(d=>Number.isFinite(d.valor)).forEach(d=>{const k=normalized(d.unidad).toLowerCase()+'|'+d.anio;units.set(k,[...(units.get(k)||[]),d])});
 return [...units.values()].filter(g=>g.length>=2);
}
