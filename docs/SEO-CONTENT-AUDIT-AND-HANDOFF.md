# TOOLMERA — Current Content Audit & SEO Handoff

**Repository:** SviatF/toolmera-com  
**Domain:** https://toolmera.com  
**Snapshot:** 2026-09-05  
**Purpose of this document:** export the CURRENT site architecture and copy before an external SEO rewrite. Do not treat the current copy as final SEO content.

## 1. Executive audit

Current sitemap contains **45 indexable URLs**: homepage, /tools/, 6 global category pages, 21 global tool pages, India hub + 2 India category pages + 7 India tool pages, and 6 trust/legal pages.

### What is already strong
- Clean human-readable URL architecture and static rendering.
- Every tool has its own crawlable URL and is linked from category/directory pages.
- Canonicals are present on category/tool pages.
- WebApplication structured data is present on tool pages; global tool pages also include BreadcrumbList schema.
- Functional utilities provide genuine page-level value; these are not fake SEO landing pages.
- Strong product UX, privacy positioning, category clustering and internal tool discovery.

### Main SEO/content weaknesses to fix
1. **Tool-page content is too thin.** Most pages have only a short intro, 3 benefits, generic 3-step How It Works, related tools and 2 generic FAQs.
2. **FAQ duplication:** all 28 tools currently inherit the same 2 questions: “Is Toolmera free to use?” and “Are my files uploaded to a server?”. These should become tool-specific based on real search intent.
3. **Category pages are generic.** They need unique topical copy, use cases, sub-clusters and strong contextual internal links.
4. **Metadata is under-optimized.** Several titles/descriptions are short/generic and do not yet reflect researched SERP language or modifiers.
5. **India finance/tax is YMYL-adjacent.** Content should include transparent formulas, assumptions, examples, “last reviewed” signals where appropriate, and citations to authoritative Indian sources for tax/rate-dependent claims.
6. **No deep informational support layer yet.** High-value pages should explain the calculation/conversion, edge cases, formats/formulas, examples and limitations—not add arbitrary word count.
7. **Internal linking is mostly templated by category.** Add contextual links from explanatory copy based on the next likely user task.
8. **Homepage is brand-first, not SEO-first.** That is acceptable, but supporting copy can clarify the breadth of tools without bloating the hero.

## 2. Site-wide global copy

### Default metadata
- Default title: **Toolmera — Every Tool. One Place.**
- Title template: **%s | Toolmera**
- Default description: **Fast, private online tools for images, PDFs, calculators, converters, text and developer tasks.**
- OpenGraph title: **Toolmera — Every Tool. One Place.**
- OpenGraph description: **Fast, private online tools for everyday work.**

### Header navigation
Image · PDF · Calculators · Converters · Text · Developer · Search · All tools

### Footer copy
- **Private, fast tools for everyday work.**
- **Calculate. Convert. Compress. Create.**
- Tool links: All tools, Image, PDF, Calculators, Converters, Text, Developer
- Company links: About, Contact, Privacy, Terms, Cookies, Disclaimer
- **Built for speed. Private by default.**

## 3. Homepage — /

### Current structure and exact visible copy
1. Eyebrow: **SIMPLE TOOLS. REAL PRODUCTIVITY.**
2. H1: **Every tool. One place.**
3. Intro: **Fast, private online tools for files, numbers and everyday tasks. No sign-up. No clutter. Just results.**
4. Tool search
5. Popular links: PNG to WebP · Merge PDF · EMI Calculator · Word Counter
6. Featured tools
   - Kicker: **START HERE**
   - H2: **Featured tools**
   - Text: **The fastest routes to common tasks.**
7. Categories
   - Kicker: **EXPLORE**
   - H2: **Browse by category**
   - Text: **One clean toolbox for every kind of work.**
8. Trust strip
   - **Private by default** — Files stay on your device whenever possible.
   - **Instant results** — Fast tools that work right in your browser.
   - **No sign-up needed** — Open a tool and get the job done.
9. Local utilities
   - Kicker: **LOCAL UTILITIES**
   - H2: **Built globally. Useful locally.**
   - Text: **Country-specific calculators live alongside global file and productivity tools. India is our first localized finance cluster.**
   - India Finance / India Tax clusters

