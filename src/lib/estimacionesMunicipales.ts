/** Escenarios numéricos exploratorios: nunca equivalen a registros oficiales municipales. */
import escenarios from '@/data/escenariosComparables76670.json';
import type {ValorDocumental} from './observacionesDocumentales2026';
export const estimacionesMunicipales:ValorDocumental[]=escenarios.estimaciones.map(e=>({
 id:e.id,nombre:e.nombre,sector:'Salud',valor:e.valor,unidad:e.unidad,anio:e.anio,periodo:String(e.anio),
 fuente:e.fuente,pagina:0,codigoIcet:e.icet,vinculacion:'relacionada',
 nota:'ESTIMACIÓN EXPLORATORIA (calidad D, NO es estadística observada de San Pedro). Referencias DIVIPOLA: '+
  e.municipios_referencia.join(', ')+'. Valores de referencia: '+JSON.stringify(e.valores_observados_referencia)+
  '. Pesos de similitud demográfica: '+JSON.stringify(e.pesos)+'. Fórmula: '+e.formula+
  '. Mediana del error fuera de muestra (diferencia en tasas por 100.000): '+e.error_abs_loo_mediano+
  '. Fuente población DANE: '+e.fuente_poblacion+'. '+e.nota
}));
export const modelosRechazados=escenarios.rechazadas;
