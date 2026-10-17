#!/usr/bin/env python3
"""Fetch Police public 2025 data and aggregate only non-identifying municipality statistics.
No raw citizen-level rows are exported. Input source may change schema or access method.
The output is explicitly DRAFT until validated against the producer's metadata.
"""
from __future__ import annotations
import collections, datetime, hashlib, json, os, re, sys, unicodedata, urllib.request
from pathlib import Path
from python_calamine import CalamineWorkbook

URL = "https://www.policia.gov.co/sites/default/files/INFORMACI%C3%93N_DE_DELITOS_A_NIVEL_DE_REGISTRO_A%C3%91O_2025_3.xlsx"
OUT=Path("out"); OUT.mkdir(exist_ok=True,parents=True)

def norm(text):
 s = unicodedata.normalize("NFKD", str(text or ""))
 return re.sub(r"\s+"," ", "".join(c for c in s if not unicodedata.combining(c)).upper()).strip()
def normalize_header(c):
 return re.sub(r"[^A-Z0-9]+","_",norm(c)).strip("_")
def main():
 report={"origen":URL,"territorio":"San Pedro, Valle del Cauca","divipola":"76670",
         "anio_archivo":2025,"estado":"pendiente_de_validacion","fecha_consulta_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
         "unidades":"Registros tabulares reportados: no equivale automáticamente a víctimas ni hechos únicos."}
 path=OUT/"policia2025.xlsx"
 try:
  req=urllib.request.Request(URL,headers={"User-Agent":"Mozilla/5.0 (Observatorio Territorial estadisticas publicas)"})
  with urllib.request.urlopen(req,timeout=90) as response:
   if int(response.headers.get("content-length") or "0")>60_000_000: raise RuntimeError("Archivo supera límite preventivo de 60 MB")
   content=response.read(60_000_001)
  if len(content)>60_000_000: raise RuntimeError("Archivo demasiado grande")
  if not content.startswith(b"PK"): raise RuntimeError("Respuesta no es archivo XLSX")
  report["sha256"]=hashlib.sha256(content).hexdigest();report["bytes"]=len(content)
  path.write_bytes(content)
  book=CalamineWorkbook.from_path(str(path))
  output=[]
  for sheet_name in book.sheet_names:
   sheet=book.get_sheet_by_name(sheet_name)
   rows=sheet.to_python()
   if not rows: continue
   header_idx=-1;headers=[]
   for i,row in enumerate(rows[:18]):
    cols=[normalize_header(x) for x in row]
    if any("MUNICIPIO" in x for x in cols) and any(("DEPARTAMENTO" in x or "DEPTO" in x) for x in cols):
     header_idx=i;headers=cols;break
   if header_idx<0: continue
   mi=next((i for i,x in enumerate(headers) if "MUNICIPIO" in x),None)
   di=next((i for i,x in enumerate(headers) if "DEPARTAMENTO" in x or "DEPTO" in x),None)
   ti=next((i for i,x in enumerate(headers) if any(y in x for y in ["DELITO","CONDUCTA","TIPO_DE_DELITO"])),None)
   if mi is None or di is None or ti is None:continue
   # Export only a whitelist of statistical column names (never personal identifiers).
   report.setdefault("campos_estadisticos_detectados", []).append({
     "hoja": sheet_name,
     "cantidad": [h for h in headers if "CANTIDAD" in h or h in ("NUMERO_CASOS","TOTAL")],
     "tiempo": [h for h in headers if "FECHA" in h or "ANO" in h or "ANIO" in h],
     "unidad": [h for h in headers if "VICTIMA" in h or "HECHO" in h or "REGISTRO" in h],
   })
   qi=next((i for i,h in enumerate(headers) if h in ("CANTIDAD","CANTIDAD_DE_CASOS","CANTIDAD_DELITOS")),None)
   counts=collections.Counter()
   cantidades=collections.Counter()
   filas_con_cantidad=collections.Counter()
   total=0
   for row in rows[header_idx+1:]:
    if len(row)<=max(mi,di,ti):continue
    municipio,dept=norm(row[mi]),norm(row[di])
    if municipio!="SAN PEDRO" or dept not in {"VALLE","VALLE DEL CAUCA"}:continue
    tipo=norm(row[ti]) or "SIN_CLASIFICAR"
    counts[tipo]+=1;total+=1
    if qi is not None and qi<len(row):
     try:
      n=float(str(row[qi]).replace(",","."))
      if not n.is_integer() or n<0: raise ValueError("not a nonnegative integer")
      cantidades[tipo]+=int(n);filas_con_cantidad[tipo]+=1
     except (ValueError,TypeError,OverflowError): pass
   output.append({"hoja":sheet_name,"filas_territoriales":total,
     "columna_cantidad":headers[qi] if qi is not None else None,
     "clasificaciones":[{"tipo":k,"filas":v,"suma_cantidad":cantidades[k] if qi is not None and filas_con_cantidad[k]==v else None,
      "filas_con_cantidad_valida":filas_con_cantidad[k] if qi is not None else None} for k,v in sorted(counts.items())]})
  report["resultados"]=output
  report["total_registros_municipales"]=sum(x["filas_territoriales"] for x in output)
  report["sumas_solo_si_columna_cantidad_valida"]=sum(
   d["suma_cantidad"] for sheet in output for d in sheet["clasificaciones"]
   if d["suma_cantidad"] is not None
  )
  report["estado"]="borrador_extraido_no_homologado"
  if not output:report["estado"]="sin_columna_territorial_confirmada"
  print("Extracción completada. Filas agregadas:",report["total_registros_municipales"],"hojas:",len(output))
 except Exception as exc:
  report["estado"]="error_fuente";report["error"]=str(exc)[:500]
  print("Origen no disponible o esquema incompatible:",str(exc)[:220])
 finally:
  # Deliberately delete original per-record workbook to avoid exposing personal information.
  if path.exists():path.unlink()
  (OUT/"policia_2025_borrador_agregado.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
  print("Estado:",report["estado"])
if __name__=="__main__":main()
