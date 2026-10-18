import type {DatoExplorador} from './territorialDataset';
import type {IndicadorICET} from './icetCatalog';
export type SearchKind='ruta'|'dato'|'indicador';
export type SearchFilter='todos'|SearchKind;
export interface SearchEntry {id:string;titulo:string;descripcion:string;href:string;clase:SearchKind;anio?:number;codigo?:string;periodo:string;fuente:string;valor?:string;naturaleza?:DatoExplorador['clase'];origen?:DatoExplorador['origen'];precision?:string;calificador?:string}
export function normalizeSearch(value:unknown):string;
export function createSearchEntries(rows:DatoExplorador[],indicators:Pick<IndicadorICET,'codigo'|'nombre'|'area'>[]):SearchEntry[];
export function searchEntries(entries:SearchEntry[],query:string,filter?:SearchFilter,limit?:number):{items:SearchEntry[];total:number;counts:Record<SearchKind,number>};