### SEO rewrite objective
Keep the hero concise and premium. Improve homepage semantic coverage via lower sections, not keyword stuffing in the H1. Clarify main categories, privacy/browser processing, and localized utility expansion.

## 4. All Tools — /tools/

- Meta title: **All Online Tools | Toolmera**
- Meta description: **Browse all Toolmera tools for images, PDFs, calculators, converters, text, developer tasks and India finance.**
- Eyebrow: **TOOLMERA / ALL TOOLS**
- H1: **Find the right tool.**
- Intro: **Search the full Toolmera library or browse by category.**
- Then: all global category grids + India tools grid.

## 5. Global category-page template

**URLs:** /image/, /pdf/, /calculators/, /converters/, /text/, /developer/

### Shared current structure
1. Breadcrumb: Home > Category
2. Eyebrow: TOOLMERA / [CATEGORY]
3. H1: category label
4. Intro: “[category description] Fast, focused and designed with privacy in mind.”
5. Pills: [N] tools · Free to use · No account required
6. H2: **Choose a tool**
7. Text: **Each page is built around one clear task.**
8. Tool grid
9. Benefits: Privacy-minded / Fast by design / One-task focus
10. SEO panel:
   - H2: **Useful [category], without the clutter.**
   - Text: **Toolmera keeps every utility focused on a specific intent, while related tools and category navigation make the next step easy to find. The platform is built as a fast, static-first product with browser-side processing wherever the task allows it.**

### Current category-specific copy
- **/image/ — Image Tools** (7 tools)  
  Description: Convert, compress and resize images.  
  Current hero sentence: Convert, compress and resize images. Fast, focused and designed with privacy in mind.
- **/pdf/ — PDF Tools** (4 tools)  
  Description: Merge, split and create PDF files.  
  Current hero sentence: Merge, split and create PDF files. Fast, focused and designed with privacy in mind.
- **/calculators/ — Calculators** (4 tools)  
  Description: Math, health and everyday calculations.  
  Current hero sentence: Math, health and everyday calculations. Fast, focused and designed with privacy in mind.
- **/converters/ — Converters** (2 tools)  
  Description: Convert units and formats instantly.  
  Current hero sentence: Convert units and formats instantly. Fast, focused and designed with privacy in mind.
- **/text/ — Text Tools** (2 tools)  
  Description: Count, transform and clean text.  
  Current hero sentence: Count, transform and clean text. Fast, focused and designed with privacy in mind.
- **/developer/ — Developer Tools** (2 tools)  
  Description: Format, encode and inspect developer data.  
  Current hero sentence: Format, encode and inspect developer data. Fast, focused and designed with privacy in mind.

## 6. Global tool-page shared template

Every global tool URL currently uses this content skeleton:
1. Breadcrumb: Home > Category > Tool
2. Eyebrow: **FAST. PRIVATE. NO SIGN-UP.**
3. H1: tool name
4. Unique intro from registry
5. Functional tool UI
6. Trust row:
   - **Privacy-minded** — Browser-first whenever possible
   - **Instant workflow** — No setup or account required
   - **Free core tool** — Open it and get the task done
7. H2: **Built to get the task done.** + 3 unique benefits
8. H2 uses each registry title + registry description
9. How It Works:
   - **Three steps. That’s it.**
   - 01 Open the tool — Start immediately. No sign-up, onboarding or dashboard.
   - 02 Add your input — Upload a file or enter the values needed for this calculation.
   - 03 Get the result — Download the output or use the result instantly.
10. Related tools (up to 4 from same category)
11. FAQ: **Common questions**
12. Shared current FAQ on all tools:
   - Q: **Is Toolmera free to use?** A: **Yes. The core tools are free and require no account.**
   - Q: **Are my files uploaded to a server?** A: **Whenever possible, Toolmera processes files locally in your browser so your files stay on your device.**
13. Schema: WebApplication + BreadcrumbList

## 7. ALL 21 global tool pages — current unique copy

### /image/png-to-webp/ — PNG to WebP
- Category: Image
- Tool kind: image-convert
- Card text: **Convert PNG images to WebP in seconds.**
- Current SEO/title field: **PNG to WebP Converter — Free & Private**
- Current meta description: **Convert PNG images to WebP instantly in your browser. Fast, private and free.**
- H1: **PNG to WebP**
- Hero intro: **Turn PNG files into lightweight WebP images without sending them to a server.**
- Benefits: **Smaller web-ready files** · **Transparency supported** · **Local browser processing**
- Shared How-to + shared 2-question FAQ: see template above.

