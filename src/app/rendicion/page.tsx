import {Suspense} from 'react';
import RendicionBoard from '@/components/experience/RendicionBoard';
export default function Rendicion(){return <Suspense fallback={<div className="shell-loading" role="status">Abriendo la rendición de cuentas…</div>}><RendicionBoard/></Suspense>}
