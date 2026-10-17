# Observatorio de Datos Abiertos — San Pedro (Valle del Cauca)

Municipio **DIVIPOLA 76670**. Aplicación institucional para consultar series estadísticas y fuentes oficiales.

## Publicación: GitHub Actions → GitHub Pages

La aplicación funciona como una exportación estática de Next.js en la ruta:

**https://adminterritorial-bit.github.io/DATOS-ABIERTOS/**

La URL estará operativa **solo después** de que GitHub Pages quede habilitado y el flujo `Publish Observatorio to GitHub Pages` termine con éxito. El cambio **no utiliza Vercel**.

El proceso está en `.github/workflows/deploy-github-pages.yml`: instalación, pruebas, integridad estadística, verificación TypeScript, compilación `GITHUB_PAGES=true npm run build`, exportación `out/`, artefacto de Pages y `actions/deploy-pages`. No se requieren tokens de Vercel ni secretos para publicar la web.

**Configuración de una sola vez:** en Settings → Pages del repositorio, seleccionar *Build and deployment → Source: GitHub Actions*. Si GitHub Pages no está habilitado, GitHub rechazará el despliegue hasta activar esa opción.

## Consulta de información

Los componentes del dashboard consultan el endpoint público agregado `https://dvdpgllezrmttrknbcjq.supabase.co/functions/v1/observatorio-public-feed` desde el navegador. Solo se transmiten estadísticas agregadas; el administrador `/admin` usa otra función de Supabase con autenticación y roles. El portal estático no contiene claves de servicio privilegiadas.

Contiene: 66 indicadores del diccionario ICET (7 vinculados a valores con fuente), series DANE, fuentes TerriData, presupuesto inicial 2025, producción agropecuaria histórica, datos de seguridad, biblioteca estadística y CSV/PDF. Las cifras conservan su vigencia original y no se reemplazan los años faltantes.

## Probar el despliegue localmente

```bash
npm install
npm test
npm run lint
GITHUB_PAGES=true npm run build
npm run start
```

Abrir `http://localhost:3000/DATOS-ABIERTOS/`. Los informes PDF se generan en el navegador (pdf-lib). Las antiguas rutas de API de Next.js se eliminaron porque GitHub Pages no dispone de servidor.

## Criterios de integridad

Las cifras de distintas vigencias no deben confundirse. El presupuesto inicial no equivale a ejecución, las tasas no equivalen a conteos, las filas de Policía no equivalen automáticamente a hechos únicos o víctimas, y las cifras públicas recuperadas no acreditan por sí solas cumplimiento histórico de disponibilidad del ICET.

## Pendientes estadísticos

Persisten 59 indicadores ICET sin correspondencia directa documentada, así como la conciliación de la columna `CANTIDAD` de Policía, y la recuperación complementaria de regalías, catastro y fuentes nacionales. La publicación técnica no certifica por sí sola la totalidad del cuestionario DANE.
