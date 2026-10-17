# Banners originales del Observatorio
El Observatorio utiliza **las cuatro imágenes facilitadas por el diseñador/usuario** en un carrusel accesible 4:1, 7,2 segundos por diapositiva, con pausa al pasar el cursor o interactuar y controles de teclado.

Los archivos originales fueron optimizados a **1200 × 300 píxeles** y empaquetados con los nombres exactos:
- `public/banners/observatorio.webp`
- `public/banners/geografia.webp`
- `public/banners/futuro.webp`
- `public/banners/creditos.webp`

## Instalación sin servidores ni bases de datos
Se preparó un solo archivo **Banners_Observatorio_San_Pedro_1200x300.zip**. Cuando se incorpora al **directorio raíz del repositorio** y se confirma el commit, `scripts/extract_banners.py` lo descomprime automáticamente al ejecutar `npm run build` en GitHub Actions. Este paso valida los cuatro archivos admitidos, sus tamaños y sus rutas, e ignora cualquier entrada inesperada del ZIP. No se requieren modificaciones de HTML ni del carrusel.

Sin el ZIP, el frontend muestra una versión degradada de cuatro banners de gradiente, sin imágenes inexistentes ni bloqueos de carga. Esta degradación no debe confundirse con la entrega final de los originales.

La compresión WebP permite carga diferida y un balance razonable entre legibilidad del texto y peso. Las cuatro imágenes conservan sus frases y grafismos originales: no se reinterpretan mediante generación de IA.
