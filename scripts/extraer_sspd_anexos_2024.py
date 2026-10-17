#!/usr/bin/env python3
"""Lee anexos SSPD 2024 sin publicar hojas Excel ni confundir homónimos."""
import datetime,json,pathlib,urllib.request,hashlib,unicodedata
from python_calamine import CalamineWorkbook
CODE='76670'
OUT=pathlib.Path('out/sspd_76670');OUT.mkdir(parents=True,exist_ok=True)
FILES={
 'COBERTURA_ACUEDUCTO_ALCANTARILLADO_2024':'https://www.superservicios.gov.co/sites/default/files/2025-12/Anexo-1-Base-de-informacion-2024.xlsx',
 'DISPOSICION_RESIDUOS_2024':'https://www.superservicios.gov.co/sites/default/files/2025-12/Base-de-datos-informe-nacional-de-disposicion-final-2024.xlsx',
 'APROVECHAMIENTO_RESIDUOS_2024':'https://www.superservicios.gov.co/sites/default/files/2025-12/Base-informe-sectorial-de-aprovechamiento-2024.xlsx'
}
def norm(x):
 s=unicodedata.normalize('NFKD',str(x or ''))
 return ''.join(c for c in s if not unicodedata.combining(c)).upper().strip()
def request(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (observatorio publico san pedro valle)'})
 with urllib.request.urlopen(req,timeout=105) as r:data=r.read(85000001)
 if len(data)>85000000 or not data.startswith(b'PK'):raise ValueError('No es xlsx validado menor de 85MB')
 return data
report={'municipio':'San Pedro','divipola':CODE,'fecha_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fuentes':{}}
for name,url in FILES.items():
 src=report['fuentes'][name]={'url':url,'estado':'consultando'}
 try:
  data=request(url)
  filename=OUT/(name+'.xlsx');filename.write_bytes(data)
  src['sha256']=hashlib.sha256(data).hexdigest()
  src['bytes']=len(data)
  wb=CalamineWorkbook.from_path(str(filename))
  src['hojas']=[]
  for sheet in wb.sheet_names:
   rows=wb.get_sheet_by_name(sheet).to_python()
   matches=[]
   for ix,row in enumerate(rows):
    values=[norm(v) for v in row]
    if CODE in values or 'SAN PEDRO' in values:
     has_valle=any('VALLE DEL CAUCA' in v or v=='VALLE' for v in values)
     matched_code=CODE in values
     context=[{'fila':k+1,'celdas':[{'col':j+1,'valor':str(v)[:145]} for j,v in enumerate(rows[k]) if v is not None]} for k in range(max(0,ix-1),min(len(rows),ix+2))]
     matches.append({'fila':ix+1,'municipio_confirmado':has_valle or matched_code,'codigo_presente':matched_code,'contexto':context})
    if len(matches)>=400:break
   src['hojas'].append({'hoja':sheet,'filas':len(rows),'encabezados':[{'fila':i+1,'celdas':[str(x)[:100] for x in rows[i][:24]]} for i in range(min(7,len(rows)))], 'coincidencias':matches})
   print('SSPD_HOJA',name,sheet,'FILAS',len(rows),'COINCIDENCIAS',len(matches),'CONFIRMADAS',sum(x['municipio_confirmado'] for x in matches))
   for m in matches[:5]:
    print('SSPD_COINCIDENCIA_'+name+'='+json.dumps(m,ensure_ascii=False)[:3300])
  src['estado']='extraido'
 except Exception as e:
  src.update(estado='error_consulta',incidencia=str(e)[:450])
  print('SSPD_ERROR',name,str(e)[:400])
(OUT/'extracto_76670.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('SSPD_FIN',json.dumps({k:{'estado':v['estado'],'bytes':v.get('bytes'),'hojas':[(h['hoja'],len(h['coincidencias'])) for h in v.get('hojas',[])]} for k,v in report['fuentes'].items()},ensure_ascii=False))
