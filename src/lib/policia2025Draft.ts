/** Conteo preliminar del archivo público delictivo 2025 de la Policía Nacional.
 * 209 FILAS NO equivalen automáticamente a 209 víctimas ni hechos únicos.
 * Archivo validado por SHA-256, filtrado por municipio y departamento.
 * Requiere comprobar campo 'cantidad' y unidad estadística del productor.
 */
export const reportePolicial2025={
 municipio:'San Pedro',departamento:'Valle del Cauca',divipola:'76670',anio:2025,
 fechaConsulta:'2026-10-17T00:24:46Z',
 url:'https://www.policia.gov.co/sites/default/files/INFORMACI%C3%93N_DE_DELITOS_A_NIVEL_DE_REGISTRO_A%C3%91O_2025_3.xlsx',
 hash:'be262d7bff7ae7236dad729379e584d8febbbae1c4127ff4d0382bddbcb71252',
 estado:'BORRADOR_PENDIENTE_HOMOLOGACION',
 unidad:'filas de registro',
 conteos:[{"tipo":"(0101) HOMICIDIO INTENCIONAL","filas":11},{"tipo":"(02011) AGRESION (LESIONES PERSONALES)","filas":25},{"tipo":"(02012) AMENAZA","filas":15},{"tipo":"(02019) OTRAS FORMAS DE AGRESIONES Y AMENAZAS (LESIONES CULPOSAS EN ACCIDENTES DE TRANSITO)","filas":31},{"tipo":"(02051) EXTORSION","filas":8},{"tipo":"(02089) OTROS ACTOS DIRIGIDOS A INDUCIR MIEDO O ANGUSTIA EMOCIONAL (VIOLENCIA INTRAFAMILIAR)","filas":38},{"tipo":"(0301) VIOLACION (DELITOS SEXUALES)","filas":10},{"tipo":"(05010) HURTO A RESIDENCIAS","filas":5},{"tipo":"(050211) HURTO A AUTOMOTORES","filas":4},{"tipo":"(050212) HURTO A MOTOCICLETAS","filas":13},{"tipo":"(05022) HURTO A PERSONAS","filas":33},{"tipo":"(05023) HURTO A COMERCIO","filas":4},{"tipo":"(10321) HOMICIDIO POR TRANSITO VEHICULAR (HOMICIDIOS EN ACCIDENTES DE TRANSITO)","filas":12}]
} as const;
