export function formatValor(valor: number|null|undefined, decimales?: number): string;
export function variacion(actual: number, anterior: number): { absoluta:number; relativa:number|null }|null;
export function cumplimiento(meta:number, ejecutado:number, sentido?:string): number|null;
export function csvSeguro(v:unknown):string;
