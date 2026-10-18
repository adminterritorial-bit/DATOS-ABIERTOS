import data from '@/data/rendicion2025.json';
import type {DatoExplorador} from './territorialDataset';
export const rendicion=data;
export const observacionesRendicion:DatoExplorador[]=data.registros.map(r=>({
 id:r.id,nombre:r.nombre,sector:r.dependencia,valor:r.valor,unidad:r.unidad,anio:r.anio,
 fuente:data.fuente,fuenteUrl:data.url+'#page='+r.pagina,pagina:r.pagina,
 clase:r.metodo.startsWith('Calculado')?'Calculado':r.calificador==='estimación institucional'?'Estimación':'Publicado',
 publicadoEn:'2026-05',origen:'Gestión municipal',precision:r.calificador,nota:[r.calificador!=='exacto'?r.calificador:'',r.nota,'Fuente municipal, vigencia evaluada 2025, informe elaborado en 2026.'].filter(Boolean).join(' · ')
}));
