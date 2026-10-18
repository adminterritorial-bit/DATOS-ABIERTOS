/** Quarterly access counts are stocks. Compare the same quarter in each year. */
export function connectivityStory(records){
 const ordered=records.map(r=>({anno:Number(r.anno),trimestre:Number(r.trimestre),accesos:Number(r.accesos)})).sort((a,b)=>a.anno-b.anno||a.trimestre-b.trimestre);
 const latest=ordered.at(-1);
 const points=ordered.filter(r=>r.trimestre===latest.trimestre);
 const previous=points.find(r=>r.anno===latest.anno-1);
 return {points,latest,previous,quarter:latest.trimestre,change:previous?.accesos>0?(latest.accesos-previous.accesos)/previous.accesos*100:null};
}
/** Recalculate each rate from its official numerator and denominator. */
export function energyStory(data){
 const local=data.municipios.find(r=>r.cod_mpio==='76670');
 const rows=[{nombre:local.municipio,numerador:local.vcstotal,denominador:local.vttotal},...data.agregados.slice().reverse()].map(r=>({...r,valor:r.numerador/r.denominador*100}));
 return {rows,gap:rows[0].valor-rows.find(r=>r.nombre==='Valle del Cauca').valor};
}
/** Only the eight parent appropriations form the analyzed investment base. */
export function investmentStory(records){
 const departments=records.filter(r=>r.grupo==='dependencias').sort((a,b)=>b.valor-a.valor);
 const total=departments.reduce((sum,r)=>sum+r.valor,0);
 return {total,rows:departments.map(r=>({...r,share:r.valor/total*100}))};
}
