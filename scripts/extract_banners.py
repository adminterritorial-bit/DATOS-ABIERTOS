#!/usr/bin/env python3
"""Optional one-file GitHub upload workflow for the four user-supplied 1200x300 images.
Does not download imagery from third parties or synthesize new banners.
Only extracts exact whitelisted filenames, avoiding zip traversal.
"""
from pathlib import Path
from zipfile import ZipFile
bundle=Path("Banners_Observatorio_San_Pedro_1200x300.zip")
names=("observatorio","geografia","futuro","creditos")
if not bundle.exists():
 print("BANNERS: image bundle not committed yet; carousel uses its accessible branded fallback")
else:
 with ZipFile(bundle) as archive:
  for name in names:
   source=f"public/banners/{name}.webp"
   metadata=archive.getinfo(source)
   if not 10_000 <= metadata.file_size <= 1_000_000:
    raise ValueError(f"Invalid banner file size: {source}")
   dest=Path(source)
   dest.parent.mkdir(parents=True,exist_ok=True)
   dest.write_bytes(archive.read(source))
   print(f"BANNERS: extracted {source} ({metadata.file_size} bytes)")
