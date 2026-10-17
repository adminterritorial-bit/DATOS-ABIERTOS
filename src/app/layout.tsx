import type {Metadata} from 'next';
import './globals.css';
import './dashboard.css';
import './citizen.css';
import './experience.css';
import './geo-v4.css';
import '@arcgis/core/assets/esri/themes/light/main.css';
import GlobalNavigation from '@/components/GlobalNavigation';
export const metadata:Metadata={
 title:'Observatorio Territorial | Alcaldía de San Pedro',
 description:'Datos públicos del territorio de San Pedro, Valle del Cauca, con información oficial del DANE, TerriData y fuentes documentadas.',
 robots:{index:true,follow:true}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="es"><body>{children}<GlobalNavigation/></body></html>;
}
