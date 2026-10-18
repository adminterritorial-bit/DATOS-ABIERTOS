/** Build observations only from the dated, locally verified official extracts. */
export function createComparisonData(energy, internet) {
 const territories=[{code:'76670',name:'San Pedro'},{code:'76',name:'Valle del Cauca'},{code:'CO',name:'Colombia'},...energy.municipios.filter(r=>r.cod_mpio!=='76670').map(r=>({code:r.cod_mpio,name:r.municipio}))];
 const observations=[];
 const addEnergy=(code,numerator,denominator)=>{
  if(Number.isFinite(numerator)&&Number.isFinite(denominator)&&denominator>0&&numerator>=0&&numerator<=denominator)
   observations.push({code,indicator:'energia',period:String(energy.anio),value:100*numerator/denominator,numerator,denominator});
 };
 energy.municipios.forEach(r=>addEnergy(r.cod_mpio,r.vcstotal,r.vttotal));
 energy.agregados.forEach(r=>addEnergy(r.codigo,r.numerador,r.denominador));
 const addInternet=(code,period,value)=>{
  if(Number.isFinite(value)&&value>=0)observations.push({code,indicator:'internet',period,value,numerator:value,denominator:null});
 };
 const corePeriods=new Set(internet.municipal.filter(r=>internet.departamental.some(d=>d.anno===r.anno&&d.trimestre===r.trimestre)&&internet.nacional.some(n=>n.anno===r.anno&&n.trimestre===r.trimestre)).map(r=>`${r.anno}-T${r.trimestre}`));
 for(const [code,rows] of [['76670',internet.municipal],['76',internet.departamental],['CO',internet.nacional]])
  rows.forEach(r=>{const period=`${r.anno}-T${r.trimestre}`;if(corePeriods.has(period))addInternet(code,period,Number(r.accesos));});
 // The stored peer extract is explicitly a 2023 T3 snapshot, not a time series.
 internet.comparables.filter(r=>r.cod_municipio!=='76670').forEach(r=>addInternet(r.cod_municipio,'2023-T3',Number(r.accesos)));
 return {territories,observations};
}

export function commonPeriods(data,indicator,codes) {
 if(!codes.length)return [];
 const selected=[...new Set(codes)];
 const periods=selected.map(code=>new Set(data.observations.filter(r=>r.indicator===indicator&&r.code===code).map(r=>r.period)));
 return [...periods[0]].filter(p=>periods.every(set=>set.has(p))).sort();
}

/** Percentage change/difference is undefined for a zero or invalid base. */
export function relativeChange(value,base) {
 return Number.isFinite(value)&&Number.isFinite(base)&&base>0?(value-base)/base*100:null;
}

/** Reject a mismatched selection instead of silently dropping missing territories. */
export function compareTerritories(data,indicator,period,codes) {
 if(!commonPeriods(data,indicator,codes).includes(period))return [];
 const rows=[...new Set(codes)].map(code=>{
  const observation=data.observations.find(r=>r.code===code&&r.indicator===indicator&&r.period===period);
  return {...observation,name:data.territories.find(t=>t.code===code)?.name??code};
 });
 const base=rows[0].value;
 return rows.map(r=>({...r,gap:r.value-base,gapUnit:indicator==='energia'?'pp':'accesos',relative:relativeChange(r.value,base)}));
}
