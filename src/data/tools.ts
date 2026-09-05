export type Accent = 'blue' | 'cyan' | 'violet' | 'pink' | 'amber' | 'green';
export type ToolKind =
  | 'image-convert'
  | 'image-compress'
  | 'image-compress-jpg'
  | 'image-compress-png'
  | 'image-resize'
  | 'image-crop'
  | 'heic-convert'
  | 'pdf-merge'
  | 'pdf-split'
  | 'images-to-pdf'
  | 'pdf-to-image'
  | 'pdf-rotate'
  | 'pdf-remove-pages'
  | 'age'
  | 'percentage'
  | 'bmi'
  | 'interest'
  | 'loan'
  | 'roi'
  | 'discount'
  | 'simple-interest'
  | 'date-difference'
  | 'average'
  | 'unit-length'
  | 'unit-temperature'
  | 'word-counter'
  | 'case-converter'
  | 'json-formatter'
  | 'base64'
  | 'emi'
  | 'sip'
  | 'fd'
  | 'cagr'
  | 'gst';

export type Tool = {
  id: string;
  name: string;
  short: string;
  category: string;
  categoryLabel: string;
  slug: string;
  country?: 'in';
  kind: ToolKind;
  accent: Accent;
  badge?: string;
  inputFormat?: string;
  outputFormat?: string;
  title: string;
  description: string;
  intro: string;
  benefits: string[];
  faq: { q: string; a: string }[];
};

const commonFaq = [
  { q: 'Is Toolmera free to use?', a: 'Yes. The core tools are free and require no account.' },
  { q: 'Are my files uploaded to a server?', a: 'Whenever possible, Toolmera processes files locally in your browser so your files stay on your device.' },
];

