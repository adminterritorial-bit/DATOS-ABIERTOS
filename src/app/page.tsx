'use client';
import TerritorialDashboard from '@/components/TerritorialDashboard';
import {usePublicFeed} from '@/lib/usePublicFeed';
export default function Page(){
 const {feed,error,loading}=usePublicFeed();
 return <TerritorialDashboard feed={feed} error={loading?undefined:error}/>;
}
