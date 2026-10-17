# Observatorio Territorial de San Pedro, Valle del Cauca

Municipio DIVIPOLA 76670. Repositorio institucional adminterritorial-bit/DATOS-ABIERTOS.

## Implementado
- Next.js + TypeScript con filtros, gráficas, fichas de procedencia y CSV.
- /icet: catálogo completo de 66 indicadores ICET con campos y responsables propuestos.
- /catalogo: 65 observaciones TerriData con año, unidad, página del archivo fuente y estado pendiente de cotejo.
- GitHub Actions: pruebas de calidad y preparación de despliegue al proyecto Vercel existente.
- Ingesta pública de estadísticas policiales de 2025 a agregados por municipio, sujeta a descarga, esquema del archivo y revisión.

## Integridad estadística
No imputar datos faltantes como cero. Separar metas de ejecutados, tasas de conteos, vigencias de fechas de publicación, municipio de departamento, y registros RUV acumulados de hechos de 2025. No presentar indicadores ICET como respondidos por el hecho de existir fuente externa.

## Cómo probar
npm install
npm test
npm run lint
npm run build
npm run dev

## Despliegue
El workflow de despliegue necesita el secreto VERCEL_TOKEN autorizado para el equipo adminterritorial-3830s-projects y enlaza únicamente el proyecto indicadores-san-pedro.

## Base de datos
GENERAL PARA DATOS ya está activo, pero contiene tablas de otras aplicaciones de la Alcaldía. La persistencia del observatorio debe crearse bajo un esquema aislado y con RLS; no hacer cambios destructivos.

## Pendientes
Extracción y validación completa de todos los anexos y archivos públicos, integración con Supabase, administración, automatizaciones, informes profesionales, pruebas E2E y despliegue verificado. El proyecto no está terminado.