### /image/webp-to-png/ — WebP to PNG
- Category: Image
- Tool kind: image-convert
- Card text: **Convert WebP images to PNG with transparency.**
- Current SEO/title field: **WebP to PNG Converter**
- Current meta description: **Convert WebP images to PNG online with private browser-based processing.**
- H1: **WebP to PNG**
- Hero intro: **Convert modern WebP files into widely compatible PNG images.**
- Benefits: **Preserve transparency** · **Instant conversion** · **No upload required**
- Shared How-to + shared 2-question FAQ: see template above.

### /image/jpg-to-webp/ — JPG to WebP
- Category: Image
- Tool kind: image-convert
- Card text: **Create smaller WebP images from JPG files.**
- Current SEO/title field: **JPG to WebP Converter**
- Current meta description: **Convert JPG to WebP online for smaller, web-friendly images.**
- H1: **JPG to WebP**
- Hero intro: **Reduce image weight by converting JPG photos to the modern WebP format.**
- Benefits: **Web optimized** · **Adjustable quality** · **Runs locally**
- Shared How-to + shared 2-question FAQ: see template above.

### /image/jpg-to-png/ — JPG to PNG
- Category: Image
- Tool kind: image-convert
- Card text: **Convert JPG photos to crisp PNG images.**
- Current SEO/title field: **JPG to PNG Converter**
- Current meta description: **Convert JPG images to PNG instantly and privately.**
- H1: **JPG to PNG**
- Hero intro: **Create lossless PNG files from JPG images directly in your browser.**
- Benefits: **Simple one-click conversion** · **No account** · **Local processing**
- Shared How-to + shared 2-question FAQ: see template above.

### /image/png-to-jpg/ — PNG to JPG
- Category: Image
- Tool kind: image-convert
- Card text: **Convert PNG images to compact JPG files.**
- Current SEO/title field: **PNG to JPG Converter**
- Current meta description: **Convert PNG to JPG online with adjustable quality.**
- H1: **PNG to JPG**
- Hero intro: **Turn PNG graphics into widely compatible JPG files with a clean white background for transparency.**
- Benefits: **Adjustable quality** · **Compact output** · **Private processing**
- Shared How-to + shared 2-question FAQ: see template above.

### /image/compress-image/ — Compress Image
- Category: Image
- Tool kind: image-compress
- Card text: **Reduce JPG, PNG and WebP image size.**
- Current SEO/title field: **Compress Image Online**
- Current meta description: **Compress JPG, PNG and WebP images in your browser with adjustable quality.**
- H1: **Compress Image**
- Hero intro: **Shrink image file size while staying in control of output quality.**
- Benefits: **Live size comparison** · **Adjustable quality** · **Nothing stored**
- Shared How-to + shared 2-question FAQ: see template above.

### /image/resize-image/ — Resize Image
- Category: Image
- Tool kind: image-resize
- Card text: **Resize images to exact pixel dimensions.**
- Current SEO/title field: **Resize Image Online**
- Current meta description: **Resize image width and height instantly in your browser.**
- H1: **Resize Image**
- Hero intro: **Resize images for websites, social media and documents without installing software.**
- Benefits: **Exact dimensions** · **Keep aspect ratio** · **Fast local export**
- Shared How-to + shared 2-question FAQ: see template above.

### /pdf/merge-pdf/ — Merge PDF
- Category: PDF
- Tool kind: pdf-merge
- Card text: **Combine multiple PDF files into one.**
- Current SEO/title field: **Merge PDF Online — Free & Private**
- Current meta description: **Merge PDF files directly in your browser without uploading documents.**
- H1: **Merge PDF**
- Hero intro: **Combine PDFs into one clean document while keeping the workflow on your device.**
- Benefits: **Multiple PDFs** · **Reorder before merge** · **Browser processing**
- Shared How-to + shared 2-question FAQ: see template above.

