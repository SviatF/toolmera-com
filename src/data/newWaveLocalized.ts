import type { LocalizedPilotTool, PilotLocale } from './localizedToolPilot';

export const newWaveLocalized: Record<PilotLocale, LocalizedPilotTool[]> = {
  de: [
    {
      toolId:'broken-link-checker',
      slug:'defekte-links-pruefen',
      name:'Broken-Link-Checker',
      title:'Defekte Links prüfen — 404-Links und Weiterleitungen finden',
      description:'Prüfe Links einer öffentlichen Webseite und erkenne 404/410-Ziele, Weiterleitungen und andere HTTP-Fehler getrennt voneinander.',
      intro:'Scanne die Links einer konkreten Seite und sieh sofort, welche Ziele funktionieren, weiterleiten oder tatsächlich ins Leere laufen.',
      benefits:['404- und 410-Links erkennen','Interne und externe Links unterscheiden','Weiterleitungen separat sehen'],
      faq:[
        {q:'Was gilt hier als defekter Link?',a:'Ein 404- oder 410-Status ist ein klares Broken-Link-Signal. 403, 429 oder Timeouts werden separat als Zugriffs- bzw. Anfragefehler ausgewiesen.'},
        {q:'Wird die komplette Website gecrawlt?',a:'Nein. Der Checker prüft bewusst nur einen begrenzten Satz eindeutiger Links der eingegebenen Seite.'},
        {q:'Ist eine 301-Weiterleitung automatisch schlecht?',a:'Nein. Sie kann völlig korrekt sein. Sie wird separat gezeigt, damit du bei Bedarf direkt auf das endgültige Ziel verlinken kannst.'}
      ],
      sections:[
        {title:'Nicht jeder rote Status bedeutet dasselbe',body:'Ein 404 oder 410 ist etwas anderes als ein 403 durch Bot-Schutz oder ein 429 wegen Rate-Limits. Der Bericht trennt diese Fälle bewusst, damit aus einem technischen Check keine falsche Diagnose wird.'},
        {title:'Besonders nützlich nach Relaunch, Migration oder Content-Aufräumen',body:'Nach URL-Änderungen bleiben alte interne Verweise oft länger bestehen als gedacht. Mit einem Seitenscan kannst du Navigation, Artikel, Landingpages oder Footer gezielt auf tote Ziele und unnötige Redirects kontrollieren.'}
      ],
      englishUrl:'/website-analysis/broken-link-checker/'
    },
    {
      toolId:'schema-checker',
      slug:'schema-markup-pruefen',
      name:'Schema-Markup-Checker',
      title:'Schema Markup prüfen — JSON-LD und strukturierte Daten analysieren',
      description:'Prüfe JSON-LD-Blöcke einer öffentlichen Seite, erkenne Schema-Typen und finde ungültiges JSON, ohne Rich-Result-Eignung vorzutäuschen.',
      intro:'Sieh nach, welches JSON-LD tatsächlich im ausgelieferten HTML steht und ob die einzelnen Blöcke syntaktisch lesbar sind.',
      benefits:['JSON-LD-Blöcke erkennen','@type-Werte auflisten','Parse-Fehler sichtbar machen'],
      faq:[
        {q:'Prüft Toolmera auch Google Rich Results?',a:'Nein. Der Checker prüft JSON-LD-Präsenz, JSON-Syntax und deklarierte Typen. Für Google-spezifische Rich-Result-Anforderungen gelten zusätzliche Regeln.'},
        {q:'Wird @graph unterstützt?',a:'Ja. Schema-Typen innerhalb von @graph-Strukturen werden ebenfalls erfasst.'},
        {q:'Wird JavaScript ausgeführt?',a:'Nein. Analysiert wird das JSON-LD im Server-HTML der angefragten Seite.'}
      ],
      sections:[
        {title:'Der erste Fehler liegt oft schon vor der eigentlichen Schema-Validierung',body:'Wenn ein JSON-LD-Block durch ein fehlendes Komma, falsche Anführungszeichen oder ein kaputtes Template nicht mehr parsebar ist, braucht man noch gar nicht über Product-, Article- oder FAQ-Anforderungen zu sprechen. Genau diese Basisfehler zeigt der Checker direkt.'},
        {title:'Syntax korrekt heißt noch nicht automatisch suchmaschinenfähig',body:'Ein sauberer JSON-Block kann trotzdem Pflichtfelder für ein bestimmtes Search Feature vermissen. Deshalb trennt Toolmera bewusst die technische JSON-Prüfung von Aussagen über Rich-Result-Berechtigung.'}
      ],
      englishUrl:'/website-analysis/schema-checker/'
    },
    {
      toolId:'dns-lookup',
      slug:'dns-lookup',
      name:'DNS Lookup',
      title:'DNS Lookup — A, AAAA, MX, TXT, CNAME und NS prüfen',
      description:'Lies öffentliche DNS-Einträge einer Domain aus und prüfe A, AAAA, CNAME, MX, TXT und NS inklusive TTL.',
      intro:'Kontrolliere, wohin eine Domain im öffentlichen DNS zeigt, welche Mailserver eingetragen sind und welche TXT- oder Nameserver-Einträge aktuell zurückgegeben werden.',
      benefits:['6 wichtige Record-Typen','TTL direkt anzeigen','Externer DNS-over-HTTPS-Blick'],
      faq:[
        {q:'Welche DNS Records werden geprüft?',a:'A, AAAA, CNAME, MX, TXT und NS.'},
        {q:'Was bedeutet TTL?',a:'TTL gibt an, wie lange ein Resolver eine DNS-Antwort zwischenspeichern darf.'},
        {q:'Zeigt ein Lookup die weltweite DNS-Propagation?',a:'Nein. Es zeigt die Antwort des verwendeten öffentlichen Resolvers; andere Caches können vorübergehend abweichen.'}
      ],
      sections:[
        {title:'Web, E-Mail und Domain-Verifizierung liegen in unterschiedlichen DNS Records',body:'A und AAAA verbinden Hostnamen mit IP-Adressen, MX steuert Mailrouting, TXT wird oft für SPF oder Verifizierungen genutzt und NS zeigt die autoritativen Nameserver. Ein gemeinsamer Überblick spart bei Deployments viel Sucharbeit.'},
        {title:'TTL ist kein Countdown bis „Propagation fertig“',body:'Eine TTL beschreibt Cache-Zeit, nicht einen global synchronen Umschaltzeitpunkt. Unterschiedliche Resolver können deshalb für eine Weile verschiedene Antworten liefern, obwohl die Zone bereits korrekt geändert wurde.'}
      ],
      englishUrl:'/website-analysis/dns-lookup/'
    },
    {
      toolId:'tip',
      slug:'trinkgeldrechner',
      name:'Trinkgeldrechner',
      title:'Trinkgeldrechner — Trinkgeld, Gesamtbetrag und Anteil pro Person',
      description:'Berechne Trinkgeld, Endsumme und den Anteil pro Person aus Rechnungsbetrag, Prozentsatz und Personenzahl.',
      intro:'Gib die Rechnung ein, wähle den Trinkgeldsatz und teile den Endbetrag auf Wunsch direkt auf mehrere Personen auf.',
      benefits:['Trinkgeldbetrag sofort sehen','Gesamtrechnung aufteilen','Schnelle Prozent-Voreinstellungen'],
      faq:[
        {q:'Wie berechne ich 20 % Trinkgeld?',a:'Multipliziere den Rechnungsbetrag mit 0,20. Bei 80 ergibt das 16 Trinkgeld und 96 Gesamtbetrag.'},
        {q:'Kann ich die Rechnung auf mehrere Personen teilen?',a:'Ja. Der Rechner zeigt sowohl Trinkgeld als auch Gesamtbetrag pro Person.'},
        {q:'Empfiehlt Toolmera eine Trinkgeldhöhe?',a:'Nein. Die Prozentbuttons sind Rechenhilfen; Trinkgeldgewohnheiten unterscheiden sich je nach Land und Situation.'}
      ],
      sections:[
        {title:'Die praktische Frage ist meistens nicht nur „Wie hoch ist das Trinkgeld?“',body:'Wenn mehrere Personen zahlen, braucht man zusätzlich die endgültige Summe und den Anteil pro Kopf. Deshalb zeigt der Rechner alle vier Werte zusammen: Trinkgeld, Gesamtbetrag, Trinkgeld pro Person und Gesamtbetrag pro Person.'},
        {title:'Keine versteckte Währungslogik',body:'Die Rechnung funktioniert mit Euro, Dollar, Pfund oder jeder anderen Währung. Entscheidend ist nur, dass du den eingegebenen Betrag und die Ergebnisse in derselben Währung interpretierst.'}
      ],
      englishUrl:'/calculators/tip-calculator/'
    },
    {
      toolId:'fraction',
      slug:'bruchrechner',
      name:'Bruchrechner',
      title:'Bruchrechner — Brüche addieren, subtrahieren, multiplizieren und dividieren',
      description:'Rechne zwei Brüche exakt, kürze das Ergebnis automatisch und zeige zusätzlich gemischte Zahl und Dezimalwert.',
      intro:'Gib zwei Brüche ein, wähle die Rechenart und erhalte den gekürzten exakten Bruch statt nur einer gerundeten Dezimalzahl.',
      benefits:['Vier Grundrechenarten','Automatisch kürzen','Bruch, gemischte Zahl und Dezimalwert'],
      faq:[
        {q:'Wie wird ein Bruch gekürzt?',a:'Zähler und Nenner werden durch ihren größten gemeinsamen Teiler geteilt.'},
        {q:'Kann der Rechner unechte Brüche als gemischte Zahl anzeigen?',a:'Ja. Ein Ergebnis wie 11/8 wird zusätzlich als 1 3/8 dargestellt.'},
        {q:'Warum darf der Nenner nicht 0 sein?',a:'Eine Division durch null ist nicht definiert; deshalb ist ein Bruch mit Nenner 0 ungültig.'}
      ],
      sections:[
        {title:'Exakt rechnen, erst danach in Dezimalzahlen umwandeln',body:'Bei Bruchrechnung ist 1/3 mathematisch genauer als 0,3333. Toolmera hält deshalb die Rechnung zunächst als ganzzahligen Bruch fest, kürzt exakt und zeigt den Dezimalwert erst zusätzlich an.'},
        {title:'Gemischte Zahl und unechter Bruch haben beide ihren Platz',body:'11/8 ist für weitere Rechnungen praktisch, 1 3/8 ist im Alltag oft leichter zu lesen. Der Rechner zeigt beide Darstellungen, damit du nicht zwischen Schulmathematik und praktischer Verwendung wählen musst.'}
      ],
      englishUrl:'/calculators/fraction-calculator/'
    }
  ],

  hi: [
    {
      toolId:'broken-link-checker',
      slug:'broken-link-checker',
      name:'ब्रोकन लिंक चेकर',
      title:'Broken Link Checker — 404 लिंक और रीडायरेक्ट जाँचें',
      description:'किसी public web page के links जाँचें और working links, redirects, 404/410 तथा दूसरे HTTP errors को अलग-अलग देखें।',
      intro:'एक page का URL दें और देखें कि उसके visible links कहाँ सही खुलते हैं, कहाँ redirect होते हैं और कहाँ सच में dead end मिलता है।',
      benefits:['404/410 link detection','internal और external links अलग','redirects अलग report'],
      faq:[
        {q:'कौन-सा link broken माना जाता है?',a:'404 या 410 मजबूत broken-link signal है। 403, 429 और timeout जैसे cases अलग access/request error के रूप में दिखते हैं।'},
        {q:'क्या पूरा website crawl होता है?',a:'नहीं। यह tool submitted page से मिले unique links का bounded sample check करता है।'},
        {q:'क्या redirect भी broken link है?',a:'ज़रूरी नहीं। Redirect काम कर सकता है; उसे अलग दिखाया जाता है ताकि source link को final URL से update करना हो तो आप पहचान सकें।'}
      ],
      sections:[
        {title:'404 और access block को एक ही चीज़ मानना गलत है',body:'कई websites automated request को 403 या 429 दे सकती हैं जबकि normal browser में page खुलता है। इसलिए Toolmera true 404/410 को access errors से अलग रखता है और report को ज्यादा ईमानदार बनाता है।'},
        {title:'Migration के बाद quick spot-check के लिए उपयोगी',body:'URL बदलने, पुराना content हटाने या navigation edit करने के बाद एक landing page या article में पुराने links छूट सकते हैं। यह checker ऐसे छोटे लेकिन practical cleanup tasks के लिए बनाया गया है, full crawler बनने के लिए नहीं।'}
      ],
      englishUrl:'/website-analysis/broken-link-checker/'
    },
    {
      toolId:'schema-checker',
      slug:'schema-checker',
      name:'Schema Markup Checker',
      title:'Schema Markup Checker — JSON-LD structured data जाँचें',
      description:'Public page के JSON-LD blocks, @type values और JSON parse errors देखें और server HTML में मौजूद structured data समझें।',
      intro:'यह जाँचें कि page response में कौन-सा JSON-LD वास्तव में मौजूद है और कौन-सा block syntax की वजह से पढ़ा नहीं जा रहा।',
      benefits:['JSON-LD blocks detect करें','schema types की सूची','invalid JSON errors'],
      faq:[
        {q:'क्या यह Google Rich Results की eligibility बताता है?',a:'नहीं। यह JSON-LD presence, syntax और declared types जाँचता है; Google feature eligibility के लिए अलग requirements होती हैं।'},
        {q:'क्या @graph पढ़ा जाता है?',a:'हाँ। Parsed JSON-LD के @graph nodes में मौजूद @type भी निकाले जाते हैं।'},
        {q:'क्या JavaScript execute होता है?',a:'नहीं। यह server से मिले HTML response का JSON-LD पढ़ता है।'}
      ],
      sections:[
        {title:'पहले यह पक्का करें कि markup page तक पहुँचा भी है',body:'CMS या template change के बाद schema code source में दिख सकता है लेकिन public response में गायब या malformed हो सकता है। Checker इसी basic लेकिन जरूरी layer को साफ़ दिखाता है।'},
        {title:'Valid JSON और valid rich result एक ही बात नहीं हैं',body:'JSON parse होना केवल syntax की पुष्टि है। Product, Article या दूसरे search features के लिए required properties अलग हो सकती हैं, इसलिए Toolmera eligibility का झूठा green badge नहीं देता।'}
      ],
      englishUrl:'/website-analysis/schema-checker/'
    },
    {
      toolId:'dns-lookup',
      slug:'dns-lookup',
      name:'DNS Lookup',
      title:'DNS Lookup — A, AAAA, MX, TXT, CNAME और NS records देखें',
      description:'Public domain के मुख्य DNS records और TTL values देखें: A, AAAA, CNAME, MX, TXT और NS।',
      intro:'Domain किस server की ओर point कर रहा है, mail कहाँ route हो रही है और verification या nameserver records क्या लौट रहे हैं — एक जगह देखें।',
      benefits:['6 common DNS record types','TTL सहित result','public DoH resolver'],
      faq:[
        {q:'कौन से DNS records check होते हैं?',a:'A, AAAA, CNAME, MX, TXT और NS।'},
        {q:'TTL क्या बताता है?',a:'TTL बताता है कि resolver किसी DNS answer को कितने seconds cache कर सकता है।'},
        {q:'क्या इससे global propagation confirm हो जाती है?',a:'नहीं। यह एक public resolver का view है; दूसरे resolvers में cached answer कुछ समय अलग हो सकता है।'}
      ],
      sections:[
        {title:'Website, email और verification एक ही DNS record से नहीं चलते',body:'A/AAAA web addressing के लिए, MX mail routing के लिए, TXT policies और verification के लिए और NS authoritative DNS के लिए उपयोग होते हैं। अलग records को साथ देखकर troubleshooting तेज़ होती है।'},
        {title:'Propagation को प्रतिशत में दिखाना अक्सर भ्रामक होता है',body:'DNS caches अलग समय पर expire होते हैं। इसलिए Toolmera “100% propagated” जैसा अनुमान नहीं बनाता; वह वही public answer दिखाता है जो resolver ने इस request पर दिया।'}
      ],
      englishUrl:'/website-analysis/dns-lookup/'
    },
    {
      toolId:'tip',
      slug:'tip-calculator',
      name:'टिप कैलकुलेटर',
      title:'Tip Calculator — टिप, कुल बिल और प्रति व्यक्ति हिस्सा',
      description:'Bill amount, tip percentage और लोगों की संख्या से tip, final total, tip per person और total per person निकालें।',
      intro:'Bill बाँटने से पहले सारे numbers साफ़ देखें — tip percentage चुनें और group size के हिसाब से per-person amount तुरंत निकालें।',
      benefits:['tip amount तुरंत','per-person split','quick percentage presets'],
      faq:[
        {q:'20% tip कैसे निकालें?',a:'Bill को 0.20 से multiply करें। 80 के bill पर tip 16 और total 96 होगा।'},
        {q:'क्या bill कई लोगों में बाँट सकते हैं?',a:'हाँ। People field के आधार पर tip और final total दोनों का per-person amount मिलता है।'},
        {q:'क्या tool सही tip percentage recommend करता है?',a:'नहीं। Presets केवल calculation shortcuts हैं; tipping customs जगह और service के अनुसार बदलते हैं।'}
      ],
      sections:[
        {title:'सिर्फ tip नहीं, असली सवाल अक्सर “हर व्यक्ति कितना देगा?” होता है',body:'Group bill में total tip जानना पर्याप्त नहीं होता। इसलिए चार values साथ दिखाई जाती हैं ताकि किसी को अलग से calculator खोलकर total या share दोबारा न निकालना पड़े।'},
        {title:'Currency बदलने की जरूरत नहीं',body:'Calculation ratio-based है। आप रुपये, डॉलर, यूरो या किसी भी currency का bill डाल सकते हैं; बस input और result को उसी currency में समझें।'}
      ],
      englishUrl:'/calculators/tip-calculator/'
    },
    {
      toolId:'fraction',
      slug:'fraction-calculator',
      name:'फ्रैक्शन कैलकुलेटर',
      title:'Fraction Calculator — fractions जोड़ें, घटाएँ, गुणा और भाग करें',
      description:'दो fractions पर exact arithmetic करें, result simplify करें और mixed number तथा decimal भी देखें।',
      intro:'दो fractions और operation चुनें; Toolmera exact reduced fraction को पहले रखता है और decimal केवल अतिरिक्त representation के रूप में दिखाता है।',
      benefits:['चार operations','automatic simplification','mixed number + decimal'],
      faq:[
        {q:'Fraction simplify कैसे होता है?',a:'Numerator और denominator को उनके greatest common divisor से divide किया जाता है।'},
        {q:'क्या improper fraction mixed number में दिखता है?',a:'हाँ। जैसे 11/8 को साथ में 1 3/8 भी दिखाया जाता है।'},
        {q:'Denominator 0 क्यों नहीं हो सकता?',a:'Zero से division undefined है, इसलिए denominator 0 वाला fraction valid number नहीं है।'}
      ],
      sections:[
        {title:'Decimal से पहले exact fraction बचाना जरूरी है',body:'1/3 को 0.33 लिखते ही precision कम हो जाती है। Toolmera integer fraction arithmetic करता है, result को reduce करता है और उसके बाद decimal version दिखाता है।'},
        {title:'एक ही answer की तीन useful representations',body:'Exact fraction आगे की math के लिए अच्छा है, mixed number measurements में readable है और decimal कई practical inputs के लिए convenient है। इसलिए result को किसी एक format तक सीमित नहीं किया गया।'}
      ],
      englishUrl:'/calculators/fraction-calculator/'
    }
  ],

  ru: [
    {
      toolId:'broken-link-checker',
      slug:'proverka-bityh-ssylok',
      name:'Проверка битых ссылок',
      title:'Проверка битых ссылок — найти 404, 410 и редиректы',
      description:'Проверьте ссылки на публичной странице и отдельно увидьте рабочие адреса, редиректы, 404/410 и другие HTTP-ошибки.',
      intro:'Укажите URL страницы, чтобы быстро понять, какие ссылки действительно ведут в тупик, а какие просто перенаправляют или ограничивают автоматические запросы.',
      benefits:['Поиск 404 и 410','Разделение внутренних и внешних ссылок','Отдельный учёт редиректов'],
      faq:[
        {q:'Что считается битой ссылкой?',a:'404 и 410 — сильные признаки действительно несуществующего ресурса. 403, 429 и сетевые ошибки показываются отдельно.'},
        {q:'Инструмент обходит весь сайт?',a:'Нет. Он проверяет ограниченный набор уникальных ссылок именно с указанной страницы.'},
        {q:'Редирект — это ошибка?',a:'Не обязательно. Рабочий 301/302 может быть нормальным, но иногда исходную ссылку стоит обновить сразу на конечный URL.'}
      ],
      sections:[
        {title:'404 и блокировка бота — не одно и то же',body:'Если внешний сайт отвечает 403 или 429, это ещё не доказывает, что ссылка не работает для обычного посетителя. Поэтому отчёт не смешивает такие случаи с настоящими 404/410.'},
        {title:'Хороший сценарий — проверка после миграции или чистки контента',body:'После смены URL, удаления старых страниц или редизайна в меню и статьях часто остаются устаревшие адреса. Точечная проверка помогает быстро убрать такие хвосты без запуска тяжёлого полного краулера.'}
      ],
      englishUrl:'/website-analysis/broken-link-checker/'
    },
    {
      toolId:'schema-checker',
      slug:'proverka-schema-markup',
      name:'Проверка Schema Markup',
      title:'Schema Markup Checker — проверить JSON-LD и структурированные данные',
      description:'Найдите JSON-LD на публичной странице, проверьте синтаксис и посмотрите заявленные @type без ложных обещаний Rich Results.',
      intro:'Посмотрите, какое JSON-LD реально пришло в HTML-ответе страницы и какие блоки невозможно разобрать из-за синтаксической ошибки.',
      benefits:['Поиск JSON-LD блоков','Список schema @type','Ошибки JSON-парсинга'],
      faq:[
        {q:'Проверяется ли право на Google Rich Results?',a:'Нет. Инструмент проверяет наличие JSON-LD, синтаксис и типы. Для Rich Results у Google есть отдельные требования.'},
        {q:'Поддерживается ли @graph?',a:'Да. Типы внутри @graph также попадают в общий список.'},
        {q:'Выполняется ли JavaScript страницы?',a:'Нет. Проверяется JSON-LD в серверном HTML-ответе.'}
      ],
      sections:[
        {title:'Сначала нужно убедиться, что разметка вообще дошла до публичной страницы',body:'После обновления CMS или шаблона schema может исчезнуть из ответа или превратиться в невалидный JSON. Такой базовый сбой важнее обсуждения обязательных полей конкретного типа — и его как раз удобно увидеть первым.'},
        {title:'Корректный JSON ещё не означает корректный поисковый feature',body:'Блок может прекрасно парситься, но не иметь полей, необходимых Google для Product, Article или другого результата. Поэтому Toolmera честно отделяет синтаксис от поисковой eligibility.'}
      ],
      englishUrl:'/website-analysis/schema-checker/'
    },
    {
      toolId:'dns-lookup',
      slug:'dns-lookup',
      name:'DNS Lookup',
      title:'DNS Lookup — проверить A, AAAA, MX, TXT, CNAME и NS',
      description:'Посмотрите публичные DNS-записи домена и TTL для A, AAAA, CNAME, MX, TXT и NS.',
      intro:'Проверьте, куда указывает домен, какие серверы принимают почту и какие TXT или NS записи сейчас видит внешний DNS-резолвер.',
      benefits:['6 основных типов DNS-записей','TTL для каждого ответа','Внешний DNS-over-HTTPS запрос'],
      faq:[
        {q:'Какие записи проверяются?',a:'A, AAAA, CNAME, MX, TXT и NS.'},
        {q:'Что такое TTL?',a:'Это время в секундах, в течение которого DNS-резолвер может хранить ответ в кэше.'},
        {q:'Показывает ли это полную DNS-пропагацию?',a:'Нет. Это ответ одного публичного резолвера; другие кэши временно могут видеть другое значение.'}
      ],
      sections:[
        {title:'Одна доменная проблема может находиться совсем не в той записи, которую вы проверяете',body:'Сайт обычно зависит от A/AAAA/CNAME, почта — от MX, подтверждение домена и SPF — от TXT, а делегирование — от NS. Поэтому быстрый обзор всех этих типов удобнее, чем проверять их по одному в разных сервисах.'},
        {title:'TTL — не таймер до магического момента полной пропагации',body:'DNS меняется через множество независимых кэшей. Toolmera показывает фактический ответ внешнего резолвера и не рисует искусственный процент “готовности”, которого DNS-протокол не обещает.'}
      ],
      englishUrl:'/website-analysis/dns-lookup/'
    },
    {
      toolId:'tip',
      slug:'kalkulyator-chaevyh',
      name:'Калькулятор чаевых',
      title:'Калькулятор чаевых — сумма чаевых, общий счёт и сумма на человека',
      description:'Рассчитайте чаевые, итоговый счёт, чаевые на человека и общую сумму на человека по проценту и размеру компании.',
      intro:'Введите сумму счёта, выберите процент чаевых и количество людей — все итоговые значения появятся рядом, без ручного деления.',
      benefits:['Сумма чаевых','Разделение счёта на людей','Быстрые проценты'],
      faq:[
        {q:'Как посчитать 20% чаевых?',a:'Умножьте счёт на 0,20. Для счёта 80 чаевые составят 16, а итог — 96.'},
        {q:'Можно разделить счёт на компанию?',a:'Да. Инструмент отдельно показывает чаевые на человека и итоговую сумму на человека.'},
        {q:'Какой процент чаевых правильный?',a:'Инструмент не даёт рекомендаций по этикету. Быстрые проценты нужны только для расчёта.'}
      ],
      sections:[
        {title:'В компании важен не только процент, но и понятная сумма для каждого',body:'Обычный процентный калькулятор даст размер чаевых, но при общем счёте всё равно придётся делить результат вручную. Здесь сразу видны и общая сумма, и обе величины на человека.'},
        {title:'Калькулятор не привязан к валюте',body:'Формула одинакова для евро, долларов, гривен, рублей или другой валюты. Просто воспринимайте все денежные поля в одной и той же валюте.'}
      ],
      englishUrl:'/calculators/tip-calculator/'
    },
    {
      toolId:'fraction',
      slug:'kalkulyator-drobey',
      name:'Калькулятор дробей',
      title:'Калькулятор дробей — сложение, вычитание, умножение и деление',
      description:'Выполняйте действия с двумя дробями и получайте сокращённый результат, смешанное число и десятичное значение.',
      intro:'Введите две дроби и выберите действие — Toolmera сначала сохраняет точный дробный результат, сокращает его и только затем показывает десятичную форму.',
      benefits:['4 арифметических действия','Автоматическое сокращение','Дробь, смешанное число и decimal'],
      faq:[
        {q:'Как сокращается дробь?',a:'Числитель и знаменатель делятся на их наибольший общий делитель.'},
        {q:'Показывается ли смешанное число?',a:'Да. Например, 11/8 дополнительно будет показано как 1 3/8.'},
        {q:'Почему знаменатель не может быть равен нулю?',a:'Деление на ноль не определено, поэтому такая дробь не имеет корректного числового значения.'}
      ],
      sections:[
        {title:'Точная дробь полезнее раннего округления',body:'Если сразу заменить 1/3 на 0,33, точность уже потеряна. Поэтому расчёт идёт в целых числителях и знаменателях, затем дробь сокращается, и только после этого выводится decimal.'},
        {title:'Неправильная дробь и смешанное число решают разные задачи',body:'11/8 удобно использовать в дальнейших формулах, а 1 3/8 легче читать в бытовых измерениях. Инструмент показывает обе формы рядом, а не заставляет выбирать одну.'}
      ],
      englishUrl:'/calculators/fraction-calculator/'
    }
  ]
};
