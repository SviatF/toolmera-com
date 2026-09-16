import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Globe2, ShieldCheck, UserRoundCheck, Zap } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolExperience } from '@/components/ToolExperience';
import { CurrencyHubConverter } from '@/components/CurrencyConverter';
import { tools } from '@/data/tools';
import { getLocalizedPilotByToolId, getLocalizedPilotTool, localizedAlternates, localizedPath, localizedPilotTools, pilotLocaleMeta, type PilotLocale } from '@/data/localizedToolPilot';

const copy:Record<PilotLocale,{
  home:string;catalog:string;kicker:string;free:string;private:string;privateNote:string;instant:string;instantNote:string;noSignup:string;noSignupNote:string;why:string;about:string;related:string;relatedNote:string;faq:string;languages:string;english:string;open:string;hubKicker:string;hubTitle:string;hubNote:string;
}>={
  de:{home:'Startseite',catalog:'Deutsch',kicker:'KOSTENLOSES ONLINE-TOOL',free:'Kostenlos nutzbar',private:'Datenschutzorientiert',privateNote:'Browser-first, wenn technisch möglich',instant:'Schneller Workflow',instantNote:'Ohne Einrichtung direkt starten',noSignup:'Keine Anmeldung',noSignupNote:'Tool öffnen und Aufgabe erledigen',why:'VORTEILE',about:'ÜBER DIESES TOOL',related:'Ähnliche Tools',relatedNote:'Weitere deutschsprachige Tools aus dem Pilot.',faq:'Häufige Fragen',languages:'Andere Sprachen',english:'English',open:'Tool öffnen',hubKicker:'TOOLMERA / DEUTSCH',hubTitle:'15 lokalisierte Toolmera-Tools',hubNote:'SEO-Pilot mit ausgewählten Tools statt massenhaft übersetzten Seiten.'},
  hi:{home:'होम',catalog:'हिन्दी',kicker:'मुफ्त ऑनलाइन टूल',free:'मुफ्त उपयोग',private:'Privacy-minded',privateNote:'जहाँ संभव हो browser-first processing',instant:'तेज़ workflow',instantNote:'बिना setup तुरंत इस्तेमाल करें',noSignup:'Sign-up नहीं',noSignupNote:'Tool खोलें और काम पूरा करें',why:'मुख्य फायदे',about:'इस टूल के बारे में',related:'संबंधित टूल्स',relatedNote:'Hindi localization pilot के अन्य उपयोगी tools.',faq:'सामान्य सवाल',languages:'अन्य भाषाएँ',english:'English',open:'टूल खोलें',hubKicker:'TOOLMERA / हिन्दी',hubTitle:'15 लोकलाइज़्ड Toolmera टूल्स',hubNote:'Mass translation के बजाय चुने हुए high-intent tools का SEO pilot.'},
  ru:{home:'Главная',catalog:'Русский',kicker:'БЕСПЛАТНЫЙ ОНЛАЙН-ИНСТРУМЕНТ',free:'Бесплатно',private:'Приватный подход',privateNote:'Обработка в браузере, где это возможно',instant:'Быстрый результат',instantNote:'Без настройки и регистрации',noSignup:'Без аккаунта',noSignupNote:'Откройте инструмент и выполните задачу',why:'ПРЕИМУЩЕСТВА',about:'ОБ ИНСТРУМЕНТЕ',related:'Похожие инструменты',relatedNote:'Другие русскоязычные инструменты пилотного кластера.',faq:'Частые вопросы',languages:'Другие языки',english:'English',open:'Открыть',hubKicker:'TOOLMERA / РУССКИЙ',hubTitle:'15 локализованных инструментов Toolmera',hubNote:'SEO-пилот на выбранных high-intent инструментах без массовой генерации страниц.'},
};

