import { tools, toolUrl, type Tool } from './tools';
import {
  localizedPilotTools as curatedTools,
  pilotLocaleMeta as curatedLocaleMeta,
  type LocalizedPilotTool,
  type PilotLocale,
} from './localizedToolPilot';

export type { LocalizedPilotTool, PilotLocale } from './localizedToolPilot';

const localeLabels: Record<PilotLocale, Record<string,string>> = {
  de: {
    calculators:'Rechner', converters:'Konverter', image:'Bild-Tools', pdf:'PDF-Tools', text:'Text-Tools', developer:'Entwickler-Tools', time:'Zeit & Datum', generators:'Generatoren', 'website-analysis':'Website-Analyse',
  },
  hi: {
    calculators:'कैलकुलेटर', converters:'कन्वर्टर', image:'इमेज टूल्स', pdf:'PDF टूल्स', text:'टेक्स्ट टूल्स', developer:'डेवलपर टूल्स', time:'समय और तारीख', generators:'जनरेटर', 'website-analysis':'वेबसाइट एनालिसिस',
  },
  ru: {
    calculators:'Калькуляторы', converters:'Конвертеры', image:'Изображения', pdf:'PDF-инструменты', text:'Текст', developer:'Инструменты разработчика', time:'Время и дата', generators:'Генераторы', 'website-analysis':'Анализ сайтов',
  },
};

const specialNames: Record<PilotLocale, Record<string,string>> = {
  de: {
    'webp-png':'WebP in PNG','jpg-png':'JPG in PNG','png-jpg':'PNG in JPG','compress-image':'Bild komprimieren','webp-jpg':'WebP in JPG','heic-jpg':'HEIC in JPG','compress-png':'PNG komprimieren','crop-image':'Bild zuschneiden','split-pdf':'PDF teilen','jpg-pdf':'JPG in PDF','png-pdf':'PNG in PDF','pdf-jpg':'PDF in JPG','rotate-pdf':'PDF drehen','remove-pdf-pages':'PDF-Seiten entfernen','age':'Altersrechner','bmi':'BMI-Rechner','compound':'Zinseszinsrechner','loan':'Kreditrechner','roi':'ROI-Rechner','discount':'Rabattrechner','simple-interest':'Einfacher Zinsrechner','date-difference':'Datumsdifferenz-Rechner','average':'Durchschnittsrechner','word-counter':'Wortzähler','case-converter':'Groß-/Kleinschreibung umwandeln','character-counter':'Zeichenzähler','sort-lines':'Zeilen sortieren','text-diff':'Textvergleich','time-zone':'Zeitzonenrechner','unix-timestamp':'Unix-Timestamp-Umrechner','random-number':'Zufallszahlengenerator','website-traffic-checker':'Website-Traffic-Checker','seo-checker':'SEO-Checker','meta-tag-checker':'Meta-Tag-Checker','http-status-checker':'HTTP-Status-Checker','redirect-checker':'Redirect-Checker','robots-checker':'Robots.txt-Checker','ssl-checker':'SSL-Checker','security-headers-checker':'Security-Headers-Checker','technology-checker':'Technologie-Checker',
  },
  hi: {
    'webp-png':'WebP से PNG','jpg-png':'JPG से PNG','png-jpg':'PNG से JPG','compress-image':'इमेज कंप्रेस करें','webp-jpg':'WebP से JPG','heic-jpg':'HEIC से JPG','compress-png':'PNG कंप्रेस करें','crop-image':'इमेज क्रॉप करें','split-pdf':'PDF स्प्लिट करें','jpg-pdf':'JPG से PDF','png-pdf':'PNG से PDF','pdf-jpg':'PDF से JPG','rotate-pdf':'PDF रोटेट करें','remove-pdf-pages':'PDF पेज हटाएँ','age':'आयु कैलकुलेटर','bmi':'BMI कैलकुलेटर','compound':'कंपाउंड इंटरेस्ट कैलकुलेटर','loan':'लोन कैलकुलेटर','roi':'ROI कैलकुलेटर','discount':'डिस्काउंट कैलकुलेटर','simple-interest':'सिंपल इंटरेस्ट कैलकुलेटर','date-difference':'डेट डिफरेंस कैलकुलेटर','average':'एवरेज कैलकुलेटर','word-counter':'वर्ड काउंटर','case-converter':'केस कन्वर्टर','character-counter':'कैरेक्टर काउंटर','sort-lines':'लाइन सॉर्टर','text-diff':'टेक्स्ट डिफ चेकर','time-zone':'टाइम ज़ोन कन्वर्टर','unix-timestamp':'Unix Timestamp कन्वर्टर','random-number':'रैंडम नंबर जनरेटर','website-traffic-checker':'वेबसाइट ट्रैफिक चेकर','seo-checker':'SEO चेकर','meta-tag-checker':'मेटा टैग चेकर','http-status-checker':'HTTP स्टेटस चेकर','redirect-checker':'रीडायरेक्ट चेकर','robots-checker':'Robots.txt चेकर','ssl-checker':'SSL चेकर','security-headers-checker':'सिक्योरिटी हेडर चेकर','technology-checker':'टेक्नोलॉजी चेकर',
  },
  ru: {
    'webp-png':'WebP в PNG','jpg-png':'JPG в PNG','png-jpg':'PNG в JPG','compress-image':'Сжать изображение','webp-jpg':'WebP в JPG','heic-jpg':'HEIC в JPG','compress-png':'Сжать PNG','crop-image':'Обрезать изображение','split-pdf':'Разделить PDF','jpg-pdf':'JPG в PDF','png-pdf':'PNG в PDF','pdf-jpg':'PDF в JPG','rotate-pdf':'Повернуть PDF','remove-pdf-pages':'Удалить страницы PDF','age':'Калькулятор возраста','bmi':'Калькулятор BMI','compound':'Калькулятор сложных процентов','loan':'Кредитный калькулятор','roi':'Калькулятор ROI','discount':'Калькулятор скидки','simple-interest':'Калькулятор простых процентов','date-difference':'Калькулятор разницы дат','average':'Калькулятор среднего','word-counter':'Счётчик слов','case-converter':'Конвертер регистра','character-counter':'Счётчик символов','sort-lines':'Сортировка строк','text-diff':'Сравнение текста','time-zone':'Конвертер часовых поясов','unix-timestamp':'Конвертер Unix Timestamp','random-number':'Генератор случайных чисел','website-traffic-checker':'Проверка трафика сайта','seo-checker':'SEO-проверка','meta-tag-checker':'Проверка мета-тегов','http-status-checker':'Проверка HTTP-статуса','redirect-checker':'Проверка редиректов','robots-checker':'Проверка robots.txt','ssl-checker':'Проверка SSL','security-headers-checker':'Проверка security headers','technology-checker':'Проверка технологий сайта',
  },
};

