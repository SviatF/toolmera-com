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
  'temperature':['length','volume'],

  // Generators / text / developer / time.
  'qr-code':['uuid','base64','case-converter'],
  'uuid':['json','base64','password'],
  'password':['uuid','random-number'],
  'random-number':['average','password','percentage'],
  'unix-timestamp':['date-difference','age','json'],
  'word-counter':['case-converter'],
  'case-converter':['word-counter','base64'],
  'json':['base64','uuid'],
  'base64':['json','uuid','qr-code'],

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
  if(['unit-length','unit-temperature','unit-weight','unit-volume','unit-area'].includes(tool.kind))return[
    {title:'Enter a measurement',description:'Type the value and select the source unit.'},
    {title:'Choose the target unit',description:'Select the unit you want to convert into or use a quick pair.'},
    {title:'Read the conversion',description:'The result and available comparison values update immediately.'},
  ];
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
