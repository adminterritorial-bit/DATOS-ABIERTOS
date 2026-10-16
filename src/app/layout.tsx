import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title: 'Observatorio Territorial | San Pedro, Valle del Cauca',
 description: 'Inteligencia territorial pública con trazabilidad documental, vigencias y control de calidad estadística.',
 robots: { index: false, follow: false }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="es"><body>{children}</body></html>;
}