function localizedName(locale:PilotLocale, tool:Tool){
  const explicit=specialNames[locale][tool.id];
  if(explicit)return explicit;
  let name=tool.name;
  if(locale==='de') name=name.replace(/ Calculator/g,' Rechner').replace(/ Converter/g,' Umrechner').replace(/ Counter/g,' Zähler').replace(/ Analyzer/g,' Analyse');
  if(locale==='hi') name=name.replace(/ Calculator/g,' कैलकुलेटर').replace(/ Converter/g,' कन्वर्टर').replace(/ Counter/g,' काउंटर').replace(/ Generator/g,' जनरेटर');
  if(locale==='ru') name=name.replace(/ Calculator/g,' Калькулятор').replace(/ Converter/g,' Конвертер').replace(/ Counter/g,' Счётчик').replace(/ Generator/g,' Генератор');
  return name;
}

function purpose(locale:PilotLocale, tool:Tool, name:string){
  const category=tool.category;
  if(locale==='de'){
    const byCategory:Record<string,string>={
      image:`Bearbeite Bilddateien mit ${name} in einem klaren Online-Workflow und exportiere das Ergebnis direkt.`,
      pdf:`Nutze ${name} für einen fokussierten PDF-Workflow mit verständlichen Eingaben und einem direkten Ergebnis.`,
      calculators:`Berechne mit ${name} den passenden Wert anhand der eingegebenen Daten und nachvollziehbaren Regeln.`,
      converters:`Wandle mit ${name} Werte zwischen den unterstützten Einheiten oder Formaten um.`,
      text:`Verarbeite Text mit ${name} direkt im Browser und übernimm das Ergebnis ohne unnötige Zwischenschritte.`,
      developer:`Nutze ${name} für einen schnellen Entwickler-Workflow mit klarer Eingabe und kopierbarem Ergebnis.`,
      time:`Nutze ${name} für Zeit-, Datums- oder Zeitzonenaufgaben mit eindeutigem Ergebnis.`,
      generators:`Erzeuge mit ${name} den benötigten Wert direkt im Browser und passe die verfügbaren Optionen an.`,
      'website-analysis':`Prüfe mit ${name} öffentlich erreichbare Website-Signale und erhalte einen nachvollziehbaren technischen Bericht.`,
    };return byCategory[category]||`Nutze ${name} kostenlos online mit einem direkten Toolmera-Workflow.`;
  }
  if(locale==='hi'){
    const byCategory:Record<string,string>={
      image:`${name} के साथ इमेज फाइल पर सीधा ऑनलाइन काम करें और परिणाम तुरंत export करें।`,
      pdf:`${name} से PDF workflow पूरा करें, स्पष्ट inputs और सीधे output के साथ।`,
      calculators:`${name} में अपनी values डालकर स्पष्ट calculation result प्राप्त करें।`,
      converters:`${name} से supported units या formats के बीच value convert करें।`,
      text:`${name} के साथ text को browser में process करें और result तुरंत उपयोग करें।`,
      developer:`${name} से developer workflow तेज़ करें, साफ़ input और copy-ready output के साथ।`,
      time:`${name} से date, time या time-zone से जुड़ा calculation स्पष्ट रूप से करें।`,
      generators:`${name} से browser में आवश्यक value generate करें और उपलब्ध options नियंत्रित करें।`,
      'website-analysis':`${name} से public website signals जाँचें और verifiable technical result देखें।`,
    };return byCategory[category]||`${name} को मुफ्त ऑनलाइन Toolmera workflow में इस्तेमाल करें।`;
  }
  const byCategory:Record<string,string>={
    image:`Используйте ${name} для работы с изображениями и сразу получите готовый результат.`,
    pdf:`Используйте ${name} для конкретной задачи с PDF с понятными параметрами и прямым результатом.`,
    calculators:`Введите значения в ${name} и получите расчёт по понятной математической логике.`,
    converters:`Используйте ${name}, чтобы переводить значения между поддерживаемыми единицами или форматами.`,
    text:`Обрабатывайте текст в ${name} прямо в браузере и сразу используйте готовый результат.`,
    developer:`Используйте ${name} для быстрого developer-workflow с понятным вводом и готовым к копированию результатом.`,
    time:`Используйте ${name} для задач со временем, датами или часовыми поясами.`,
    generators:`Создавайте нужные значения в ${name} прямо в браузере и настраивайте доступные параметры.`,
    'website-analysis':`Проверяйте в ${name} публично доступные сигналы сайта и получайте проверяемый технический результат.`,
  };return byCategory[category]||`Используйте ${name} бесплатно онлайн в Toolmera.`;
}

