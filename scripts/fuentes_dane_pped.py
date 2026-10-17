#!/usr/bin/env python3
"""Descarga y extrae filas del DANE para DIVIPOLA 76670 sin imputaciones.
Origen: Series municipales publicadas el 08/08/2025, versión VP 2018–2042.
"""
from __future__ import annotations
import datetime,hashlib,json,pathlib,urllib.request,re
from python_calamine import CalamineWorkbook
out=pathlib.Path("out/dane");out.mkdir(parents=True,exist_ok=True)
base="https://www.dane.gov.co/files/censo2018/proyecciones-de-poblacion/Municipal/"
sources=[
 ("PPED-AreaMun-2018-2042_VP.xlsx","poblacion_por_area"),
 ("PPED-AreaSexoEdadMun-2018-2042_VP.xlsx","poblacion_por_area_sexo_edad")
]
report=[]
for name,label in sources:
 url=base+name;meta={"fuente":"DANE / Proyecciones municipales","serie":label,"url":url,"corte_descarga_utc":datetime.datetime.now(datetime.timezone.utc).isoformat()}
 try:
  req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (estadistica institucional)"})
  with urllib.request.urlopen(req,timeout=180) as response:
   blob=response.read(100_000_001)
  if len(blob)>100_000_000 or not blob.startswith(b"PK"):raise ValueError("No se recibió XLSX menor de 100 MB")
  p=out/name;p.write_bytes(blob)
  meta.update({"estado":"descargado","sha256":hashlib.sha256(blob).hexdigest(),"bytes":len(blob)})
  book=CalamineWorkbook.from_path(str(p))
  found=[]
  for sheet in book.sheet_names:
   rows=book.get_sheet_by_name(sheet).to_python()
   matches=[]
   for ix,row in enumerate(rows):
    cols=[str(v or "").strip() for v in row]
    if any(x in ("76670","76670.0") or re.fullmatch(r"SAN\s*PEDRO",x,re.IGNORECASE) for x in cols):
     # keep near heading and municipality rows (no personal records in municipal PPED)
     nearby=[{"nro":j+1,"columnas":[{"col":k+1,"v":str(v)[:150]} for k,v in enumerate(rows[j]) if v is not None]} for j in sorted(set([max(0,ix-2),max(0,ix-1),ix]))]
     matches.append({"fila":ix+1,"filas_contexto":nearby,"columnas_no_vacias":[{"col":k+1,"valor":str(v)[:150]} for k,v in enumerate(row) if v is not None]})
    if len(matches)>=3000:break
   found.append({"hoja":sheet,"filas":len(rows),"encabezados":[{"fila":z+1,"valores":[str(v)[:100] for v in rows[z][:18]]} for z in range(min(6,len(rows)))],
     "coincidencias_san_pedro":matches})
  meta["hojas"]=found
  meta["coincidencias"]=sum(len(s["coincidencias_san_pedro"]) for s in found)
  print("DANE",label,"descargado",len(blob),"coincidencias",meta["coincidencias"])
 except Exception as err:
  meta.update({"estado":"error","incidencia":str(err)[:500]})
  print("DANE",label,"error",str(err)[:200])
 report.append(meta)
(out/"DANE_76670_extraccion_bruta.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
