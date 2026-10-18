import data from '@/data/conectividadV6.json';
import type {DatoExplorador} from './territorialDataset';
const last=new Map<string,typeof data.municipal[number]>();
for(const r of data.municipal){const old=last.get(r.anno);if(!old||Number(r.trimestre)>Number(old.trimestre))last.set(r.anno,r)}
export const observacionesConectividad:DatoExplorador[]=[...last.values()].map(r=>({
 id:'MINTIC-FIJO-'+r.anno,nombre:'Accesos a internet fijo, último trimestre disponible del año',sector:'Gobierno y conectividad',
 valor:Number(r.accesos),unidad:'accesos',anio:Number(r.anno),fuente:'MinTIC · Colombia TIC · n48w-gutb',fuenteUrl:'https://www.datos.gov.co/d/n48w-gutb',
 consultadoEn:data.consulta,clase:'Calculado',origen:'Estadística oficial',nota:'San Pedro 76670 · trimestre '+r.trimestre+'. '+data.metodo
}));
