'use client';

import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { ToolExperience } from '@/components/ToolExperience';
import type { Tool } from '@/data/tools';
import type { PilotLocale } from '@/data/localizedToolPilot';

type Dict=Record<string,string>;

const dictionaries:Record<PilotLocale,Dict>={
  de:{
    'Choose file':'Datei auswählen','Processing…':'Verarbeitung…','Processing locally in your browser':'Wird lokal in deinem Browser verarbeitet','File ready':'Datei bereit','Drop file here':'Datei hier ablegen','Release to add it':'Loslassen, um die Datei hinzuzufügen','or drag & drop from your folder':'oder per Drag & Drop aus deinem Ordner','Ready':'Bereit','Your file is ready to download.':'Deine Datei ist zum Download bereit.','Download':'Herunterladen','Copy':'Kopieren','Copied':'Kopiert','Result':'Ergebnis','Formula':'Formel','Value':'Wert','Total':'Gesamt','From':'Von','To':'Nach','Swap units':'Einheiten tauschen','Width':'Breite','Height':'Höhe','Quality':'Qualität','Generate':'Erstellen','Regenerate password':'Passwort neu erzeugen','Password length':'Passwortlänge','Uppercase A–Z':'Großbuchstaben A–Z','Lowercase a–z':'Kleinbuchstaben a–z','Digits 0–9':'Ziffern 0–9','Symbols':'Sonderzeichen','Character-space estimate':'Zeichenraum-Schätzung','Very strong':'Sehr stark','Strong':'Stark','Moderate':'Mittel','Limited':'Begrenzt','X is what % of Y?':'X sind wie viel % von Y?','What is X% of Y?':'Wie viel sind X % von Y?','Increase / decrease':'Erhöhung / Verringerung','Percentage difference':'Prozentuale Differenz','Starting value':'Ausgangswert','New value':'Neuer Wert','First value':'Erster Wert','Second value':'Zweiter Wert','Percent (%)':'Prozent (%)','Number':'Zahl','Difference':'Differenz','Increase':'Erhöhung','Decrease':'Verringerung','Add':'Addieren','Subtract':'Subtrahieren','Start date':'Startdatum','Years':'Jahre','Months':'Monate','Weeks':'Wochen','Days':'Tage','Target date':'Zieldatum','Day of week':'Wochentag','Content':'Inhalt','Size':'Größe','Error correction':'Fehlerkorrektur','Foreground':'Vordergrund','Background':'Hintergrund','Margin':'Rand','Generate QR code':'QR-Code erstellen','Download PNG':'PNG herunterladen','Download SVG':'SVG herunterladen','Keep aspect ratio':'Seitenverhältnis beibehalten','Original size':'Originalgröße','New size':'Neue Größe','Before':'Vorher','After':'Nachher','Compress':'Komprimieren','Compression quality':'Kompressionsqualität','Merge PDFs':'PDFs zusammenfügen','Add files':'Dateien hinzufügen','Remove':'Entfernen','Move up':'Nach oben','Move down':'Nach unten','Text':'Text','Case sensitive':'Groß-/Kleinschreibung beachten','Trim whitespace':'Leerzeichen entfernen','Remove blank lines':'Leere Zeilen entfernen','Sort result':'Ergebnis sortieren','Remove duplicate lines':'Doppelte Zeilen entfernen','Unique lines':'Eindeutige Zeilen','Input lines':'Eingabezeilen','Kilometer per hour (km/h)':'Kilometer pro Stunde (km/h)','Mile per hour (mph)':'Meilen pro Stunde (mph)','Meter per second (m/s)':'Meter pro Sekunde (m/s)','Foot per second (ft/s)':'Fuß pro Sekunde (ft/s)','Knot (kn)':'Knoten (kn)','Meter (m)':'Meter (m)','Kilometer (km)':'Kilometer (km)','Centimeter (cm)':'Zentimeter (cm)','Millimeter (mm)':'Millimeter (mm)','Foot (ft)':'Fuß (ft)','Inch (in)':'Zoll (in)','Yard (yd)':'Yard (yd)','Mile (mi)':'Meile (mi)','Analyze website':'Website analysieren','Public website URL':'Öffentliche Website-URL','SEO score':'SEO-Wert','HTTP status':'HTTP-Status','H1 tags':'H1-Tags','Missing alt':'Fehlende ALT-Texte','Search signals':'Suchsignale','Indexability context':'Indexierbarkeit','Public fingerprints':'Öffentliche Technologien','Check sitemap':'Sitemap prüfen','Sitemap URL':'Sitemap-URL','URL count':'URL-Anzahl','Last modified coverage':'lastmod-Abdeckung'
  },
  hi:{
    'Choose file':'फ़ाइल चुनें','Processing…':'प्रोसेस हो रहा है…','Processing locally in your browser':'आपके ब्राउज़र में लोकल प्रोसेसिंग','File ready':'फ़ाइल तैयार है','Drop file here':'फ़ाइल यहाँ छोड़ें','Release to add it':'फ़ाइल जोड़ने के लिए छोड़ें','or drag & drop from your folder':'या अपने फ़ोल्डर से ड्रैग और ड्रॉप करें','Ready':'तैयार','Your file is ready to download.':'आपकी फ़ाइल डाउनलोड के लिए तैयार है।','Download':'डाउनलोड','Copy':'कॉपी','Copied':'कॉपी हो गया','Result':'परिणाम','Formula':'फ़ॉर्मूला','Value':'मान','Total':'कुल','From':'से','To':'तक','Swap units':'इकाइयाँ बदलें','Width':'चौड़ाई','Height':'ऊँचाई','Quality':'क्वालिटी','Generate':'बनाएँ','Regenerate password':'नया पासवर्ड बनाएँ','Password length':'पासवर्ड लंबाई','Uppercase A–Z':'बड़े अक्षर A–Z','Lowercase a–z':'छोटे अक्षर a–z','Digits 0–9':'अंक 0–9','Symbols':'विशेष चिन्ह','Character-space estimate':'कैरेक्टर स्पेस अनुमान','Very strong':'बहुत मजबूत','Strong':'मजबूत','Moderate':'मध्यम','Limited':'सीमित','X is what % of Y?':'X, Y का कितने प्रतिशत है?','What is X% of Y?':'Y का X% कितना है?','Increase / decrease':'बढ़ोतरी / कमी','Percentage difference':'प्रतिशत अंतर','Starting value':'शुरुआती मान','New value':'नया मान','First value':'पहला मान','Second value':'दूसरा मान','Percent (%)':'प्रतिशत (%)','Number':'संख्या','Difference':'अंतर','Increase':'बढ़ोतरी','Decrease':'कमी','Add':'जोड़ें','Subtract':'घटाएँ','Start date':'शुरुआती तारीख','Years':'साल','Months':'महीने','Weeks':'हफ्ते','Days':'दिन','Target date':'नई तारीख','Day of week':'सप्ताह का दिन','Content':'कंटेंट','Size':'आकार','Error correction':'एरर करेक्शन','Foreground':'मुख्य रंग','Background':'बैकग्राउंड','Margin':'मार्जिन','Generate QR code':'QR कोड बनाएँ','Download PNG':'PNG डाउनलोड','Download SVG':'SVG डाउनलोड','Keep aspect ratio':'अनुपात बनाए रखें','Original size':'मूल आकार','New size':'नया आकार','Before':'पहले','After':'बाद में','Compress':'कंप्रेस करें','Compression quality':'कंप्रेशन क्वालिटी','Merge PDFs':'PDF जोड़ें','Add files':'फ़ाइलें जोड़ें','Remove':'हटाएँ','Move up':'ऊपर करें','Move down':'नीचे करें','Text':'टेक्स्ट','Case sensitive':'अक्षर केस का ध्यान रखें','Trim whitespace':'अतिरिक्त स्पेस हटाएँ','Remove blank lines':'खाली लाइनें हटाएँ','Sort result':'परिणाम क्रमबद्ध करें','Remove duplicate lines':'डुप्लिकेट लाइनें हटाएँ','Unique lines':'यूनिक लाइनें','Input lines':'इनपुट लाइनें','Kilometer per hour (km/h)':'किलोमीटर प्रति घंटा (km/h)','Mile per hour (mph)':'मील प्रति घंटा (mph)','Meter per second (m/s)':'मीटर प्रति सेकंड (m/s)','Foot per second (ft/s)':'फुट प्रति सेकंड (ft/s)','Knot (kn)':'नॉट (kn)','Meter (m)':'मीटर (m)','Kilometer (km)':'किलोमीटर (km)','Centimeter (cm)':'सेंटीमीटर (cm)','Millimeter (mm)':'मिलीमीटर (mm)','Foot (ft)':'फुट (ft)','Inch (in)':'इंच (in)','Yard (yd)':'यार्ड (yd)','Mile (mi)':'मील (mi)','Analyze website':'वेबसाइट जाँचें','Public website URL':'पब्लिक वेबसाइट URL','SEO score':'SEO स्कोर','HTTP status':'HTTP स्टेटस','H1 tags':'H1 टैग','Missing alt':'ALT टेक्स्ट नहीं','Search signals':'सर्च सिग्नल','Indexability context':'इंडेक्सिंग संदर्भ','Public fingerprints':'टेक्नोलॉजी संकेत','Check sitemap':'साइटमैप जाँचें','Sitemap URL':'साइटमैप URL','URL count':'URL संख्या','Last modified coverage':'lastmod कवरेज'
  },
  ru:{
    'Choose file':'Выбрать файл','Processing…':'Обработка…','Processing locally in your browser':'Обработка локально в вашем браузере','File ready':'Файл готов','Drop file here':'Перетащите файл сюда','Release to add it':'Отпустите, чтобы добавить файл','or drag & drop from your folder':'или перетащите файл из папки','Ready':'Готово','Your file is ready to download.':'Файл готов к скачиванию.','Download':'Скачать','Copy':'Копировать','Copied':'Скопировано','Result':'Результат','Formula':'Формула','Value':'Значение','Total':'Итого','From':'Из','To':'В','Swap units':'Поменять единицы','Width':'Ширина','Height':'Высота','Quality':'Качество','Generate':'Создать','Regenerate password':'Создать новый пароль','Password length':'Длина пароля','Uppercase A–Z':'Заглавные A–Z','Lowercase a–z':'Строчные a–z','Digits 0–9':'Цифры 0–9','Symbols':'Спецсимволы','Character-space estimate':'Оценка пространства символов','Very strong':'Очень сильный','Strong':'Сильный','Moderate':'Средний','Limited':'Ограниченный','X is what % of Y?':'Сколько процентов X от Y?','What is X% of Y?':'Сколько будет X% от Y?','Increase / decrease':'Рост / снижение','Percentage difference':'Процентная разница','Starting value':'Начальное значение','New value':'Новое значение','First value':'Первое значение','Second value':'Второе значение','Percent (%)':'Процент (%)','Number':'Число','Difference':'Разница','Increase':'Рост','Decrease':'Снижение','Add':'Добавить','Subtract':'Вычесть','Start date':'Начальная дата','Years':'Годы','Months':'Месяцы','Weeks':'Недели','Days':'Дни','Target date':'Итоговая дата','Day of week':'День недели','Content':'Содержимое','Size':'Размер','Error correction':'Коррекция ошибок','Foreground':'Основной цвет','Background':'Фон','Margin':'Отступ','Generate QR code':'Создать QR-код','Download PNG':'Скачать PNG','Download SVG':'Скачать SVG','Keep aspect ratio':'Сохранять пропорции','Original size':'Исходный размер','New size':'Новый размер','Before':'До','After':'После','Compress':'Сжать','Compression quality':'Качество сжатия','Merge PDFs':'Объединить PDF','Add files':'Добавить файлы','Remove':'Удалить','Move up':'Переместить вверх','Move down':'Переместить вниз','Text':'Текст','Case sensitive':'Учитывать регистр','Trim whitespace':'Убирать пробелы по краям','Remove blank lines':'Удалять пустые строки','Sort result':'Сортировать результат','Remove duplicate lines':'Удалить дубли строк','Unique lines':'Уникальные строки','Input lines':'Строк во входных данных','Kilometer per hour (km/h)':'Километры в час (км/ч)','Mile per hour (mph)':'Мили в час (mph)','Meter per second (m/s)':'Метры в секунду (м/с)','Foot per second (ft/s)':'Футы в секунду (ft/s)','Knot (kn)':'Узлы (kn)','Meter (m)':'Метр (м)','Kilometer (km)':'Километр (км)','Centimeter (cm)':'Сантиметр (см)','Millimeter (mm)':'Миллиметр (мм)','Foot (ft)':'Фут (ft)','Inch (in)':'Дюйм (in)','Yard (yd)':'Ярд (yd)','Mile (mi)':'Миля (mi)','Analyze website':'Анализировать сайт','Public website URL':'Публичный URL сайта','SEO score':'SEO-оценка','HTTP status':'HTTP-статус','H1 tags':'Теги H1','Missing alt':'Нет ALT','Search signals':'Поисковые сигналы','Indexability context':'Контекст индексации','Public fingerprints':'Технологии сайта','Check sitemap':'Проверить sitemap','Sitemap URL':'URL sitemap','URL count':'Количество URL','Last modified coverage':'Покрытие lastmod'
  }
};

