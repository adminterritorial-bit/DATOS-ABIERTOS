# Integración directa de los cuatro banners facilitados

Los cuatro diseños ya están dentro del proyecto, sin rehacer sus textos ni cambiar su composición visual. El carrusel **TopBannerCarousel** los muestra con proporción 1200 × 300 (4:1).

| Orden | Archivo integrado | Sección |
| --- | --- | --- |
| 1 | `public/banners/observatorio.avif` | Observatorio de Datos |
| 2 | `public/banners/geografia.avif` | San Pedro en el mapa |
| 3 | `public/banners/futuro.avif` | Un nuevo futuro se avecina |
| 4 | `public/banners/creditos.avif` | Autoría y tecnología |

El navegador reproduce una imagen cada 7,2 segundos, admite pausa, navegación manual y atajos accesibles. La relación de aspecto es 4:1 y el diseño se adapta sin distorsiones. Cada diapositiva mantiene un enlace útil.

No se necesita empaquetar ZIP, generar banners ni ejecutar pasos adicionales en GitHub Actions: los archivos están incluidos en el repositorio y forman parte de la exportación estática de Next.js. El fondo de reserva solo se utiliza cuando una imagen real no puede cargarse. Las pruebas visuales comprueban las cuatro imágenes originales.