### /pdf/split-pdf/ — Split PDF
- Category: PDF
- Tool kind: pdf-split
- Card text: **Extract selected pages from a PDF.**
- Current SEO/title field: **Split PDF Online**
- Current meta description: **Extract a page range from a PDF locally in your browser.**
- H1: **Split PDF**
- Hero intro: **Create a new PDF from the exact page range you need.**
- Benefits: **Choose page range** · **No server upload** · **Instant download**
- Shared How-to + shared 2-question FAQ: see template above.

### /pdf/jpg-to-pdf/ — JPG to PDF
- Category: PDF
- Tool kind: images-to-pdf
- Card text: **Turn one or more JPG images into a PDF.**
- Current SEO/title field: **JPG to PDF Converter**
- Current meta description: **Convert JPG images to a PDF directly in your browser.**
- H1: **JPG to PDF**
- Hero intro: **Combine one or many JPG images into a single PDF file.**
- Benefits: **Multiple images** · **Automatic page sizing** · **Private by default**
- Shared How-to + shared 2-question FAQ: see template above.

### /pdf/png-to-pdf/ — PNG to PDF
- Category: PDF
- Tool kind: images-to-pdf
- Card text: **Combine PNG images into a PDF document.**
- Current SEO/title field: **PNG to PDF Converter**
- Current meta description: **Convert PNG images into a PDF in your browser.**
- H1: **PNG to PDF**
- Hero intro: **Build a PDF from PNG screenshots, designs or scans without uploading files.**
- Benefits: **Multiple PNG files** · **Simple ordering** · **Local processing**
- Shared How-to + shared 2-question FAQ: see template above.

### /calculators/age-calculator/ — Age Calculator
- Category: Calculators
- Tool kind: age
- Card text: **Find your exact age in years, months and days.**
- Current SEO/title field: **Age Calculator — Exact Age in Years, Months & Days**
- Current meta description: **Calculate exact age from date of birth instantly.**
- H1: **Age Calculator**
- Hero intro: **Enter a date of birth to calculate an exact age breakdown.**
- Benefits: **Exact breakdown** · **Total days estimate** · **Instant result**
- Shared How-to + shared 2-question FAQ: see template above.

### /calculators/percentage-calculator/ — Percentage Calculator
- Category: Calculators
- Tool kind: percentage
- Card text: **Calculate percentages and percentage change.**
- Current SEO/title field: **Percentage Calculator**
- Current meta description: **Calculate what percentage one number is of another.**
- H1: **Percentage Calculator**
- Hero intro: **Quickly solve everyday percentage questions.**
- Benefits: **Fast calculation** · **Clear formula** · **No sign-up**
- Shared How-to + shared 2-question FAQ: see template above.

### /calculators/bmi-calculator/ — BMI Calculator
- Category: Calculators
- Tool kind: bmi
- Card text: **Calculate body mass index from height and weight.**
- Current SEO/title field: **BMI Calculator**
- Current meta description: **Calculate BMI from weight and height for general informational use.**
- H1: **BMI Calculator**
- Hero intro: **Get a quick BMI estimate from metric measurements.**
- Benefits: **Metric inputs** · **Instant BMI** · **Simple interpretation**
- Shared How-to + shared 2-question FAQ: see template above.

### /calculators/compound-interest-calculator/ — Compound Interest
- Category: Calculators
- Tool kind: interest
- Card text: **Estimate growth with compound interest.**
- Current SEO/title field: **Compound Interest Calculator**
- Current meta description: **Estimate future value with compound interest.**
- H1: **Compound Interest**
- Hero intro: **See how principal, interest rate and time can compound into future value.**
- Benefits: **Future value** · **Interest earned** · **Annual compounding**
- Shared How-to + shared 2-question FAQ: see template above.

### /converters/length-converter/ — Length Converter
- Category: Converters
- Tool kind: unit-length
- Card text: **Convert meters, feet, miles, inches and more.**
- Current SEO/title field: **Length Converter**
- Current meta description: **Convert common length units instantly.**
- H1: **Length Converter**
- Hero intro: **Convert between metric and imperial length units in real time.**
- Benefits: **Metric & imperial** · **Instant updates** · **No limits**
- Shared How-to + shared 2-question FAQ: see template above.

