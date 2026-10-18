export type ShellSection={id:string;href:string;title:string;group:string};
export const shellSections:ShellSection[];
export function normalizeAppPath(value:string):string;
export function sectionForPath(value:string):ShellSection;