function benefits(locale:PilotLocale,tool:Tool){
  const category=tool.category;
  const sets:Record<PilotLocale,Record<string,string[]>>={
    de:{image:['Direkter Bild-Workflow','Klare Ausgabe','Ohne Konto'],pdf:['Fokussierter PDF-Workflow','Direktes Ergebnis','Ohne Konto'],calculators:['Sofortige Berechnung','Klare Eingaben','Kostenlos nutzbar'],converters:['Direkte Umrechnung','Klare Einheiten','Sofortiges Ergebnis'],text:['Browser-basierte Textverarbeitung','Schnelles Ergebnis','Ohne Konto'],developer:['Praktischer Entwickler-Workflow','Copy-ready Ausgabe','Ohne Konto'],time:['Klare Zeit- und Datumslogik','Sofortiges Ergebnis','Kostenlos nutzbar'],generators:['Direkte Erzeugung','Anpassbare Optionen','Ohne Konto'],'website-analysis':['Live öffentliche Signale','Technischer Bericht','Keine erfundenen Daten']},
    hi:{image:['सीधा image workflow','स्पष्ट output','बिना account'],pdf:['focused PDF workflow','सीधा result','बिना account'],calculators:['तुरंत calculation','स्पष्ट inputs','मुफ्त उपयोग'],converters:['सीधा conversion','स्पष्ट units','तुरंत result'],text:['browser text processing','तेज़ result','बिना account'],developer:['developer workflow','copy-ready output','बिना account'],time:['स्पष्ट date/time logic','तुरंत result','मुफ्त उपयोग'],generators:['सीधा generation','custom options','बिना account'],'website-analysis':['live public signals','technical report','कोई fake data नहीं']},
    ru:{image:['Прямой workflow для изображений','Понятный результат','Без аккаунта'],pdf:['Конкретный PDF-workflow','Прямой результат','Без аккаунта'],calculators:['Мгновенный расчёт','Понятные параметры','Бесплатно'],converters:['Прямое преобразование','Понятные единицы','Мгновенный результат'],text:['Обработка текста в браузере','Быстрый результат','Без аккаунта'],developer:['Практичный developer-workflow','Результат для копирования','Без аккаунта'],time:['Понятная логика времени и дат','Мгновенный результат','Бесплатно'],generators:['Прямая генерация','Настраиваемые параметры','Без аккаунта'],'website-analysis':['Публичные live-сигналы','Технический отчёт','Без выдуманных данных']},
  };
  return sets[locale][category]||sets[locale].calculators;
}

