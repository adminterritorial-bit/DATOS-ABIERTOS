export type Indicator='energia'|'internet';
export interface Observation {code:string;indicator:Indicator;period:string;value:number;numerator:number;denominator:number|null}
export interface ComparisonData {territories:{code:string;name:string}[];observations:Observation[]}
export interface ComparisonRow extends Observation {name:string;gap:number;gapUnit:'pp'|'accesos';relative:number|null}
interface EnergyData {anio:number;municipios:{cod_mpio:string;municipio:string;vcstotal:number;vttotal:number}[];agregados:{codigo:string;numerador:number;denominador:number}[]}
interface InternetData {municipal:InternetRecord[];departamental:InternetRecord[];nacional:InternetRecord[];comparables:{cod_municipio:string;accesos:string}[]}
interface InternetRecord {anno:string;trimestre:string;accesos:string}
export function createComparisonData(energy:EnergyData,internet:InternetData):ComparisonData;
export function commonPeriods(data:ComparisonData,indicator:string,codes:string[]):string[];
export function relativeChange(value:number,base:number):number|null;
export function compareTerritories(data:ComparisonData,indicator:string,period:string,codes:string[]):ComparisonRow[];
