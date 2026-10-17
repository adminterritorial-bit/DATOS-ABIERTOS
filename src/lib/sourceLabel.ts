/** Short readable source name; original URLs remain in data and detail links. */
export function sourceLabel(source:string){
 if(!source.startsWith('https://'))return source;
 try{const host=new URL(source).hostname.replace(/^www\./,'');
  if(host.includes('dane.gov.co'))return 'DANE';
  if(host.includes('superservicios.gov.co'))return 'SSPD · Servicios públicos';
  if(host.includes('upme.gov.co'))return 'UPME · Energía';
  if(host.includes('datos.gov.co'))return 'Datos Abiertos Colombia';
  if(host.includes('concejosanpedrovalle.gov.co'))return 'Concejo Municipal · Fuente documental';
  return host;
 }catch{return source}
}
