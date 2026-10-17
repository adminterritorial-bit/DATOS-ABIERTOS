#!/usr/bin/env python3
"""Pruebas automáticas del catálogo, ejecutadas antes de cada release.
No certifica que las cifras fuente sean exactas; asegura unicidad, cobertura y vigencia.
"""
from pathlib import Path
import json, re
repo=Path(__file__).resolve().parents[1]
i=(repo/"src/lib/icetCatalog.ts").read_text(encoding="utf-8")
t=(repo/"src/lib/terriDataExpanded.ts").read_text(encoding="utf-8")
p=(repo/"src/lib/policia2025Draft.ts").read_text(encoding="utf-8")
a=re.search(r"const base = (\[[\s\S]*?\]) as const;",i)
b=re.search(r"observacionesTerriData:ObservacionTerritorial\[\] = (\[[\s\S]*?\]);",t)
c=re.search(r"conteos:(\[[\s\S]*?\])\s*\} as const;",p)
assert a and b and c, "Uno de los catálogos carece de estructura JSON parseable"
icet=json.loads(a.group(1)); terri=json.loads(b.group(1)); policia=json.loads(c.group(1))
assert len(icet)==66
assert sorted(x["numero"] for x in icet)==list(range(1,67))
assert len({x["numero"] for x in icet})==66
assert len(terri)==65 and len({x["id"] for x in terri})==65
assert all(x["divipola"]=="76670" for x in terri)
assert all(isinstance(x["anio"],int) and x["anio"]>=2000 for x in terri)
assert all(isinstance(x["valor"],(int,float)) for x in terri)
assert len([x for x in terri if x["anio"]==2025])==10
assert len(policia)==13
assert sum(x["filas"] for x in policia)==209
assert all(isinstance(x["filas"],int) and x["filas"]>=0 for x in policia)
print(f"INTEGRIDAD APROBADA: {len(icet)} ICET, {len(terri)} TerriData, {len(policia)} grupos Policía, {sum(x['filas'] for x in policia)} filas.")
