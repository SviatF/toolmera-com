import type { Tool } from '@/data/tools';

export type HowToStep={title:string;description:string};

const graph:Record<string,string[]>={
  // Image — conversion, optimization and editing micro-clusters.
  'png-webp':['jpg-webp','webp-png','compress-png','compress-image','resize-image','crop-image'],
  'jpg-webp':['png-webp','webp-jpg','compress-jpg','compress-image','resize-image','crop-image'],
  'webp-png':['png-webp','webp-jpg','png-jpg','compress-image'],
  'webp-jpg':['jpg-webp','webp-png','png-jpg','compress-image'],
  'jpg-png':['png-jpg','jpg-webp','compress-jpg','resize-image'],
  'png-jpg':['jpg-png','png-webp','compress-png','resize-image'],
  'heic-jpg':['jpg-webp','jpg-png','compress-jpg','resize-image'],
  'compress-image':['compress-jpg','compress-png','resize-image','crop-image','png-webp','jpg-webp'],
  'compress-jpg':['jpg-webp','compress-image','resize-image','crop-image'],
  'compress-png':['png-webp','compress-image','resize-image','crop-image'],
  'resize-image':['crop-image','compress-image','png-webp','jpg-webp'],
  'crop-image':['resize-image','compress-image','png-webp','jpg-webp'],

  // PDF — deliberately dense because the tasks form one workflow.
  'merge-pdf':['split-pdf','remove-pdf-pages','rotate-pdf','jpg-pdf','png-pdf'],
  'split-pdf':['merge-pdf','remove-pdf-pages','rotate-pdf','pdf-jpg'],
  'jpg-pdf':['png-pdf','merge-pdf','pdf-jpg','rotate-pdf'],
  'png-pdf':['jpg-pdf','merge-pdf','pdf-jpg','rotate-pdf'],
  'pdf-jpg':['jpg-pdf','png-pdf','split-pdf','rotate-pdf'],
  'rotate-pdf':['merge-pdf','split-pdf','remove-pdf-pages','pdf-jpg'],
  'remove-pdf-pages':['split-pdf','merge-pdf','rotate-pdf','pdf-jpg'],

  // Calculators — semantic sub-clusters instead of category-order fallback.
  'age':['date-difference','unix-timestamp'],
  'date-difference':['age','unix-timestamp'],
  'bmi':['age'],
  'percentage':['discount','roi','average','gst-in'],
  'discount':['percentage','average','gst-in'],
  'average':['percentage','discount'],
  'loan':['simple-interest','compound','roi','percentage'],
  'simple-interest':['loan','compound','percentage'],
  'compound':['loan','simple-interest','cagr','roi'],
  'cagr':['roi','compound','percentage'],
  'roi':['cagr','compound','percentage','loan'],

  // Unit converters.
  'length':['area','volume','weight','temperature'],
  'area':['length','volume','weight'],
  'volume':['weight','area','length','temperature'],
  'weight':['volume','length','area'],
  'temperature':['length','volume','speed'],
  'speed':['length','temperature','data-storage'],
  'data-storage':['speed','base64','json'],
  'color':['png-webp','jpg-png','json'],

  // Generators / text / developer / time.
  'qr-code':['uuid','base64','case-converter'],
  'uuid':['json','base64','password'],
  'password':['uuid','random-number'],
  'random-number':['average','password','percentage'],
  'unix-timestamp':['time-zone','date-difference','age','json'],
  'time-zone':['unix-timestamp','date-difference','age'],
  'word-counter':['case-converter','slug'],
  'case-converter':['word-counter','slug','base64'],
  'slug':['case-converter','word-counter','url-encoder'],
  'json':['jwt','base64','uuid'],
  'base64':['jwt','json','uuid','qr-code'],
  'url-encoder':['base64','slug','json'],
  'jwt':['json','base64','url-encoder'],


  'character-counter':['word-counter','case-converter','slug'],
  'remove-duplicate-lines':['sort-lines','text-diff','word-counter','case-converter'],
  'sort-lines':['remove-duplicate-lines','case-converter','text-diff'],
  'text-diff':['remove-duplicate-lines','word-counter','json'],
  'json-csv':['json','xml-formatter','base64'],
  'xml-formatter':['json','json-csv','url-encoder'],
  'date-calculator':['date-difference','time-duration','time-zone','age'],
  'time-duration':['date-difference','date-calculator','time-zone','unix-timestamp'],

  // Website analysis — one audit workflow with specialist intent pages.
  'website-analyzer':['website-traffic-checker','seo-checker','meta-tag-checker','http-status-checker','redirect-checker','robots-checker','sitemap-checker','security-headers-checker','technology-checker'],
  'website-traffic-checker':['website-analyzer','seo-checker','technology-checker','http-status-checker'],
  'seo-checker':['website-analyzer','website-traffic-checker','meta-tag-checker','robots-checker','sitemap-checker','http-status-checker'],
  'meta-tag-checker':['seo-checker','website-analyzer','http-status-checker','redirect-checker'],
  'http-status-checker':['redirect-checker','ssl-checker','seo-checker','website-analyzer'],
  'redirect-checker':['http-status-checker','ssl-checker','website-analyzer','seo-checker'],
  'robots-checker':['sitemap-checker','seo-checker','website-analyzer','http-status-checker'],
  'sitemap-checker':['robots-checker','seo-checker','website-analyzer','http-status-checker'],
  'ssl-checker':['security-headers-checker','redirect-checker','http-status-checker','website-analyzer'],
  'security-headers-checker':['ssl-checker','website-analyzer','http-status-checker','technology-checker'],
  'technology-checker':['website-analyzer','security-headers-checker','meta-tag-checker','seo-checker'],

  // India finance/tax — local cluster plus relevant global bridges.
  'emi-in':['home-emi-in','car-emi-in','loan','simple-interest','percentage'],
  'home-emi-in':['emi-in','car-emi-in','loan','compound','percentage'],
  'car-emi-in':['emi-in','home-emi-in','loan','percentage'],
  'sip-in':['cagr','roi','compound','fd-in','percentage'],
  'fd-in':['compound','simple-interest','sip-in','cagr'],
  'gst-in':['percentage','discount','emi-in','sip-in'],
};

