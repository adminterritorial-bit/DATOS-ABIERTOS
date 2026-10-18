export interface ReportRecord {id:string;nombre:string;valor:number;unidad:string;dependencia:string;grupo:string;calificador:string;anio:number;pagina:number;nota:string;metodo:string;origen:string}
export function formatReportValue(record:ReportRecord,compact?:boolean):string;
export function budgetComposition(records:ReportRecord[],department?:string,query?:string):{base:number;segments:(ReportRecord&{share:number})[];remainder:number};
export function revenuePerformance(records:ReportRecord[]):{actual:number;target:number;percent:number;excess:number;scale:number;actualPosition:number;targetPosition:number}|null;
export function marginComparison(records:ReportRecord[]):{before:number;after:number;gap:number;unit:string}|null;