export const tools: Tool[] = [
  {
    id: 'png-webp', name: 'PNG to WebP', short: 'Convert PNG images to WebP in seconds.', category: 'image', categoryLabel: 'Image', slug: 'png-to-webp', kind: 'image-convert', accent: 'blue', inputFormat: 'image/png', outputFormat: 'image/webp', badge: 'Popular',
    title: 'PNG to WebP Converter — Free & Private', description: 'Convert PNG images to WebP instantly in your browser. Fast, private and free.', intro: 'Turn PNG files into lightweight WebP images without sending them to a server.', benefits: ['Smaller web-ready files', 'Transparency supported', 'Local browser processing'], faq: commonFaq,
  },
  {
    id: 'webp-png', name: 'WebP to PNG', short: 'Convert WebP images to PNG with transparency.', category: 'image', categoryLabel: 'Image', slug: 'webp-to-png', kind: 'image-convert', accent: 'cyan', inputFormat: 'image/webp', outputFormat: 'image/png',
    title: 'WebP to PNG Converter', description: 'Convert WebP images to PNG online with private browser-based processing.', intro: 'Convert modern WebP files into widely compatible PNG images.', benefits: ['Preserve transparency', 'Instant conversion', 'No upload required'], faq: commonFaq,
  },
  {
    id: 'jpg-webp', name: 'JPG to WebP', short: 'Create smaller WebP images from JPG files.', category: 'image', categoryLabel: 'Image', slug: 'jpg-to-webp', kind: 'image-convert', accent: 'blue', inputFormat: 'image/jpeg', outputFormat: 'image/webp',
    title: 'JPG to WebP Converter', description: 'Convert JPG to WebP online for smaller, web-friendly images.', intro: 'Reduce image weight by converting JPG photos to the modern WebP format.', benefits: ['Web optimized', 'Adjustable quality', 'Runs locally'], faq: commonFaq,
  },
  {
    id: 'jpg-png', name: 'JPG to PNG', short: 'Convert JPG photos to crisp PNG images.', category: 'image', categoryLabel: 'Image', slug: 'jpg-to-png', kind: 'image-convert', accent: 'violet', inputFormat: 'image/jpeg', outputFormat: 'image/png',
    title: 'JPG to PNG Converter', description: 'Convert JPG images to PNG instantly and privately.', intro: 'Create lossless PNG files from JPG images directly in your browser.', benefits: ['Simple one-click conversion', 'No account', 'Local processing'], faq: commonFaq,
  },
  {
    id: 'png-jpg', name: 'PNG to JPG', short: 'Convert PNG images to compact JPG files.', category: 'image', categoryLabel: 'Image', slug: 'png-to-jpg', kind: 'image-convert', accent: 'pink', inputFormat: 'image/png', outputFormat: 'image/jpeg',
    title: 'PNG to JPG Converter', description: 'Convert PNG to JPG online with adjustable quality.', intro: 'Turn PNG graphics into widely compatible JPG files with a clean white background for transparency.', benefits: ['Adjustable quality', 'Compact output', 'Private processing'], faq: commonFaq,
  },
  {
    id: 'compress-image', name: 'Compress Image', short: 'Reduce JPG, PNG and WebP image size.', category: 'image', categoryLabel: 'Image', slug: 'compress-image', kind: 'image-compress', accent: 'green', badge: 'Popular',
    title: 'Compress Image Online', description: 'Compress JPG, PNG and WebP images in your browser with adjustable quality.', intro: 'Shrink image file size while staying in control of output quality.', benefits: ['Live size comparison', 'Adjustable quality', 'Nothing stored'], faq: commonFaq,
  },
  {
    id: 'resize-image', name: 'Resize Image', short: 'Resize images to exact pixel dimensions.', category: 'image', categoryLabel: 'Image', slug: 'resize-image', kind: 'image-resize', accent: 'cyan',
    title: 'Resize Image Online', description: 'Resize image width and height instantly in your browser.', intro: 'Resize images for websites, social media and documents without installing software.', benefits: ['Exact dimensions', 'Keep aspect ratio', 'Fast local export'], faq: commonFaq,
  },
  {
    id: 'webp-jpg', name: 'WebP to JPG', short: 'Convert WebP images to JPG with a chosen background.', category: 'image', categoryLabel: 'Image', slug: 'webp-to-jpg', kind: 'image-convert', accent: 'cyan', inputFormat: 'image/webp', outputFormat: 'image/jpeg',
    title: 'Free WebP to JPG Converter — Convert Images Online', description: 'Convert WebP images to JPG in your browser with adjustable quality and a selectable background for transparent areas.', intro: 'Turn static WebP images into widely compatible JPG files without uploading them to a Toolmera server.', benefits: ['Adjustable JPG quality', 'Background color control', 'Browser-side conversion'], faq: commonFaq,
  },
  {
    id: 'heic-jpg', name: 'HEIC to JPG', short: 'Convert HEIC and HEIF photos to JPG or PNG.', category: 'image', categoryLabel: 'Image', slug: 'heic-to-jpg', kind: 'heic-convert', accent: 'blue',
    title: 'Free HEIC to JPG Converter — Convert iPhone Photos Online', description: 'Convert HEIC or HEIF photos to JPG or PNG directly in your browser with an output-format selector.', intro: 'Decode HEIC photos locally, choose JPG or PNG output, and download a browser-readable image file.', benefits: ['HEIC & HEIF input', 'JPG or PNG output', 'Local browser decoding'], faq: commonFaq,
  },
  {
    id: 'compress-jpg', name: 'Compress JPG', short: 'Reduce JPG and JPEG file size with quality control.', category: 'image', categoryLabel: 'Image', slug: 'compress-jpg', kind: 'image-compress-jpg', accent: 'green', badge: 'Popular',
    title: 'Free Compress JPG — Reduce JPEG File Size Online', description: 'Compress JPG and JPEG images in your browser with adjustable quality and a before-and-after size comparison.', intro: 'Reduce JPG file size while keeping the output in JPG format and comparing the actual result before download.', benefits: ['JPG output preserved', 'Quality slider', 'Before & after size'], faq: commonFaq,
  },
  {
    id: 'compress-png', name: 'Compress PNG', short: 'Reduce PNG size with palette quantization.', category: 'image', categoryLabel: 'Image', slug: 'compress-png', kind: 'image-compress-png', accent: 'green',
    title: 'Free Compress PNG — Reduce PNG File Size Online', description: 'Compress PNG images with client-side color quantization while keeping PNG output and transparency support.', intro: 'Reduce PNG file size with palette quantization and keep the result as a PNG file.', benefits: ['Real PNG output', 'Palette control', 'Transparency-aware'], faq: commonFaq,
  },
  {
    id: 'crop-image', name: 'Crop Image', short: 'Crop JPG, PNG and WebP images visually.', category: 'image', categoryLabel: 'Image', slug: 'crop-image', kind: 'image-crop', accent: 'violet',
    title: 'Free Crop Image Tool — Crop Photos Online', description: 'Crop JPG, PNG and WebP images in your browser with visual selection and common aspect-ratio presets.', intro: 'Draw a crop area on your image, choose an aspect ratio, and export the selected region locally.', benefits: ['Visual crop selection', 'Aspect ratio presets', 'Local export'], faq: commonFaq,
  },
  {
    id: 'merge-pdf', name: 'Merge PDF', short: 'Combine multiple PDF files into one.', category: 'pdf', categoryLabel: 'PDF', slug: 'merge-pdf', kind: 'pdf-merge', accent: 'pink', badge: 'Popular',
    title: 'Merge PDF Online — Free & Private', description: 'Merge PDF files directly in your browser without uploading documents.', intro: 'Combine PDFs into one clean document while keeping the workflow on your device.', benefits: ['Multiple PDFs', 'Reorder before merge', 'Browser processing'], faq: commonFaq,
  },
  {
    id: 'split-pdf', name: 'Split PDF', short: 'Extract selected pages from a PDF.', category: 'pdf', categoryLabel: 'PDF', slug: 'split-pdf', kind: 'pdf-split', accent: 'violet',
    title: 'Split PDF Online', description: 'Extract a page range from a PDF locally in your browser.', intro: 'Create a new PDF from the exact page range you need.', benefits: ['Choose page range', 'No server upload', 'Instant download'], faq: commonFaq,
  },
  {
    id: 'jpg-pdf', name: 'JPG to PDF', short: 'Turn one or more JPG images into a PDF.', category: 'pdf', categoryLabel: 'PDF', slug: 'jpg-to-pdf', kind: 'images-to-pdf', accent: 'pink', inputFormat: 'image/jpeg',
    title: 'JPG to PDF Converter', description: 'Convert JPG images to a PDF directly in your browser.', intro: 'Combine one or many JPG images into a single PDF file.', benefits: ['Multiple images', 'Automatic page sizing', 'Private by default'], faq: commonFaq,
  },
  {
    id: 'png-pdf', name: 'PNG to PDF', short: 'Combine PNG images into a PDF document.', category: 'pdf', categoryLabel: 'PDF', slug: 'png-to-pdf', kind: 'images-to-pdf', accent: 'violet', inputFormat: 'image/png',
    title: 'PNG to PDF Converter', description: 'Convert PNG images into a PDF in your browser.', intro: 'Build a PDF from PNG screenshots, designs or scans without uploading files.', benefits: ['Multiple PNG files', 'Simple ordering', 'Local processing'], faq: commonFaq,
  },
  {
    id: 'pdf-jpg', name: 'PDF to JPG', short: 'Render PDF pages as JPG or PNG images.', category: 'pdf', categoryLabel: 'PDF', slug: 'pdf-to-jpg', kind: 'pdf-to-image', accent: 'pink', badge: 'Popular',
    title: 'Free PDF to JPG Converter — Convert PDF Pages to Images', description: 'Convert selected PDF pages to JPG or PNG images in your browser with adjustable render scale and ZIP download for multiple pages.', intro: 'Render PDF pages locally as JPG or PNG images, choose page ranges, and export one file or a ZIP bundle.', benefits: ['JPG & PNG output', 'Page range selection', 'ZIP for multiple pages'], faq: commonFaq,
  },
  {
    id: 'rotate-pdf', name: 'Rotate PDF', short: 'Rotate all or selected PDF pages permanently.', category: 'pdf', categoryLabel: 'PDF', slug: 'rotate-pdf', kind: 'pdf-rotate', accent: 'violet',
    title: 'Free Rotate PDF Tool — Rotate PDF Pages Online', description: 'Rotate all, odd, even or selected PDF pages by 90 or 180 degrees directly in your browser.', intro: 'Fix sideways or upside-down PDF pages and download a new file with the rotation saved.', benefits: ['Selected page rotation', '90° & 180° controls', 'Browser-side processing'], faq: commonFaq,
  },
  {
    id: 'remove-pdf-pages', name: 'Remove PDF Pages', short: 'Delete individual pages or ranges from a PDF.', category: 'pdf', categoryLabel: 'PDF', slug: 'remove-pdf-pages', kind: 'pdf-remove-pages', accent: 'pink',
    title: 'Free Remove PDF Pages — Delete Pages from PDF Online', description: 'Remove page numbers or ranges from a PDF directly in your browser and download the cleaned document.', intro: 'Enter pages such as 2, 5-9, 12, validate the selection, and create a new PDF without those pages.', benefits: ['Mixed page-range syntax', 'Remaining page count', 'Original stays unchanged'], faq: commonFaq,
  },
  {
    id: 'age', name: 'Age Calculator', short: 'Calculate calendar age between two dates.', category: 'calculators', categoryLabel: 'Calculators', slug: 'age-calculator', kind: 'age', accent: 'pink', badge: 'Popular',
    title: 'Age Calculator — Years, Months & Days', description: 'Calculate calendar age between a date of birth and any comparison date.', intro: 'Enter a date of birth and an as-of date to calculate calendar age, total days and the next birthday.', benefits: ['Calendar years, months & days', 'Choose an as-of date', 'Birthday countdown'], faq: commonFaq,
  },
  {
    id: 'percentage', name: 'Percentage Calculator', short: 'Solve four common percentage calculations.', category: 'calculators', categoryLabel: 'Calculators', slug: 'percentage-calculator', kind: 'percentage', accent: 'amber',
    title: 'Percentage Calculator', description: 'Calculate percentages, percentage change, percentage difference and percent-of-number results.', intro: 'Choose the percentage question you need and get the result with the formula shown.', benefits: ['4 calculation modes', 'Formula shown', 'Instant results'], faq: commonFaq,
  },
  {
    id: 'bmi', name: 'BMI Calculator', short: 'Calculate adult BMI with metric or imperial units.', category: 'calculators', categoryLabel: 'Calculators', slug: 'bmi-calculator', kind: 'bmi', accent: 'green',
    title: 'BMI Calculator', description: 'Calculate adult BMI from height and weight using metric or imperial units for general screening information.', intro: 'Get an adult BMI screening estimate from kg/cm or lb/in measurements.', benefits: ['Metric & imperial', 'Adult BMI categories', 'Screening estimate'], faq: commonFaq,
  },
  {
    id: 'compound', name: 'Compound Interest Calculator', short: 'Model compound growth with frequency and contributions.', category: 'calculators', categoryLabel: 'Calculators', slug: 'compound-interest-calculator', kind: 'interest', accent: 'amber',
    title: 'Compound Interest Calculator', description: 'Estimate future value with selectable compounding frequency and optional monthly contributions.', intro: 'Model how a starting amount can grow with compound interest, regular monthly contributions and different compounding frequencies.', benefits: ['Compounding frequency', 'Monthly contributions', 'Year-by-year growth'], faq: commonFaq,
  },
  {
    id: 'length', name: 'Length Converter', short: 'Convert metric and imperial length units instantly.', category: 'converters', categoryLabel: 'Converters', slug: 'length-converter', kind: 'unit-length', accent: 'cyan',
    title: 'Length Converter — Metric & Imperial Units', description: 'Convert meters, kilometers, centimeters, millimeters, feet, inches, yards and miles instantly.', intro: 'Convert common metric and imperial length measurements in real time with clear unit labels and quick pair shortcuts.', benefits: ['8 common units', 'Metric & imperial', 'Quick conversion pairs'], faq: commonFaq,
  },
  {
    id: 'temperature', name: 'Temperature Converter', short: 'Convert Celsius, Fahrenheit and Kelvin.', category: 'converters', categoryLabel: 'Converters', slug: 'temperature-converter', kind: 'unit-temperature', accent: 'blue',
    title: 'Temperature Converter — Celsius, Fahrenheit & Kelvin', description: 'Convert Celsius, Fahrenheit and Kelvin instantly with absolute-zero validation.', intro: 'Convert between Celsius, Fahrenheit and Kelvin in real time, with common reference points and an absolute-zero guard.', benefits: ['3 temperature scales', 'Formula-accurate conversion', 'Absolute-zero validation'], faq: commonFaq,
  },
  {
    id: 'word-counter', name: 'Word Counter', short: 'Count words, characters, sentences, paragraphs and reading time.', category: 'text', categoryLabel: 'Text', slug: 'word-counter', kind: 'word-counter', accent: 'violet', badge: 'Popular',
    title: 'Word Counter — Words, Characters & Reading Time', description: 'Count words, characters with and without spaces, sentences, paragraphs and estimated reading time.', intro: 'Paste or type text to get immediate writing statistics with browser-side analysis.', benefits: ['Words & characters', 'Sentences & paragraphs', 'Reading time estimate'], faq: commonFaq,
  },
  {
    id: 'case-converter', name: 'Case Converter', short: 'Convert text across editorial and developer case styles.', category: 'text', categoryLabel: 'Text', slug: 'case-converter', kind: 'case-converter', accent: 'violet',
    title: 'Case Converter — Uppercase, Title, camelCase & More', description: 'Convert text to uppercase, lowercase, simple title case, sentence case, camelCase, PascalCase, snake_case and kebab-case.', intro: 'Transform capitalization and naming styles instantly, then copy the result in one click.', benefits: ['9 case modes', 'Editorial & code styles', 'Copy result'], faq: commonFaq,
  },
  {
    id: 'json', name: 'JSON Formatter', short: 'Format, validate and minify JSON in your browser.', category: 'developer', categoryLabel: 'Developer', slug: 'json-formatter', kind: 'json-formatter', accent: 'pink', badge: 'Popular',
    title: 'JSON Formatter & Validator', description: 'Format, validate and minify JSON locally with 2-space, 4-space or tab indentation.', intro: 'Paste JSON to pretty-print or minify it, validate syntax and inspect parse errors without sending the payload to a Toolmera server.', benefits: ['Format & minify', 'Syntax validation', 'Indentation controls'], faq: commonFaq,
  },
  {
    id: 'base64', name: 'Base64 Encode / Decode', short: 'Encode and decode UTF-8 text with Base64 or Base64URL.', category: 'developer', categoryLabel: 'Developer', slug: 'base64-encode-decode', kind: 'base64', accent: 'cyan',
    title: 'Base64 Encode & Decode — UTF-8 & Base64URL', description: 'Encode UTF-8 text to Base64 or Base64URL and decode it back locally in your browser.', intro: 'Encode text to standard Base64 or Base64URL, decode UTF-8 text, and keep the operation in your browser.', benefits: ['UTF-8 text', 'Base64 & Base64URL', 'Browser-side processing'], faq: commonFaq,
  },
  {
    id: 'emi-in', name: 'EMI Calculator', short: 'Calculate monthly loan EMI, interest and repayment.', category: 'finance', categoryLabel: 'India Finance', country: 'in', slug: 'emi-calculator', kind: 'emi', accent: 'blue', badge: 'India',
    title: 'EMI Calculator India — Loan EMI Calculator', description: 'Calculate monthly EMI, total interest and repayment for loans in India.', intro: 'Estimate your monthly EMI for personal, car or home loans with a clear repayment summary.', benefits: ['Monthly EMI', 'Total interest', 'Total repayment'], faq: commonFaq,
  },
  {
    id: 'home-emi-in', name: 'Home Loan EMI', short: 'Estimate monthly payments for a home loan.', category: 'finance', categoryLabel: 'India Finance', country: 'in', slug: 'home-loan-emi-calculator', kind: 'emi', accent: 'blue',
    title: 'Home Loan EMI Calculator India', description: 'Calculate home loan EMI, total interest and total repayment in India.', intro: 'Plan a home loan with a fast EMI estimate and repayment breakdown.', benefits: ['Home loan focused', 'Monthly payment', 'Interest overview'], faq: commonFaq,
  },
  {
    id: 'car-emi-in', name: 'Car Loan EMI', short: 'Calculate an estimated monthly car loan EMI.', category: 'finance', categoryLabel: 'India Finance', country: 'in', slug: 'car-loan-emi-calculator', kind: 'emi', accent: 'cyan',
    title: 'Car Loan EMI Calculator India', description: 'Estimate car loan EMI, interest and repayment in India.', intro: 'Compare car financing scenarios by changing loan amount, rate and tenure.', benefits: ['Car loan planning', 'Monthly EMI', 'Total cost'], faq: commonFaq,
  },
  {
    id: 'sip-in', name: 'SIP Calculator', short: 'Estimate future value of monthly SIP investments.', category: 'finance', categoryLabel: 'India Finance', country: 'in', slug: 'sip-calculator', kind: 'sip', accent: 'violet', badge: 'India',
    title: 'SIP Calculator India — Estimate SIP Returns', description: 'Estimate SIP maturity value from monthly investment, expected return and time horizon.', intro: 'Model how a monthly SIP may grow over time using a simple expected-return assumption.', benefits: ['Invested amount', 'Estimated returns', 'Future value'], faq: commonFaq,
  },
  {
    id: 'fd-in', name: 'FD Calculator', short: 'Estimate maturity value of a fixed deposit.', category: 'finance', categoryLabel: 'India Finance', country: 'in', slug: 'fd-calculator', kind: 'fd', accent: 'amber',
    title: 'FD Calculator India', description: 'Estimate fixed deposit maturity value and interest earned.', intro: 'Calculate potential FD maturity based on deposit, interest rate and term.', benefits: ['Maturity estimate', 'Interest earned', 'Simple compounding'], faq: commonFaq,
  },
  {
    id: 'cagr', name: 'CAGR Calculator', short: 'Calculate compound annual growth rate.', category: 'calculators', categoryLabel: 'Calculators', slug: 'cagr-calculator', kind: 'cagr', accent: 'green',
    title: 'CAGR Calculator — Compound Annual Growth Rate', description: 'Calculate compound annual growth rate from a beginning value, ending value and time period.', intro: 'Measure the annualized growth rate between a beginning value and an ending value over multiple years.', benefits: ['Annualized growth rate', 'Transparent formula', 'Instant result'], faq: commonFaq,
  },
  {
    id: 'loan', name: 'Loan Calculator', short: 'Estimate monthly payments, total interest and repayment.', category: 'calculators', categoryLabel: 'Calculators', slug: 'loan-calculator', kind: 'loan', accent: 'blue', badge: 'Popular',
    title: 'Free Loan Calculator — Monthly Payments & Interest', description: 'Calculate fixed-rate monthly loan payments, total interest, total repayment and an amortization schedule.', intro: 'Estimate a fixed-rate loan payment and see how principal and interest change across the repayment schedule.', benefits: ['Monthly payment', 'Total interest', 'Amortization schedule'], faq: commonFaq,
  },
  {
    id: 'roi', name: 'ROI Calculator', short: 'Calculate return on investment and net gain or loss.', category: 'calculators', categoryLabel: 'Calculators', slug: 'roi-calculator', kind: 'roi', accent: 'green',
    title: 'Free ROI Calculator — Return on Investment', description: 'Calculate ROI percentage, net gain or loss and optional annualized return from a starting and ending value.', intro: 'Measure total return on investment and compare it with an annualized rate when a holding period is provided.', benefits: ['ROI percentage', 'Net gain or loss', 'Annualized return'], faq: commonFaq,
  },
  {
    id: 'discount', name: 'Discount Calculator', short: 'Calculate sale price, savings and stacked discounts.', category: 'calculators', categoryLabel: 'Calculators', slug: 'discount-calculator', kind: 'discount', accent: 'pink',
    title: 'Free Discount Calculator — Sale Price & Savings', description: 'Calculate final price, total savings and effective discount for percentage, fixed and stacked discounts.', intro: 'Work out sale prices instantly, including sequential discounts such as 20% off plus an extra 10% off.', benefits: ['Final sale price', 'Stacked discounts', 'Effective savings'], faq: commonFaq,
  },
  {
    id: 'simple-interest', name: 'Simple Interest Calculator', short: 'Calculate non-compounding interest and total amount.', category: 'calculators', categoryLabel: 'Calculators', slug: 'simple-interest-calculator', kind: 'simple-interest', accent: 'amber',
    title: 'Free Simple Interest Calculator — Interest & Balance', description: 'Calculate simple interest and total amount across years, months or days with transparent assumptions.', intro: 'Calculate non-compounding interest using principal, annual rate and a flexible time period.', benefits: ['Simple interest', 'Years, months or days', '365/360 day basis'], faq: commonFaq,
  },
  {
    id: 'date-difference', name: 'Date Difference Calculator', short: 'Calculate days, weeks and calendar duration between dates.', category: 'calculators', categoryLabel: 'Calculators', slug: 'date-difference-calculator', kind: 'date-difference', accent: 'cyan', badge: 'Popular',
    title: 'Free Date Difference Calculator — Days Between Dates', description: 'Calculate calendar duration, total days, weeks, hours and business days between two dates.', intro: 'Measure the time between two dates with an optional inclusive end date and weekday-only business-day count.', benefits: ['Calendar duration', 'Total & business days', 'Inclusive end-date option'], faq: commonFaq,
  },
  {
    id: 'average', name: 'Average Calculator', short: 'Calculate mean, median, mode, range and sum.', category: 'calculators', categoryLabel: 'Calculators', slug: 'average-calculator', kind: 'average', accent: 'violet',
    title: 'Free Average Calculator — Mean, Median, Mode & Range', description: 'Calculate mean, median, mode, range, sum, count, minimum and maximum from a list of numbers.', intro: 'Paste a dataset and get a compact statistical summary instantly.', benefits: ['Mean, median & mode', 'Range, min & max', 'Flexible number input'], faq: commonFaq,
  },
  {
    id: 'gst-in', name: 'GST Calculator', short: 'Add or remove GST from an amount.', category: 'tax', categoryLabel: 'India Tax', country: 'in', slug: 'gst-calculator', kind: 'gst', accent: 'pink', badge: 'India',
    title: 'GST Calculator India — Add or Remove GST', description: 'Calculate GST inclusive and exclusive amounts using common Indian GST rates.', intro: 'Add GST to a base amount or reverse-calculate the pre-tax amount from a GST-inclusive total.', benefits: ['Add GST', 'Remove GST', 'Common GST rates'], faq: commonFaq,
  },
];