### /converters/temperature-converter/ — Temperature Converter
- Category: Converters
- Tool kind: unit-temperature
- Card text: **Convert Celsius, Fahrenheit and Kelvin.**
- Current SEO/title field: **Temperature Converter**
- Current meta description: **Convert Celsius, Fahrenheit and Kelvin instantly.**
- H1: **Temperature Converter**
- Hero intro: **A fast temperature converter for the three most common temperature scales.**
- Benefits: **Celsius** · **Fahrenheit** · **Kelvin**
- Shared How-to + shared 2-question FAQ: see template above.

### /text/word-counter/ — Word Counter
- Category: Text
- Tool kind: word-counter
- Card text: **Count words, characters, sentences and reading time.**
- Current SEO/title field: **Word Counter**
- Current meta description: **Count words, characters, sentences and estimated reading time.**
- H1: **Word Counter**
- Hero intro: **Paste text to get instant writing statistics.**
- Benefits: **Words & characters** · **Sentence count** · **Reading time**
- Shared How-to + shared 2-question FAQ: see template above.

### /text/case-converter/ — Case Converter
- Category: Text
- Tool kind: case-converter
- Card text: **Switch text between upper, lower and title case.**
- Current SEO/title field: **Text Case Converter**
- Current meta description: **Convert text to uppercase, lowercase and title case.**
- H1: **Case Converter**
- Hero intro: **Clean up capitalization instantly with one click.**
- Benefits: **Uppercase** · **Lowercase** · **Title case**
- Shared How-to + shared 2-question FAQ: see template above.

### /developer/json-formatter/ — JSON Formatter
- Category: Developer
- Tool kind: json-formatter
- Card text: **Format and validate JSON in your browser.**
- Current SEO/title field: **JSON Formatter & Validator**
- Current meta description: **Format, minify and validate JSON locally in your browser.**
- H1: **JSON Formatter**
- Hero intro: **Paste JSON and instantly turn it into readable, structured output.**
- Benefits: **Pretty print** · **Minify** · **Validation errors**
- Shared How-to + shared 2-question FAQ: see template above.

### /developer/base64-encode-decode/ — Base64 Encode / Decode
- Category: Developer
- Tool kind: base64
- Card text: **Encode text to Base64 or decode it back.**
- Current SEO/title field: **Base64 Encoder & Decoder**
- Current meta description: **Encode and decode Base64 text instantly in your browser.**
- H1: **Base64 Encode / Decode**
- Hero intro: **A lightweight Base64 utility for developers and everyday use.**
- Benefits: **Encode** · **Decode** · **Runs locally**
- Shared How-to + shared 2-question FAQ: see template above.

## 8. India hub — /in/

- Eyebrow: **TOOLMERA / INDIA**
- H1: **Tools built for India.**
- Intro: **Localized finance and tax calculators, alongside Toolmera's global utility platform.**
- Finance card: **EMI, SIP, FD, CAGR and loan calculators.**
- Tax card: **GST tools for inclusive and exclusive calculations.**

## 9. India category templates

### /in/finance/
- H1: **India Finance Calculators**
- Intro: **Plan loans, investments and growth with focused calculators designed around common Indian finance decisions.**
- Meta description: same concept via template.
- Pills: [N] tools · India focused · Instant estimates
- SEO section H2: **Clear tools for common India-specific calculations.**
- SEO section text: **These calculators are designed for fast estimates and planning. Results are informational and should be checked against current lender, tax or investment terms when making financial decisions.**

### /in/tax/
- H1: **India Tax Tools**
- Intro: **Simple India-focused tax utilities for quick estimates and everyday calculations.**
- Same shared India category SEO block as above.

## 10. India tool-page shared template

1. Breadcrumb: Home > India > Category > Tool
2. Eyebrow: **INDIA / FAST & FREE**
3. H1 + unique registry intro
4. Functional calculator
5. Trust row:
   - **Instant estimate** — Change inputs and compare scenarios
   - **Fast calculation** — Results update without a sign-up
   - **Informational use** — Use current provider terms for decisions
6. H2: **Clear numbers for faster decisions.** + 3 unique benefits
7. About section: registry title + description
8. Disclaimer: **Figures are estimates for informational use and are not financial, tax or investment advice.**
9. How-to:
   - **Adjust. Compare. Decide.**
   - Enter your values / Review the estimate / Compare scenarios
