import { NextRequest, NextResponse } from 'next/server';
import { registros } from '@/lib/records';
export const dynamic = 'force-static';
export function GET(_request: NextRequest) {
 return NextResponse.json({
  territorio: { divipola: '76670', municipio: 'San Pedro', departamento: 'Valle del Cauca' },
  generado: 'Datos documentados para investigación, no certificación ICET',
  observaciones: registros,
  total: registros.length
 }, { headers: { 'Cache-Control':'public, max-age=300, stale-while-revalidate=600', 'X-Content-Type-Options':'nosniff' } });
}