export function localizedToolMetadata(locale:PilotLocale,slug:string):Metadata{
  const item=getLocalizedPilotTool(locale,slug);if(!item)return{};
  const meta=pilotLocaleMeta[locale];
  const canonical=`https://toolmera.com/${locale}/${item.slug}/`;
  return{
    title:item.title,
    description:item.description,
    alternates:{canonical,languages:localizedAlternates(item.toolId,item.englishUrl)},
    openGraph:{title:item.title,description:item.description,url:canonical,siteName:'Toolmera',type:'website',locale:meta.ogLocale},
    twitter:{card:'summary',title:item.title,description:item.description},
    other:{'content-language':meta.lang},
  };
}

export function localizedHubMetadata(locale:PilotLocale):Metadata{
  const meta=pilotLocaleMeta[locale];const canonical=`https://toolmera.com/${locale}/`;
  return{
    title:meta.hubTitle,
    description:meta.hubDescription,
    alternates:{canonical,languages:{en:'https://toolmera.com/tools/',de:'https://toolmera.com/de/',hi:'https://toolmera.com/hi/',ru:'https://toolmera.com/ru/','x-default':'https://toolmera.com/tools/'}},
    openGraph:{title:meta.hubTitle,description:meta.hubDescription,url:canonical,siteName:'Toolmera',type:'website',locale:meta.ogLocale},
    twitter:{card:'summary',title:meta.hubTitle,description:meta.hubDescription},
    other:{'content-language':meta.lang},
  };
}

function LanguageLinks({locale,toolId,englishUrl}:{locale:PilotLocale;toolId:string;englishUrl:string}){
  const c=copy[locale];
  const options:[string,string][]=[[c.english,englishUrl],...(['de','hi','ru'] as PilotLocale[]).map(code=>[pilotLocaleMeta[code].nativeLabel,localizedPath(code,toolId)||englishUrl] as [string,string])];
  return <section className="shell workflowLinks" aria-label={c.languages}>
    <span className="sectionKicker">{c.languages}</span>
    <div>{options.map(([label,href])=><Link href={href} key={label} aria-current={href===localizedPath(locale,toolId)?'page':undefined}>{label}<ArrowRight size={14}/></Link>)}</div>
  </section>;
}

function relatedFor(locale:PilotLocale,toolId:string){
  const current=tools.find(t=>t.id===toolId);
  const list=localizedPilotTools[locale].filter(item=>item.toolId!==toolId);
  if(!current)return list.slice(0,4);
  const same=list.filter(item=>tools.find(t=>t.id===item.toolId)?.category===current.category);
  const rest=list.filter(item=>!same.includes(item));
  return [...same,...rest].slice(0,4);
}

