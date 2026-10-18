type Quarter={anno:number;trimestre:number;accesos:number};
export function connectivityStory(records:{anno:string;trimestre:string;accesos:string}[]):{points:Quarter[];latest:Quarter;previous:Quarter|undefined;quarter:number;change:number|null};
type EnergyRate={nombre:string;numerador:number;denominador:number;valor:number};
export function energyStory(data:{municipios:{cod_mpio:string;municipio:string;vcstotal:number;vttotal:number}[];agregados:{nombre:string;numerador:number;denominador:number}[]}):{rows:EnergyRate[];gap:number};
type Investment={id:string;nombre:string;dependencia:string;grupo:string;valor:number;pagina:number};
export function investmentStory<T extends Investment>(records:T[]):{total:number;rows:(T&{share:number})[]};