export function semanticRelatedTools(tool:Tool,allTools:Tool[],limit=4){
  const ids=graph[tool.id]||[];
  return ids
    .map(id=>allTools.find(item=>item.id===id))
    .filter((item):item is Tool=>item!==undefined)
    .filter(item=>item.id!==tool.id)
    .slice(0,limit);
}

export function howToForTool(tool:Tool):HowToStep[]{
  const input=tool.name.split(' to ')[0];
  const output=tool.name.includes(' to ')?tool.name.split(' to ')[1]:tool.name;

  if(tool.kind==='image-convert')return[
    {title:`Add your ${input} files`,description:'Choose files or drag and drop them into the tool. You can queue up to four images in one batch.'},
    {title:`Convert to ${output}`,description:'Review the output settings, then run the conversion locally in your browser.'},
    {title:'Download each result',description:'Compare the before-and-after size and download the converted files you need.'},
  ];
  if(['image-compress','image-compress-jpg','image-compress-png'].includes(tool.kind))return[
    {title:'Add up to four images',description:'Choose files or drag and drop them into the batch area.'},
    {title:'Set compression options',description:'Choose the available quality or palette setting and start processing.'},
    {title:'Compare and download',description:'Review each output size and download the compressed files individually.'},
  ];
  if(tool.kind==='image-resize')return[
    {title:'Choose an image',description:'Add a JPG, PNG, WebP or other browser-readable image.'},
    {title:'Set the dimensions',description:'Enter the target width or height while Toolmera keeps the source aspect ratio.'},
    {title:'Resize and download',description:'Create the resized image locally and download the new file.'},
  ];
  if(tool.kind==='image-crop')return[
    {title:'Open an image',description:'Choose a JPG, PNG or WebP image from your device.'},
    {title:'Select the crop area',description:'Drag over the preview or choose an aspect-ratio preset.'},
    {title:'Export the crop',description:'Create a new image from the selected region and download it.'},
  ];
  if(tool.kind==='heic-convert')return[
    {title:'Add HEIC or HEIF photos',description:'Choose or drag in up to four iPhone-style image files.'},
    {title:'Choose JPG or PNG',description:'Select the output format and JPG quality when applicable.'},
    {title:'Convert and download',description:'Decode the files locally and download each converted image.'},
  ];
  if(tool.kind==='pdf-merge')return[
    {title:'Add PDF files',description:'Choose multiple PDFs and arrange them in the order you want.'},
    {title:'Merge the pages',description:'Toolmera copies the PDF pages into a new document in that sequence.'},
    {title:'Download one PDF',description:'Save the combined document without modifying your originals.'},
  ];
  if(tool.kind==='pdf-split')return[
    {title:'Choose a PDF',description:'Open the document you want to extract pages from.'},
    {title:'Enter a page range',description:'Specify one continuous range such as 4-9.'},
    {title:'Create the extract',description:'Download a new PDF containing only the selected pages.'},
  ];
  if(tool.kind==='images-to-pdf')return[
    {title:'Add image files',description:'Choose multiple images and arrange their output order.'},
    {title:'Create the PDF',description:'Each image becomes a PDF page sized to its own dimensions.'},
    {title:'Download the document',description:'Save the finished PDF while your source images stay unchanged.'},
  ];
  if(['pdf-to-image','pdf-rotate','pdf-remove-pages'].includes(tool.kind))return[
    {title:'Open the PDF',description:'Choose the source document from your device.'},
    {title:'Choose the pages and options',description:'Select the page range, rotation or removal settings required by this tool.'},
    {title:'Process and download',description:'Create a new output file locally and download the result.'},
  ];
  if(tool.id==='car-emi-in')return[
    {title:'Enter vehicle price and down payment',description:'Toolmera subtracts the down payment to estimate the financed principal.'},
    {title:'Add rate and tenure',description:'Enter the annual loan rate and repayment period for the fixed-rate scenario.'},
    {title:'Compare EMI and total cost',description:'Review financed amount, monthly EMI, total interest and total repayment.'},
  ];
  if(tool.id==='home-emi-in')return[
    {title:'Enter the home-loan amount',description:'Use the principal you expect to finance, not the property value unless they are the same.'},
    {title:'Set rate and tenure',description:'Enter the annual rate and repayment period for the constant-rate scenario.'},
    {title:'Review EMI and amortization',description:'Compare monthly EMI, total interest and the year-by-year outstanding balance.'},
  ];
  if(tool.id==='emi-in')return[
    {title:'Enter loan principal',description:'Use the amount you expect to borrow.'},
    {title:'Set annual rate and tenure',description:'Toolmera converts the annual rate to a monthly reducing-balance calculation.'},
    {title:'Review EMI and repayment',description:'See monthly EMI, total interest, total repayment and the amortization overview.'},
  ];
  if(tool.id==='sip-in')return[
    {title:'Enter the monthly SIP',description:'Set the contribution amount you want to model each month.'},
    {title:'Set expected return and duration',description:'Use an assumed annual return and investment period for the scenario.'},
    {title:'Review invested amount and projection',description:'Compare total contributions with modeled growth and projected future value.'},
  ];
  if(tool.id==='fd-in')return[
    {title:'Enter the deposit and rate',description:'Use the principal and contracted annual rate from the deposit product you are comparing.'},
    {title:'Choose term and compounding',description:'Select the duration and the compounding frequency stated by the product.'},
    {title:'Review maturity and interest',description:'Compare principal, modeled interest earned and estimated maturity value.'},
  ];
  if(tool.id==='gst-in')return[
    {title:'Choose Add GST or Remove GST',description:'Select whether your starting amount is before tax or already GST-inclusive.'},
    {title:'Enter amount and GST rate',description:'Use a preset or enter the percentage applicable to your scenario.'},
    {title:'Review base, tax and total',description:'Toolmera separates the base value, GST component and GST-inclusive total.'},
  ];
  if(tool.kind==='json-formatter')return[
    {title:'Paste your JSON',description:'Enter or paste the JSON payload you want to inspect.'},
    {title:'Format or minify',description:'Validate the syntax and choose the output formatting you need.'},
    {title:'Copy the result',description:'Copy the formatted or minified JSON into your next workflow.'},
  ];
  if(tool.kind==='base64')return[
    {title:'Enter text or Base64',description:'Paste the UTF-8 text or encoded value you want to transform.'},
    {title:'Choose encode or decode',description:'Run the operation locally using standard Base64 or Base64URL.'},
    {title:'Copy the output',description:'Use the transformed text immediately in your next task.'},
  ];
  if(tool.kind==='word-counter')return[
    {title:'Paste your text',description:'Enter the draft, article or copy you want to measure.'},
    {title:'Review the counts',description:'See words, characters, sentences, paragraphs and reading time instantly.'},
    {title:'Keep editing',description:'Update the text and the statistics refresh automatically.'},
  ];
  if(tool.kind==='case-converter')return[
    {title:'Paste your text',description:'Enter the text or identifier you want to transform.'},
    {title:'Choose a case style',description:'Apply uppercase, title case, camelCase, snake_case or another supported style.'},
    {title:'Copy the result',description:'Copy the transformed output with one click.'},
  ];
  if(tool.kind==='time-zone')return[
    {title:'Choose the source time zone',description:'Enter the wall-clock date and time and select the IANA zone where that local time occurs.'},
    {title:'Choose the destination zone',description:'Select the time zone you want to compare and swap the two zones when needed.'},
    {title:'Read the converted instant',description:'Toolmera shows source time, converted destination time and the matching UTC / ISO value.'},
  ];
  if(tool.kind==='url-encoder')return[
    {title:'Choose URL component or full URL',description:'Component mode encodes values such as query parameters; full URL mode preserves URL syntax where appropriate.'},
    {title:'Paste the value',description:'Enter plain text to encode or percent-encoded text to decode.'},
    {title:'Encode, decode and copy',description:'Run the browser-native operation and copy the output into your next workflow.'},
  ];
  if(tool.kind==='slug-generator')return[
    {title:'Enter a title or phrase',description:'Paste the text you want to turn into a URL-friendly slug.'},
    {title:'Choose separator and Unicode behavior',description:'Use hyphens or underscores and decide whether native-script letters should be preserved.'},
    {title:'Copy the generated slug',description:'Review the cleaned lowercase result and copy it into your CMS or routing configuration.'},
  ];
  if(tool.kind==='jwt-decoder')return[
    {title:'Paste a compact JWT',description:'Enter the three-part token you want to inspect.'},
    {title:'Decode header and payload',description:'Toolmera Base64URL-decodes the first two parts and formats their JSON locally.'},
    {title:'Inspect claims without trusting them',description:'Review exp, iat and nbf timestamps while remembering that this tool does not verify the token signature.'},
  ];
  if(tool.kind==='color-converter')return[
    {title:'Choose HEX, RGB or HSL',description:'Select the color model that matches your starting value.'},
    {title:'Enter the color',description:'Provide a valid color value and check the live preview.'},
    {title:'Copy the equivalent formats',description:'Use the generated HEX, RGB or HSL value in CSS, design tools or code.'},
  ];
  if(tool.kind==='data-storage')return[
    {title:'Choose decimal or binary units',description:'Use SI for KB/MB/GB or IEC for KiB/MiB/GiB so the unit definition is explicit.'},
    {title:'Enter the storage value',description:'Select the source and target units and type the size you want to convert.'},
    {title:'Compare every unit',description:'Read the selected conversion and the full same-system unit matrix.'},
  ];
  if(['unit-length','unit-temperature','unit-weight','unit-volume','unit-area','unit-speed'].includes(tool.kind))return[
    {title:'Enter a measurement',description:'Type the value and select the source unit.'},
    {title:'Choose the target unit',description:'Select the unit you want to convert into or use a quick pair.'},
    {title:'Read the conversion',description:'The result and available comparison values update immediately.'},
  ];

  if(tool.kind==='character-counter')return[
    {title:'Paste or type text',description:'Enter the text whose visible length, whitespace and encoded size you want to measure.'},
    {title:'Review each count',description:'Compare characters, non-whitespace characters, words, lines and UTF-8 bytes.'},
    {title:'Use the metric that matches the limit',description:'Choose character count for writing constraints or byte count when a system limit is defined in bytes.'},
  ];
  if(tool.kind==='remove-duplicate-lines')return[
    {title:'Paste one item per line',description:'Add the list, IDs, URLs, keywords or other line-based text you want to clean.'},
    {title:'Choose matching rules',description:'Set case sensitivity, whitespace trimming, blank-line behavior and optional sorting.'},
    {title:'Copy the unique list',description:'Review how many lines were removed and copy the deduplicated output.'},
  ];
  if(tool.kind==='sort-lines')return[
    {title:'Paste the lines',description:'Enter the list or text block you want to reorder.'},
    {title:'Set the sort behavior',description:'Choose A–Z or Z–A, natural numeric ordering, case behavior and blank-line handling.'},
    {title:'Copy the sorted result',description:'Review the reordered lines and copy the output.'},
  ];
  if(tool.kind==='text-diff')return[
    {title:'Paste the original and changed text',description:'Put the earlier version on the left and the newer version on the right.'},
    {title:'Review line-level changes',description:'Added, removed and unchanged lines are aligned with a browser-side LCS diff.'},
    {title:'Copy the comparison',description:'Copy the prefixed diff when you need it in a review, ticket or note.'},
  ];
  if(tool.kind==='json-to-csv')return[
    {title:'Paste a JSON object or array',description:'Use structured object data such as an API response or export.'},
    {title:'Choose CSV options',description:'Select a delimiter and decide whether nested objects should become dotted columns.'},
    {title:'Copy or download CSV',description:'Convert the data, then copy the table or download the CSV file.'},
  ];
  if(tool.kind==='xml-formatter')return[
    {title:'Paste the XML document',description:'Enter compact or inconsistently formatted XML.'},
    {title:'Choose indentation and format',description:'Toolmera validates well-formedness with the browser XML parser before formatting.'},
    {title:'Review and copy the XML',description:'Inspect the normalized serialization and copy it when it matches your workflow.'},
  ];
  if(tool.kind==='date-calculator')return[
    {title:'Choose a starting date',description:'Set the calendar date you want to move forward or backward from.'},
    {title:'Add or subtract calendar units',description:'Enter years, months, weeks and days and choose the direction.'},
    {title:'Review the resulting date',description:'Toolmera clamps month changes to valid calendar days and shows the final weekday.'},
  ];
  if(tool.kind==='time-duration')return[
    {title:'Enter start and end date-times',description:'Use local date-time values with the end after the start.'},
    {title:'Calculate elapsed time',description:'Toolmera measures the interval in milliseconds and decomposes it into calendar-day-sized blocks, hours, minutes and seconds.'},
    {title:'Review total units',description:'Use the breakdown or the total hours, minutes and seconds shown below it.'},
  ];


  if(tool.kind==='website-analysis'){
    const steps:Record<string,HowToStep[]>={
      'website-analyzer':[
        {title:'Enter a public website URL',description:'Paste the homepage or specific page you want to audit. Toolmera accepts public HTTP and HTTPS URLs only.'},
        {title:'Run the live website analysis',description:'Toolmera fetches the public response and checks metadata, headings, crawl files, security headers, redirects and supported technology fingerprints.'},
        {title:'Prioritize the report',description:'Start with failed crawl or indexability checks, then review on-page SEO, security and technology details.'},
      ],
      'website-traffic-checker':[
        {title:'Enter a website or competitor domain',description:'Paste a public homepage or domain. Toolmera normalizes the hostname and checks the public popularity dataset for recent rank history.'},
        {title:'Read the latest and 30-day traffic popularity signals',description:'Compare the latest popularity rank with the 30-day average, best rank, worst rank and net movement. Lower rank numbers indicate stronger relative popularity.'},
        {title:'Use the rank as a traffic proxy, not a visit counter',description:'Treat the result as comparative public popularity data. It is not Google Analytics, does not reveal private sessions, and does not fabricate monthly visit totals.'},
      ],
      'seo-checker':[
        {title:'Paste the page you want to audit',description:'Use the exact live URL whose on-page and technical SEO signals you want to inspect.'},
        {title:'Check SEO and crawl signals',description:'Review title, description, H1, canonical, robots directives, image ALT coverage, schema, robots.txt and sitemap availability.'},
        {title:'Separate observable issues from search performance',description:'Fix verifiable page problems here, then use Search Console for index status, queries, impressions and rankings.'},
      ],
      'meta-tag-checker':[
        {title:'Enter the production page URL',description:'Analyze the live page rather than relying only on CMS preview fields.'},
        {title:'Inspect SEO and social metadata',description:'Check title, description, canonical, robots, viewport, Open Graph and Twitter Card values returned in the HTML.'},
        {title:'Correct stale or missing tags',description:'Update the source template or CMS, deploy the change and run the checker again against the final URL.'},
      ],
      'http-status-checker':[
        {title:'Enter the URL to test',description:'Use the exact HTTP or HTTPS address that users, crawlers or integrations request.'},
        {title:'Check the final response',description:'Toolmera follows a bounded redirect chain and reports status, destination, timing, content type and selected headers.'},
        {title:'Match the status to the intended behavior',description:'Confirm that live content returns success, moved URLs redirect correctly and removed or broken URLs return the expected error response.'},
      ],
      'redirect-checker':[
        {title:'Paste the starting URL',description:'Use the old, campaign, HTTP or alternate URL whose redirect behavior you want to trace.'},
        {title:'Follow every redirect hop',description:'Review each 3xx response, Location destination and the final status.'},
        {title:'Shorten unnecessary chains',description:'Where practical, update redirects and internal links so they point directly to the intended final canonical URL.'},
      ],
      'robots-checker':[
        {title:'Enter the site URL',description:'Toolmera derives the origin and requests the root robots.txt file.'},
        {title:'Review crawler directives',description:'Check status, User-agent groups, Allow and Disallow counts, broad wildcard blocking and declared Sitemap lines.'},
        {title:'Verify risky rules in context',description:'Read the file preview before changing production crawl rules, especially any Disallow pattern affecting large sections.'},
      ],
      'sitemap-checker':[
        {title:'Enter the website origin',description:'Toolmera looks for a same-origin sitemap declared in robots.txt and otherwise checks the conventional sitemap.xml path.'},
        {title:'Inspect XML structure and counts',description:'See whether the file is a URL set or sitemap index, how many entries it contains and whether lastmod tags are present.'},
        {title:'Spot-check submitted URLs',description:'Review the sample loc values for the expected canonical host and path structure, then validate indexing separately in Search Console.'},
      ],
      'ssl-checker':[
        {title:'Enter the website URL',description:'Use the public host whose HTTPS and transport behavior you want to verify.'},
        {title:'Check HTTPS and HSTS',description:'Toolmera confirms the final secure scheme, tests HTTP-to-HTTPS redirect behavior and reports Strict-Transport-Security when present.'},
        {title:'Review transport gaps honestly',description:'Use the verified HTTPS signals here and a certificate-specific service when you need issuer, chain or expiry metadata.'},
      ],
      'security-headers-checker':[
        {title:'Enter a public page URL',description:'Choose a representative production URL served through the same CDN or reverse proxy as the site.'},
        {title:'Inspect six baseline headers',description:'Check HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy values.'},
        {title:'Test changes before enforcing them',description:'Add or tighten headers carefully, especially CSP, then rerun the live check after deployment.'},
      ],
      'technology-checker':[
        {title:'Enter the site or page URL',description:'Use a public page that is likely to include the site’s normal framework, analytics and integration markup.'},
        {title:'Scan public fingerprints',description:'Toolmera checks HTML and headers for supported CMS, framework, CDN, analytics and marketing signatures.'},
        {title:'Treat detections as evidence, not private access',description:'Confirm important stack decisions separately because hidden or client-injected technologies may not expose recognizable public markers.'},
      ],
    };
    return steps[tool.id]||[
      {title:'Enter a public URL',description:'Paste the website or page you want to analyze.'},
      {title:'Run the live check',description:'Toolmera fetches bounded public response data relevant to this checker.'},
      {title:'Review the evidence',description:'Use the returned values and stated limitations before changing production configuration.'},
    ];
  }

  if(tool.kind==='percentage')return[
    {title:'Choose the percentage question',description:'Select part of a total, percent of a number, change or percentage difference.'},
    {title:'Enter the known values',description:'Fill in the two values required by the selected formula.'},
    {title:'Read the result and formula',description:'Toolmera shows the percentage together with the calculation used.'},
  ];
  if(tool.kind==='age')return[
    {title:'Enter the date of birth',description:'Choose the starting calendar date.'},
    {title:'Choose the comparison date',description:'Use today or any other valid date on or after the birth date.'},
    {title:'Review the age breakdown',description:'See years, months, days, total time and the next-birthday countdown.'},
  ];
  if(tool.kind==='date-difference')return[
    {title:'Choose two dates',description:'Enter the start and end dates for the period you want to measure.'},
    {title:'Set inclusive counting',description:'Optionally include the end date when that matches your use case.'},
    {title:'Review the duration',description:'See calendar duration, total days, weeks, hours and weekday-only business days.'},
  ];

  return[
    {title:'Choose the calculation',description:'Open the tool and select the mode or options that match your task.'},
    {title:'Enter the known values',description:'Provide the inputs required for the result.'},
    {title:'Review the result',description:'Check the calculation, assumptions and supporting output shown by Toolmera.'},
  ];
}
