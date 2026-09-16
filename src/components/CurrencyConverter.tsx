'use client';

import dynamic from 'next/dynamic';
import type { CurrencyPair } from '@/data/currencyPairs';

function LoadingCurrency(){
  return <div className="toolUi"><div className="toolNote"><span>Loading currency converter…</span></div></div>;
}

const HubChunk=dynamic(()=>import('@/components/CurrencyConverterImpl').then(mod=>mod.CurrencyHubConverter),{ssr:false,loading:LoadingCurrency});
const PairChunk=dynamic(()=>import('@/components/CurrencyConverterImpl').then(mod=>mod.CurrencyPairConverter),{ssr:false,loading:LoadingCurrency});

export function CurrencyHubConverter(){
  return <HubChunk/>;
}

export function CurrencyPairConverter({pair,related}:{pair:CurrencyPair;related:CurrencyPair[]}){
  return <PairChunk pair={pair} related={related}/>;
}
