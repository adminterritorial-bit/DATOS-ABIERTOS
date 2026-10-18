const number=(value,digits=1)=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:digits}).format(value);
export function formatReportValue(record,compact=false){const prefix=record.calificador==='superior a'?'> ':['aproximado','estimación institucional'].includes(record.calificador)?'≈ ':'';return prefix+number(compact&&record.unidad==='COP'?record.valor/1e6:record.valor,compact?1:2);}
export function budgetComposition(records,department='Todas',query=''){
 const base=records.find(r=>r.id==='RC25-BASE')?.valor||0;
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const segments=records.filter(r=>r.grupo==='dependencias'&&r.unidad==='COP'&&r.anio===2025&&Number.isFinite(r.valor)&&r.valor>=0&&(department==='Todas'||r.dependencia===department)&&(!query||normalize(r.nombre+' '+r.dependencia+' '+r.grupo).includes(normalize(query)))).map(r=>({...r,share:base>0?r.valor/base*100:0}));
 return {base,segments,remainder:Math.max(0,base-segments.reduce((sum,r)=>sum+r.valor,0))};
}
export function revenuePerformance(records){
 const actual=records.find(r=>r.id==='RC25-REC'),target=records.find(r=>r.id==='RC25-META');
 if(!actual||!target||actual.unidad!=='COP'||target.unidad!=='COP'||actual.anio!==target.anio||!Number.isFinite(actual.valor)||!Number.isFinite(target.valor)||target.valor<=0||actual.valor<0)return null;
 const scale=Math.ceil(Math.max(actual.valor,target.valor)/1e9)*1e9;
 return {actual:actual.valor,target:target.valor,percent:actual.valor/target.valor*100,excess:actual.valor-target.valor,scale,actualPosition:actual.valor/scale*100,targetPosition:target.valor/scale*100};
}
export function marginComparison(records){
 const before=records.find(r=>r.id==='RC25-IBR-ANT'),after=records.find(r=>r.id==='RC25-IBR-NUE');
 if(!before||!after||before.anio!==after.anio||before.unidad!=='puntos porcentuales'||after.unidad!==before.unidad||![before.valor,after.valor].every(Number.isFinite))return null;
 return {before:before.valor,after:after.valor,gap:before.valor-after.valor,unit:'puntos porcentuales'};
}
