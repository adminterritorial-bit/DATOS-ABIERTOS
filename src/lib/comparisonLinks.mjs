import {commonPeriods} from './interactiveComparison.mjs';

const defaultTerritories=['76670','76','CO'];
export const comparisonPath='/DATOS-ABIERTOS/territorios/';

/** Keep reference order, accept only known territories and select an observed common period. */
export function normalizeComparisonSelection(input,data){
 const indicator=input.indicator==='internet'?'internet':'energia';
 const known=new Set(data.territories.map(t=>t.code));
 let territories=Array.isArray(input.territories)?[...new Set(input.territories.filter(code=>typeof code==='string').map(code=>code.trim()).filter(code=>known.has(code)))]:[];
 if(!territories.length)territories=defaultTerritories.filter(code=>known.has(code));
 let periods=commonPeriods(data,indicator,territories);
 if(!periods.length){territories=defaultTerritories.filter(code=>known.has(code));periods=commonPeriods(data,indicator,territories);}
 const period=periods.includes(input.period)?input.period:periods.at(-1)??'';
 return {indicator,period,territories};
}

export function readComparisonQuery(search,data){
 const params=new URLSearchParams(search);
 return normalizeComparisonSelection({indicator:params.get('indicador'),period:params.get('periodo'),territories:(params.get('territorios')??'').split(',')},data);
}

/** Preserve the selected source tab, other query parameters and any section anchor. */
export function buildComparisonUrl(baseUrl,selection,data){
 const normalized=normalizeComparisonSelection(selection,data);
 const url=new URL(baseUrl);
 url.pathname=comparisonPath;
 url.searchParams.set('indicador',normalized.indicator);
 url.searchParams.set('periodo',normalized.period);
 url.searchParams.set('territorios',normalized.territories.join(','));
 return url.toString();
}

/** Saved queries contain only restorable comparison controls and a recognized source tab. */
export function buildSavedComparisonPath(baseUrl,selection,data){
 const url=new URL(buildComparisonUrl(baseUrl,selection,data));
 const params=new URLSearchParams();
 for(const key of ['indicador','periodo','territorios'])params.set(key,url.searchParams.get(key));
 const tab=url.searchParams.get('vista');
 if(['energia','internet','contexto'].includes(tab))params.set('vista',tab);
 return comparisonPath+'?'+params.toString();
}