function translateText(raw:string,locale:PilotLocale){
  const dict=dictionaries[locale];
  const lead=raw.match(/^\s*/)?.[0]||'';const tail=raw.match(/\s*$/)?.[0]||'';const core=raw.trim();
  if(!core)return raw;
  if(dict[core])return lead+dict[core]+tail;
  let out=core;
  if(locale==='de'){
    out=out.replace(/^(\d+) files ready$/,'$1 Dateien bereit').replace(/^Drop more files or click to add/,'Weitere Dateien ablegen oder zum Hinzufügen klicken').replace(/^Drop another file or click to replace$/,'Andere Datei ablegen oder zum Ersetzen klicken');
  }else if(locale==='hi'){
    out=out.replace(/^(\d+) files ready$/,'$1 फ़ाइलें तैयार हैं').replace(/^Drop more files or click to add/,'और फ़ाइलें छोड़ें या जोड़ने के लिए क्लिक करें').replace(/^Drop another file or click to replace$/,'दूसरी फ़ाइल छोड़ें या बदलने के लिए क्लिक करें');
  }else{
    out=out.replace(/^(\d+) files ready$/,'Готово файлов: $1').replace(/^Drop more files or click to add/,'Перетащите ещё файлы или нажмите, чтобы добавить').replace(/^Drop another file or click to replace$/,'Перетащите другой файл или нажмите, чтобы заменить');
  }
  return out===core?raw:lead+out+tail;
}

