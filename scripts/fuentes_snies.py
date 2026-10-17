#!/usr/bin/env python3
"""Recupera el perfil municipal SNIES del MEN (código 76670).
Solo registra datos agregados. Conservar el XLSX original y resumen.
"""
from __future__ import annotations
import datetime, hashlib, json, pathlib, urllib.request, re
from python_calamine import CalamineWorkbook
url="https://snies.mineducacion.gov.co/portal/Informes-e-indicadores/Perfiles-municipales-de-Educacion-Superior/articles-418117_recurso_1.xlsx"
out=pathlib.Path("out/snies");out.mkdir(parents=True,exist_ok=True)
meta={"url":url,"divipola":"76670","municipio":"San Pedro","departamento":"Valle del Cauca","fuente":"Ministerio de Educación Nacional / SNIES","consulta_utc":datetime.datetime.now(datetime.timezone.utc).isoformat()}
try:
 req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"})
 with urllib.request.urlopen(req,timeout=100) as res:
  blob=res.read(30_000_001)
 if len(blob)>30_000_000 or not blob[:2]==b"PK":raise RuntimeError("No se descargó un XLSX válido")
 f=out/"snies_perfil_san_pedro_2025.xlsx";f.write_bytes(blob)
 meta.update({"descarga":"correcta","sha256":hashlib.sha256(blob).hexdigest(),"bytes":len(blob)})
 book=CalamineWorkbook.from_path(str(f))
 resumen=[]
 for sheet in book.sheet_names:
  rows=book.get_sheet_by_name(sheet).to_python()
  # No publicar identificadores o celdas desconocidas como registros públicos; archivo preservado para análisis.
  words=[str(cell).strip() for row in rows[:100] for cell in row if cell is not None]
  dates=[w for w in words if re.fullmatch(r"(?:19|20)\d\d",w)]
  resumen.append({"hoja":sheet,"filas":len(rows),"columnas_max":max((len(r) for r in rows),default=0),"anios_detectados":sorted(set(dates)),"primeros_encabezados":[w[:80] for w in words[:22]]})
 meta["hojas"]=resumen
 print("SNIES: descargado",len(blob),"bytes",len(resumen),"hojas")
except Exception as err:
 meta.update({"descarga":"error","incidencia":str(err)[:500]})
 print("SNIES: fallo controlado",str(err)[:250])
(out/"MANIFIESTO.json").write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding="utf-8")