10. Related India tools
11. The same 2 generic FAQs from commonFaq
12. WebApplication schema

## 11. ALL 7 India tool pages — current unique copy

### /in/finance/emi-calculator/ — EMI Calculator
- Category: India Finance
- Tool kind: emi
- Card text: **Calculate monthly loan EMI, interest and repayment.**
- Current SEO/title field: **EMI Calculator India — Loan EMI Calculator**
- Current meta description: **Calculate monthly EMI, total interest and repayment for loans in India.**
- H1: **EMI Calculator**
- Hero intro: **Estimate your monthly EMI for personal, car or home loans with a clear repayment summary.**
- Benefits: **Monthly EMI** · **Total interest** · **Total repayment**
- Shared India template, disclaimer and generic FAQ: see section above.

### /in/finance/home-loan-emi-calculator/ — Home Loan EMI
- Category: India Finance
- Tool kind: emi
- Card text: **Estimate monthly payments for a home loan.**
- Current SEO/title field: **Home Loan EMI Calculator India**
- Current meta description: **Calculate home loan EMI, total interest and total repayment in India.**
- H1: **Home Loan EMI**
- Hero intro: **Plan a home loan with a fast EMI estimate and repayment breakdown.**
- Benefits: **Home loan focused** · **Monthly payment** · **Interest overview**
- Shared India template, disclaimer and generic FAQ: see section above.

### /in/finance/car-loan-emi-calculator/ — Car Loan EMI
- Category: India Finance
- Tool kind: emi
- Card text: **Calculate an estimated monthly car loan EMI.**
- Current SEO/title field: **Car Loan EMI Calculator India**
- Current meta description: **Estimate car loan EMI, interest and repayment in India.**
- H1: **Car Loan EMI**
- Hero intro: **Compare car financing scenarios by changing loan amount, rate and tenure.**
- Benefits: **Car loan planning** · **Monthly EMI** · **Total cost**
- Shared India template, disclaimer and generic FAQ: see section above.

### /in/finance/sip-calculator/ — SIP Calculator
- Category: India Finance
- Tool kind: sip
- Card text: **Estimate future value of monthly SIP investments.**
- Current SEO/title field: **SIP Calculator India — Estimate SIP Returns**
- Current meta description: **Estimate SIP maturity value from monthly investment, expected return and time horizon.**
- H1: **SIP Calculator**
- Hero intro: **Model how a monthly SIP may grow over time using a simple expected-return assumption.**
- Benefits: **Invested amount** · **Estimated returns** · **Future value**
- Shared India template, disclaimer and generic FAQ: see section above.

### /in/finance/fd-calculator/ — FD Calculator
- Category: India Finance
- Tool kind: fd
- Card text: **Estimate maturity value of a fixed deposit.**
- Current SEO/title field: **FD Calculator India**
- Current meta description: **Estimate fixed deposit maturity value and interest earned.**
- H1: **FD Calculator**
- Hero intro: **Calculate potential FD maturity based on deposit, interest rate and term.**
- Benefits: **Maturity estimate** · **Interest earned** · **Simple compounding**
- Shared India template, disclaimer and generic FAQ: see section above.

### /in/finance/cagr-calculator/ — CAGR Calculator
- Category: India Finance
- Tool kind: cagr
- Card text: **Calculate compound annual growth rate.**
- Current SEO/title field: **CAGR Calculator India**
- Current meta description: **Calculate compound annual growth rate from beginning value, ending value and duration.**
- H1: **CAGR Calculator**
- Hero intro: **Measure annualized growth across a multi-year period.**
- Benefits: **Annualized growth** · **Simple inputs** · **Instant result**
- Shared India template, disclaimer and generic FAQ: see section above.

### /in/tax/gst-calculator/ — GST Calculator
- Category: India Tax
- Tool kind: gst
- Card text: **Add or remove GST from an amount.**
- Current SEO/title field: **GST Calculator India — Add or Remove GST**
- Current meta description: **Calculate GST inclusive and exclusive amounts using common Indian GST rates.**
- H1: **GST Calculator**
- Hero intro: **Add GST to a base amount or reverse-calculate the pre-tax amount from a GST-inclusive total.**
- Benefits: **Add GST** · **Remove GST** · **Common GST rates**
- Shared India template, disclaimer and generic FAQ: see section above.