function generatedEntry(locale:PilotLocale, tool:Tool):LocalizedPilotTool{
  const name=localizedName(locale,tool);const label=localeLabels[locale][tool.category]||tool.categoryLabel;const p=purpose(locale,tool,name);
  if(locale==='de')return{toolId:tool.id,slug:tool.slug,name,title:`${name} kostenlos — ${label} online`,description:`${p} Kostenlos, ohne Anmeldung und für den konkreten ${label}-Workflow optimiert.`,intro:p,benefits:benefits(locale,tool),faq:[{q:`Ist ${name} kostenlos?`,a:`Ja. ${name} kann ohne Konto kostenlos genutzt werden.`},{q:`Wofür kann ich ${name} verwenden?`,a:p}],englishUrl:toolUrl(tool)};
  if(locale==='hi')return{toolId:tool.id,slug:tool.slug,name,title:`${name} — मुफ्त ${label} ऑनलाइन`,description:`${p} Toolmera पर इसे बिना account मुफ्त इस्तेमाल करें।`,intro:p,benefits:benefits(locale,tool),faq:[{q:`क्या ${name} मुफ्त है?`,a:`हाँ। ${name} को बिना account मुफ्त इस्तेमाल किया जा सकता है।`},{q:`${name} किस काम के लिए है?`,a:p}],englishUrl:toolUrl(tool)};
  return{toolId:tool.id,slug:tool.slug,name,title:`${name} — бесплатный ${label} онлайн`,description:`${p} Бесплатно, без аккаунта и с фокусом на конкретную задачу.`,intro:p,benefits:benefits(locale,tool),faq:[{q:`${name} бесплатный?`,a:`Да. ${name} можно использовать бесплатно без аккаунта.`},{q:`Для чего нужен ${name}?`,a:p}],englishUrl:toolUrl(tool)};
}

function expand(locale:PilotLocale){
  const curated=curatedTools[locale];const seen=new Set(curated.map(item=>item.toolId));
  const generated=tools.filter(tool=>!tool.country&&!seen.has(tool.id)).map(tool=>generatedEntry(locale,tool));
  return [...curated,...generated];
}

export const localizedPilotTools:Record<PilotLocale,LocalizedPilotTool[]>={de:expand('de'),hi:expand('hi'),ru:expand('ru')};

export const pilotLocaleMeta={
  ...curatedLocaleMeta,
  de:{...curatedLocaleMeta.de,hubDescription:'Kostenlose Toolmera-Rechner, Konverter, PDF-, Bild-, Text-, Entwickler- und Website-Tools auf Deutsch.',hubIntro:'Nutze die aktuellen globalen Toolmera-Tools mit deutschsprachigen SEO-Seiten, klaren Erklärungen und direkten Browser-Workflows.'},
  hi:{...curatedLocaleMeta.hi,hubDescription:'Toolmera के मौजूदा calculators, converters, PDF, image, text, developer और website tools हिन्दी में।',hubIntro:'मौजूदा global Toolmera tools को हिन्दी SEO pages, स्पष्ट explanations और सीधे browser workflows के साथ इस्तेमाल करें।'},
  ru:{...curatedLocaleMeta.ru,hubDescription:'Актуальные калькуляторы, конвертеры, PDF-, image-, text-, developer- и website-инструменты Toolmera на русском.',hubIntro:'Используйте актуальные глобальные инструменты Toolmera с русскоязычными SEO-страницами, понятными пояснениями и прямыми workflow.'},
} satisfies typeof curatedLocaleMeta;

export function getLocalizedPilotTool(locale:PilotLocale,slug:string){return localizedPilotTools[locale].find(item=>item.slug===slug)}
export function getLocalizedPilotByToolId(locale:PilotLocale,toolId:string){return localizedPilotTools[locale].find(item=>item.toolId===toolId)}
export function localizedPath(locale:PilotLocale,toolId:string){const item=getLocalizedPilotByToolId(locale,toolId);return item?`/${locale}/${item.slug}/`:null}
export function localizedAlternates(toolId:string,englishUrl:string){
  const languages:Record<string,string>={en:`https://toolmera.com${englishUrl}`,'x-default':`https://toolmera.com${englishUrl}`};
  for(const locale of ['de','hi','ru'] as PilotLocale[]){const path=localizedPath(locale,toolId);if(path)languages[locale]=`https://toolmera.com${path}`}
  return languages;
}

export function isCuratedLocalizedTool(locale:PilotLocale,toolId:string){return curatedTools[locale].some(item=>item.toolId===toolId)}
