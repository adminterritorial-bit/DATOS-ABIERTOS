import type {Metadata} from 'next';
import './globals.css';
import './dashboard.css';
export const metadata:Metadata={
 title:'Observatorio Territorial | Alcaldía de San Pedro',
 description:'Datos públicos del territorio de San Pedro, Valle del Cauca, con información oficial del DANE, TerriData y fuentes documentadas.',
 robots:{index:true,follow:true}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="es"><body>{children}</body></html>;
}
