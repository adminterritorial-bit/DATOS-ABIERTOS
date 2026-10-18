import {datumDates} from '@/lib/citizenNavigation.mjs';
import type {DatoExplorador} from '@/lib/territorialDataset';
import './citizen-discovery.css';
/** Observation period is distinct from publication and actual source retrieval. */
export default function DataProvenance({datum}:{datum:DatoExplorador}){
 const dates=datumDates(datum);
 return <section className="data-provenance" aria-label="Vigencia y fechas de la fuente"><h3>¿De cuándo es este dato?</h3><dl><div><dt>Periodo representado</dt><dd>{dates.period}</dd></div><div><dt>Publicación de la fuente</dt><dd>{dates.published||'Fecha no informada en este registro'}</dd></div><div><dt>Consulta documentada de la fuente</dt><dd>{dates.consulted||'Fecha no documentada en este registro'}</dd></div></dl><p>El periodo es la referencia indicada por la fuente: puede corresponder a una medición, un corte acumulado o una proyección. Consulte la naturaleza y la nota del dato. Recuperar la fuente en otra fecha no actualiza la cifra.</p></section>;
}