function translateTree(root:HTMLElement,locale:PilotLocale){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes:Text[]=[];let node=walker.nextNode();
  while(node){nodes.push(node as Text);node=walker.nextNode()}
  for(const textNode of nodes){
    const parent=textNode.parentElement;
    if(!parent||['SCRIPT','STYLE','CODE'].includes(parent.tagName))continue;
    const next=translateText(textNode.nodeValue||'',locale);if(next!==textNode.nodeValue)textNode.nodeValue=next;
  }
  root.querySelectorAll<HTMLElement>('[placeholder],[aria-label],[title]').forEach(el=>{
    for(const attr of ['placeholder','aria-label','title']){
      const current=el.getAttribute(attr);if(!current)continue;const next=translateText(current,locale);if(next!==current)el.setAttribute(attr,next.trim());
    }
  });
}

export function LocalizedUi({locale,children}:{locale:PilotLocale;children:ReactNode}){
  const ref=useRef<HTMLDivElement>(null);
  const sync=useCallback(()=>{if(ref.current)translateTree(ref.current,locale)},[locale]);
  const schedule=useCallback(()=>{
    window.requestAnimationFrame(sync);
    window.setTimeout(sync,80);
    window.setTimeout(sync,320);
  },[sync]);
  useEffect(()=>{
    sync();
    const ids=[80,320,900].map(delay=>window.setTimeout(sync,delay));
    return()=>ids.forEach(id=>window.clearTimeout(id));
  },[sync]);
  return <div ref={ref} lang={locale} onClickCapture={schedule} onInputCapture={schedule} onChangeCapture={schedule}>{children}</div>;
}

export function LocalizedToolExperience({tool,locale}:{tool:Tool;locale:PilotLocale}){
  return <LocalizedUi locale={locale}><ToolExperience tool={tool}/></LocalizedUi>;
}
