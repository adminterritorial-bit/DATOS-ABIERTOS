import type {ComparisonData,Indicator} from './interactiveComparison.mjs';
export interface ComparisonSelection {indicator:Indicator;period:string;territories:string[]}
export interface ComparisonSelectionInput {indicator?:unknown;period?:unknown;territories?:unknown}
export const comparisonPath:'/DATOS-ABIERTOS/territorios/';
export function normalizeComparisonSelection(input:ComparisonSelectionInput,data:ComparisonData):ComparisonSelection;
export function readComparisonQuery(search:string,data:ComparisonData):ComparisonSelection;
export function buildComparisonUrl(baseUrl:string,selection:ComparisonSelectionInput,data:ComparisonData):string;
export function buildSavedComparisonPath(baseUrl:string,selection:ComparisonSelectionInput,data:ComparisonData):string;
