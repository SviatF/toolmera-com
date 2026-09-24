'use client';

import type { Tool } from '@/data/tools';
import type { LocalizedPilotTool, PilotLocale } from '@/data/localizedToolRegistry';
import { LocalizedUi } from '@/components/LocalizedToolExperience';
import { LazyToolExperience } from '@/components/LazyToolExperience';

const categoryLabels:Record<PilotLocale,Record<string,string>>={
  de:{calculators:'RECHNER',converters:'KONVERTER',image:'BILDER',pdf:'PDF',text:'TEXT',developer:'ENTWICKLER',time:'ZEIT & DATUM',generators:'GENERATOREN','website-analysis':'WEBSITE-ANALYSE'},
  hi:{calculators:'कैलकुलेटर',converters:'कन्वर्टर',image:'इमेज',pdf:'PDF',text:'टेक्स्ट',developer:'डेवलपर',time:'समय और तारीख',generators:'जनरेटर','website-analysis':'वेबसाइट एनालिसिस'},
  ru:{calculators:'КАЛЬКУЛЯТОРЫ',converters:'КОНВЕРТЕРЫ',image:'ИЗОБРАЖЕНИЯ',pdf:'PDF',text:'ТЕКСТ',developer:'РАЗРАБОТЧИКАМ',time:'ВРЕМЯ И ДАТА',generators:'ГЕНЕРАТОРЫ','website-analysis':'АНАЛИЗ САЙТОВ'},
};

export function ScaleLocalizedToolExperience({tool,item,locale}:{tool:Tool;item:LocalizedPilotTool;locale:PilotLocale}){
  const translated:Tool={
    ...tool,
    name:item.name,
    short:item.intro,
    title:item.title,
    description:item.description,
    intro:item.intro,
    benefits:item.benefits,
    faq:item.faq,
    categoryLabel:categoryLabels[locale][tool.category]||tool.categoryLabel,
  };
  return <LocalizedUi locale={locale}><LazyToolExperience tool={translated}/></LocalizedUi>;
}
