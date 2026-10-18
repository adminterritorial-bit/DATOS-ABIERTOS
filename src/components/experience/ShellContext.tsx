'use client';
import {createContext,useContext} from 'react';
export const ShellContext=createContext<{openSearch:(query?:string)=>void}>({openSearch:()=>{}});
export const useObservatoryShell=()=>useContext(ShellContext);