export const categories = [
  { slug: 'image', label: 'Image Tools', description: 'Convert, compress and resize images.', accent: 'blue' as Accent },
  { slug: 'pdf', label: 'PDF Tools', description: 'Merge, split and create PDF files.', accent: 'pink' as Accent },
  { slug: 'calculators', label: 'Calculators', description: 'Math, health and everyday calculations.', accent: 'amber' as Accent },
  { slug: 'converters', label: 'Converters', description: 'Convert units and formats instantly.', accent: 'cyan' as Accent },
  { slug: 'text', label: 'Text Tools', description: 'Count, transform and clean text.', accent: 'violet' as Accent },
  { slug: 'developer', label: 'Developer Tools', description: 'Format, encode and inspect developer data.', accent: 'pink' as Accent },
];

export function toolUrl(tool: Tool) {
  return tool.country ? `/${tool.country}/${tool.category}/${tool.slug}/` : `/${tool.category}/${tool.slug}/`;
}

export function toolsForCategory(category: string, country?: string) {
  return tools.filter((tool) => tool.category === category && (country ? tool.country === country : !tool.country));
}

export function findTool(category: string, slug: string, country?: string) {
  return tools.find((tool) => tool.category === category && tool.slug === slug && (country ? tool.country === country : !tool.country));
}