## 12. Trust / legal pages — exact current copy

### /about/
- Meta title: **About Toolmera**
- Meta description: **Learn what Toolmera is building and why our tools are fast, focused and privacy-minded.**
- Eyebrow: **ABOUT**
- H1: **Small tools. Better work.**
- Intro: **Toolmera is a global collection of focused online utilities built to remove friction from everyday tasks.**
- H2: **Why Toolmera exists**  
  Many simple tasks are buried inside bloated products, accounts and dashboards. Toolmera takes the opposite approach: one clear tool for one clear job.
- H2: **How we build**  
  We prioritize speed, clarity and browser-side processing where practical. The platform is static-first, lightweight and designed to scale across categories and markets.
- H2: **What comes next**  
  We are expanding the library across file utilities, calculators, converters, text tools, developer tools and localized everyday utilities.

### /contact/
- Meta title: **Contact**
- Meta description: **Contact Toolmera.**
- Eyebrow: **CONTACT**
- H1: **Talk to Toolmera.**
- Intro: **Found a bug, have a tool request or want to discuss the product?**
- H2: **Product feedback**  
  For tool requests, bug reports, privacy questions or partnership enquiries, email hello@toolmera.com.
- H2: **Useful details**  
  When reporting a problem, include the tool URL, browser, device and a short description of what happened. Do not send sensitive files unless specifically requested.

### /privacy/
- Meta title: **Privacy Policy**
- Meta description: **Toolmera privacy policy.**
- Eyebrow: **LEGAL**
- H1: **Privacy policy**
- Intro: **Toolmera is designed to minimize unnecessary data collection and keep lightweight processing in your browser whenever practical.**
- H2: **Files and tool inputs**  
  Many Toolmera utilities process files or values locally in your browser. When a tool works this way, the input is not intentionally uploaded to Toolmera servers for processing.
- H2: **Analytics and advertising**  
  We may use analytics, advertising and similar technologies to understand usage, improve the product and support the service. These providers may process device, browser, usage and approximate location data according to their own policies.
- H2: **Contact**  
  If you have a privacy question, contact us through the Toolmera contact page.

### /terms/
- Meta title: **Terms of Use**
- Meta description: **Toolmera terms of use.**
- Eyebrow: **LEGAL**
- H1: **Terms of use**
- Intro: **By using Toolmera, you agree to use the service lawfully and understand that outputs are provided on an as-is basis.**
- H2: **Use of the service**  
  You may use Toolmera for lawful personal and business tasks. Do not use the service to violate laws, rights, security controls or third-party terms.
- H2: **Availability**  
  We may change, add, remove or temporarily disable tools without notice. We do not guarantee uninterrupted availability or error-free results.
- H2: **Responsibility**  
  You remain responsible for checking important outputs before relying on them for financial, legal, medical, business or other material decisions.

### /cookies/
- Meta title: **Cookie Policy**
- Meta description: **How Toolmera may use cookies and similar technologies.**
- Eyebrow: **LEGAL**
- H1: **Cookie policy**
- Intro: **Toolmera may use cookies and similar technologies for essential functionality, analytics, preferences and advertising.**
- H2: **Essential technologies**  
  Some browser storage may be needed to remember preferences or keep the site functioning correctly.
- H2: **Analytics and advertising**  
  Where enabled, analytics and advertising partners may use cookies or similar identifiers to measure usage, prevent abuse and deliver or measure advertising.
- H2: **Your choices**  
  You can control cookies through your browser and, where required, through consent controls presented on Toolmera.

### /disclaimer/
- Meta title: **Disclaimer**
- Meta description: **Important limitations and informational-use disclaimer for Toolmera.**
- Eyebrow: **LEGAL**
- H1: **Disclaimer**
- Intro: **Toolmera provides utility outputs and estimates for general informational and productivity purposes.**
- H2: **Calculators and estimates**  
  Financial, tax, health and other calculator results are estimates based on the values and assumptions entered. They are not professional advice.
- H2: **File tools**  
  Always keep original copies of important files. Conversion, compression or document operations can alter output quality, metadata or formatting.
- H2: **External rules**  
  Rates, laws, tax rules, lender terms and technical standards can change. Check current authoritative sources when accuracy matters.

## 13. SEO priorities for the external model

