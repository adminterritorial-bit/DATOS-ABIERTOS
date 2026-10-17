export type Estado = 'VERIFICADO_EN_DOCUMENTO' | 'SUJETO_A_VALIDACION' | 'NO_DISPONIBLE';
export type Registro = {
 id: string; titulo: string; sector: string; valor: number | null; unidad: string;
 anio: number | null; periodo?: string; entidad: string; fuente: string; pagina?: number;
 nivel: 'municipio' | 'departamento'; metodologia?: string;
 estado: Estado; nota?: string; tipo?: 'tasa' | 'conteo' | 'porcentaje' | 'produccion' | 'ejecucion';
};
export const MUNICIPIO = { nombre: 'San Pedro', departamento: 'Valle del Cauca', divipola: '76670' };
