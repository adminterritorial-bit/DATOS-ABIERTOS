'use client';
import CitizenSearch from './CitizenSearch';
import {usePublicFeed} from '@/lib/usePublicFeed';
export default function GlobalNavigation(){
 const {feed}=usePublicFeed();
 return <div className="ot-global-placement"><CitizenSearch feed={feed}/></div>;
}