### P0 — rewrite before scaling traffic
1. 21 global tool pages
2. 7 India tool pages
3. 6 global category pages
4. /in/finance/ and /in/tax/

### P1
- /tools/
- /in/
- homepage supporting sections

### P2
- About / Contact / legal pages. Keep these accurate and trustworthy; do not turn them into keyword pages.

## 14. What the SEO rewrite should add to EACH important tool page

Do not follow a fixed word count. Add only content that helps the user complete or understand the task.

Recommended page-specific modules where relevant:
- Search-intent map: primary query + secondary variants + questions.
- SERP/competitor gap summary.
- Optimized meta title and meta description.
- H1 and concise above-the-fold intro.
- Tool-specific How to Use (not generic boilerplate).
- What the output means / formula / conversion logic.
- Worked example using realistic sample values.
- Input/output format details, quality/transparency/compatibility notes for file tools.
- Edge cases and limitations.
- “When to use this tool” and practical use cases.
- Tool-specific FAQs sourced from actual search/PAA patterns, not invented fluff.
- Contextual links to 3–6 genuinely related Toolmera pages with suggested anchors.
- For finance/tax pages: formulas, assumptions, authoritative India sources for rules/rates, and careful YMYL wording.
- Suggested structured data that truthfully matches visible page content.

## 15. COPY-PASTE HANDOFF PROMPT FOR GEMINI / CLAUDE

```text
You are the lead SEO strategist and content architect for Toolmera.com, a global browser-first utility platform. I am giving you a complete snapshot of the current site copy and page architecture below.

Your job is NOT to generate generic SEO articles or inflate word count. Your job is to transform each commercial/utility landing page into the strongest possible people-first search result for its exact user intent while preserving the working tool as the primary page value.

WORKING RULES:
1. Research the current SERP for every priority page/query before writing. Identify dominant intent, top ranking page structures, PAA questions, terminology, related entities and content gaps.
2. Do not copy competitors. Use research to create a more useful and complete page.
3. Do not create separate low-value pages for every keyword variation. Recommend a new URL only where the intent/functionality is meaningfully distinct.
4. Preserve the Toolmera brand voice: concise, premium, clear, technical when needed, zero fluff.
5. Keep the actual tool ABOVE the long-form explanatory content. Users came to do a task first.
6. Every tool page must have UNIQUE copy. Do not reuse generic FAQ or generic how-to wording across pages.
7. For India finance/tax/YMYL pages, verify factual claims against authoritative current Indian sources. Cite sources in your research notes. Never invent current rates, laws, limits or lender terms.
8. Do not make unverifiable privacy claims. Use “browser-side/local processing” only where the described Toolmera function actually does it.
9. Do not chase an arbitrary word count. Google has no preferred word count. Write enough to fully satisfy the intent.
10. Optimize for Google Search and modern AI/search retrieval by making facts, formulas, definitions, examples, relationships and limitations explicit and easy to extract.

FOR EACH P0 PAGE RETURN:
A. URL
B. Primary intent
C. Primary keyword + secondary keyword cluster
D. SERP findings / competitors / content gaps
E. Recommended meta title (with character-aware phrasing)
F. Recommended meta description
G. H1
H. Above-the-fold intro (2–4 lines)
I. Exact H2/H3 structure in order
J. Full production-ready English copy for every section
K. Tool-specific FAQ (4–8 questions only if genuinely useful)
L. Internal links + recommended anchor text
M. Structured-data recommendations
N. Claims/sources that require verification or periodic updates
O. Any UX/tool functionality additions that would materially improve ranking/user satisfaction

START WITH P0 PAGES. Do not rewrite legal pages for SEO. Return the work in batches by topical cluster: Image -> PDF -> Calculators -> Converters/Text/Developer -> India Finance -> India Tax.
```

## 16. Important Google-aligned guardrails

- Helpful, reliable, people-first content matters more than mass publishing.
- Use the words people search for in titles, headings and descriptive anchor text naturally.
- Keep links crawlable and ensure every important page is reachable internally.
- Functional pages must genuinely provide the functionality they promise.
- Avoid scaled AI content whose primary purpose is ranking manipulation.
- Toolmera already has real functionality; the SEO layer should deepen usefulness rather than bury the tool under text.