export function LocalizedPilotToolPage({locale,slug}:{locale:PilotLocale;slug:string}){
  const item=getLocalizedPilotTool(locale,slug);if(!item)return null;
  const meta=pilotLocaleMeta[locale];const c=copy[locale];
  const tool=item.toolId==='currency'?null:tools.find(t=>t.id===item.toolId&&!t.country);
  if(item.toolId!=='currency'&&!tool)return null;
  const canonical=`https://toolmera.com/${locale}/${item.slug}/`;
  const related=relatedFor(locale,item.toolId);
  const schemas:Record<string,unknown>[]=[
    {"@context":"https://schema.org","@type":"WebApplication",name:item.name,applicationCategory:"UtilitiesApplication",operatingSystem:"Any",url:canonical,description:item.description,inLanguage:meta.lang,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}},
    {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:c.home,item:'https://toolmera.com/'},{"@type":"ListItem",position:2,name:meta.nativeLabel,item:`https://toolmera.com/${locale}/`},{"@type":"ListItem",position:3,name:item.name,item:canonical}]},
    {"@context":"https://schema.org","@type":"FAQPage",inLanguage:meta.lang,mainEntity:item.faq.map(f=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))},
  ];
  return <><Header/><main className="subPage" lang={meta.lang}>
    <section className="shell toolHero compactToolHero">
      <div className="breadcrumbs"><Link href="/">{c.home}</Link><ChevronRight/><Link href={`/${locale}/`}>{meta.nativeLabel}</Link><ChevronRight/><span>{item.name}</span></div>
      <span className="eyebrow neonText">{c.kicker}</span>
      <h1>{item.name}</h1>
      <p>{item.intro}</p>
    </section>

    <LanguageLinks locale={locale} toolId={item.toolId} englishUrl={item.englishUrl}/>

    <div className="shell">{item.toolId==='currency'?<CurrencyHubConverter/>:<ToolExperience tool={tool!}/>}</div>

    <section className="shell toolTrustRow">
      <div><ShieldCheck/><span><strong>{c.private}</strong><small>{c.privateNote}</small></span></div>
      <div><Zap/><span><strong>{c.instant}</strong><small>{c.instantNote}</small></span></div>
      <div><UserRoundCheck/><span><strong>{c.noSignup}</strong><small>{c.noSignupNote}</small></span></div>
    </section>

    <section className="shell toolContent">
      <div><span className="sectionKicker">{c.why}</span><h2>{item.name}</h2><ul>{item.benefits.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div><span className="sectionKicker">{c.about}</span><h2>{item.title}</h2><p>{item.description}</p></div>
    </section>

    <section className="shell section">
      <div className="sectionHead"><div><span className="sectionKicker">{c.related}</span><h2>{c.related}</h2><p>{c.relatedNote}</p></div></div>
      <div className="categoryGrid">{related.map(next=><Link className="categoryCard accent-blue" href={`/${locale}/${next.slug}/`} key={next.toolId}><span className="categoryIcon"><Globe2 size={24}/></span><div><h3>{next.name}</h3><p>{next.intro}</p></div><span>{c.open} <ArrowRight size={14}/></span></Link>)}</div>
    </section>

    <section className="shell faqSection"><span className="sectionKicker">FAQ</span><h2>{c.faq}</h2>{item.faq.map(f=><details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
    {schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}
  </main><Footer/></>;
}

export function LocalizedPilotHub({locale}:{locale:PilotLocale}){
  const meta=pilotLocaleMeta[locale];const c=copy[locale];const items=localizedPilotTools[locale];
  const schemas=[
    {"@context":"https://schema.org","@type":"CollectionPage",name:meta.hubTitle,url:`https://toolmera.com/${locale}/`,description:meta.hubDescription,inLanguage:meta.lang},
    {"@context":"https://schema.org","@type":"ItemList",numberOfItems:items.length,itemListElement:items.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.name,url:`https://toolmera.com/${locale}/${item.slug}/`}))},
  ];
  return <><Header/><main className="subPage" lang={meta.lang}>
    <section className="shell categoryHero compactHero">
      <div className="breadcrumbs"><Link href="/">{c.home}</Link><ChevronRight/><span>{meta.nativeLabel}</span></div>
      <span className="eyebrow neonText">{c.hubKicker}</span><h1>{meta.hubTitle}</h1><p>{meta.hubIntro}</p>
      <div className="categoryMeta"><span>{items.length} tools</span><span>{c.free}</span><span>{c.noSignup}</span></div>
    </section>
    <section className="shell section">
      <div className="sectionHead"><div><span className="sectionKicker">{c.hubTitle}</span><h2>{c.hubTitle}</h2><p>{c.hubNote}</p></div></div>
      <div className="categoryGrid">{items.map(item=><Link className="categoryCard accent-blue" href={`/${locale}/${item.slug}/`} key={item.toolId}><span className="categoryIcon"><Globe2 size={24}/></span><div><h3>{item.name}</h3><p>{item.intro}</p></div><span>{c.open} <ArrowRight size={14}/></span></Link>)}</div>
    </section>
    <section className="shell workflowLinks"><span className="sectionKicker">{c.languages}</span><div><Link href="/tools/">English<ArrowRight size={14}/></Link>{(['de','hi','ru'] as PilotLocale[]).filter(code=>code!==locale).map(code=><Link href={`/${code}/`} key={code}>{pilotLocaleMeta[code].nativeLabel}<ArrowRight size={14}/></Link>)}</div></section>
    {schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>)}
  </main><Footer/></>;
}
