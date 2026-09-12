export type CategoryHubLink={
  id:string;
  anchor:string;
};

export type CategoryHubEnhancement={
  popular:CategoryHubLink[];
  faq:{q:string;a:string}[];
};

export const categoryHubEnhancements:Record<string,CategoryHubEnhancement>={
  'website-analysis':{
    popular:[
      {id:'website-traffic-checker',anchor:'check website traffic and popularity signals'},
      {id:'sitemap-checker',anchor:'validate an XML sitemap and inspect submitted URLs'},
      {id:'redirect-checker',anchor:'trace website redirects and 301 chains'},
      {id:'website-analyzer',anchor:'run a broader web page SEO and technical audit'},
      {id:'meta-tag-checker',anchor:'check title tags, meta descriptions and canonical tags'},
    ],
    faq:[
      {q:'Which free website analysis tool should I start with?',a:'Use Website Analyzer for a broad first pass. If you already know the problem, use a specialist checker such as Sitemap Checker, Redirect Checker, Meta Tag Checker or HTTP Status Checker so the report stays focused.'},
      {q:'Can these tools check any website?',a:'They are designed for publicly reachable HTTP or HTTPS pages and files. Private networks, local addresses and protected resources cannot be analyzed as normal public websites.'},
      {q:'Does a website analysis score guarantee better Google rankings?',a:'No. Technical and on-page checks can reveal issues and opportunities, but rankings also depend on search intent, content quality, competition, links, freshness and many other signals.'},
      {q:'Is a sitemap checker the same as Google Search Console indexing data?',a:'No. A sitemap checker validates the live XML structure and URLs it can read. Search Console shows Google-specific crawling and indexing information for sites you control.'},
    ],
  },
  calculators:{
    popular:[
      {id:'percentage',anchor:'calculate percentage gain, increase, decrease and change'},
      {id:'compound',anchor:'model compound interest and long-term growth'},
      {id:'loan',anchor:'calculate loan payments and amortization'},
      {id:'average',anchor:'calculate mean, median, mode and range'},
    ],
    faq:[
      {q:'Are Toolmera calculators free to use?',a:'Yes. The core calculators are free and do not require an account.'},
      {q:'Which calculator should I use for percentage gain or percentage change?',a:'Use Percentage Calculator. It includes percent-of-number, increase or decrease, percentage change and percentage difference workflows.'},
      {q:'What is the difference between simple and compound interest calculators?',a:'Simple interest applies interest to the original principal only. Compound interest periodically adds accumulated interest to the balance, so future interest can also be earned on prior interest.'},
      {q:'Can financial or health calculators replace professional advice?',a:'No. They are calculation and screening utilities. Real financial, medical, tax or contractual decisions can require additional assumptions and professional guidance.'},
    ],
  },
  converters:{
    popular:[
      {id:'volume',anchor:'convert cups to mL, liters, gallons and fluid ounces'},
      {id:'speed',anchor:'convert MPH, KM/H, M/S and knots'},
      {id:'length',anchor:'convert metric and imperial length units'},
      {id:'weight',anchor:'convert kilograms, pounds, ounces and stone'},
    ],
    faq:[
      {q:'Can I convert metric and imperial units with Toolmera?',a:'Yes. The converter collection includes metric, US customary and Imperial units where they are relevant, with the unit system kept visible in the interface.'},
      {q:'Are US and UK volume units treated as the same?',a:'No. US customary and UK Imperial gallons, pints and fluid ounces have different definitions, so Toolmera labels and converts them separately.'},
      {q:'Which converter should I use for MPH to KM/H?',a:'Use Speed Converter. It supports miles per hour, kilometers per hour, meters per second, feet per second and knots.'},
      {q:'Why does Toolmera use separate converter pages instead of one huge converter?',a:'Separate pages keep the supported units, reference factors, examples and search intent specific to one measurement domain, which also makes each workflow easier to scan.'},
    ],
  },
  text:{
    popular:[
      {id:'remove-duplicate-lines',anchor:'remove duplicate lines from a list or block of text'},
      {id:'word-counter',anchor:'count words, sentences, paragraphs and reading time'},
      {id:'case-converter',anchor:'convert text case and developer naming styles'},
      {id:'text-diff',anchor:'compare two text versions and find differences'},
    ],
    faq:[
      {q:'What is the fastest way to remove duplicate lines online?',a:'Use Remove Duplicate Lines. You can control case sensitivity, trimming, blank-line handling and sorting while keeping the first occurrence of each unique line.'},
      {q:'Are Toolmera text tools processed in the browser?',a:'The current text cleanup, counting and transformation workflows run in the browser, so ordinary text does not need to be sent to a Toolmera processing server.'},
      {q:'What is the difference between Word Counter and Character Counter?',a:'Word Counter focuses on words, sentences, paragraphs and reading-time estimates. Character Counter is better when exact character length, whitespace or byte length matters.'},
      {q:'Can I sort lines after removing duplicates?',a:'Yes. Remove Duplicate Lines has sorting controls, and the dedicated Sort Lines tool is available when ordering itself is the main task.'},
    ],
  },
  image:{
    popular:[
      {id:'compress-jpg',anchor:'make a JPG file smaller while keeping JPG output'},
      {id:'compress-image',anchor:'compress JPG, PNG or WebP images online'},
      {id:'resize-image',anchor:'resize an image to exact pixel dimensions'},
      {id:'png-webp',anchor:'convert PNG images to smaller WebP files'},
    ],
    faq:[
      {q:'Should I resize or compress an image first?',a:'If the image dimensions are much larger than the final display size, resize first and compress afterward. Reducing unnecessary pixels usually creates a better final file-size result.'},
      {q:'Can I make a JPG smaller without converting it to another format?',a:'Yes. Compress JPG keeps the output as JPG and gives you a quality control plus a before-and-after file-size comparison.'},
      {q:'Which image format should I use for transparency?',a:'PNG and WebP can preserve transparent areas. JPG cannot, so transparent pixels need to be replaced with a solid background when exporting to JPG.'},
      {q:'Do Toolmera image tools upload my files?',a:'The current image conversion, crop, resize and compression workflows process files locally in the browser.'},
    ],
  },
};
