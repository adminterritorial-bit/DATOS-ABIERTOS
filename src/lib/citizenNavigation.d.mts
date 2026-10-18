import type {DatoExplorador,ClaseDato} from './territorialDataset';
export interface HomeQuery {tema:string;macro:string;anio:string;clase:'Todas'|ClaseDato;buscar:string;vista:'historias'|'territorio'|'catalogo'}
export function readHomeQuery(search:string,topics?:string[],macros?:string[]):HomeQuery;
export function homeQueryUrl(state:HomeQuery):string;
export function formatSourceDate(value:unknown):string|null;
export function datumDates(row:Pick<DatoExplorador,'anio'|'nota'|'publicadoEn'|'consultadoEn'>):{period:string;published:string|null;consulted:string|null};
