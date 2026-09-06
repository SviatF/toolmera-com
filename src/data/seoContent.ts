export type ToolSeoSection = {
  title: string;
  paragraphs: string[];
  facts?: { label: string; value: string }[];
};

export type ToolSeoContent = {
  title: string;
  description: string;
  intro: string;
  sections: ToolSeoSection[];
  faq: { q: string; a: string }[];
  related: { id: string; anchor: string }[];
  sources?: { label: string; href: string }[];
};

export const toolSeoContent: Record<string, ToolSeoContent> = {
  'png-webp': {
    title: 'PNG to WebP Converter — Free, Private & Transparent',
    description: 'Convert PNG to WebP in your browser with transparency preserved, adjustable quality and a clear before-and-after file size.',
    intro: 'Turn PNG files into smaller WebP images while keeping transparent areas intact. Conversion happens in your browser, with a before-and-after size comparison.',
    sections: [
      {
        title: 'PNG vs. WebP: what actually changes',
        paragraphs: [
          'PNG stores image data losslessly, which makes it a strong fit for logos, icons, screenshots and graphics with transparency. WebP was designed for the web and can represent the same kinds of images more efficiently, so the result is often smaller while preserving transparent areas.',
          'The exact reduction depends on the image itself. Flat graphics, screenshots and photo-like PNGs behave differently, which is why Toolmera shows the actual before-and-after size for your file instead of promising a fixed percentage.'
        ]
      },
      {
        title: 'Choosing a quality setting',
        paragraphs: [
          'Toolmera currently exports WebP with an adjustable quality setting. Higher values preserve more fine detail; lower values reduce the file further. For graphics with sharp edges or text, stay toward the higher end and compare the result before downloading.',
          'If you need a truly lossless WebP workflow, note that the current Toolmera converter does not expose a separate lossless mode toggle yet.'
        ]
      },
      {
        title: 'When to keep the PNG instead',
        paragraphs: [
          'Keep PNG when a downstream tool specifically requires the format, when you need a conventional lossless editing file, or when a workflow has not adopted WebP. For modern websites and apps, WebP is often the more efficient delivery format.'
        ]
      }
    ],
    faq: [
      { q: 'Will my transparent PNG stay transparent in WebP?', a: 'For static PNG files, transparent areas are retained when Toolmera re-encodes the image as WebP.' },
      { q: 'Does converting PNG to WebP reduce quality?', a: 'Toolmera uses an adjustable WebP quality setting. Higher settings preserve more detail; lower settings trade some detail for a smaller file.' },
      { q: 'Can I convert several PNG files at once?', a: 'Yes. The current batch workflow accepts up to four images at once and provides a separate download for each result.' },
      { q: 'Does Toolmera support animated PNG conversion?', a: 'The current converter is intended for static images. Animated PNG is not a supported workflow at this time.' }
    ],
    related: [
      { id: 'compress-image', anchor: 'compress the WebP further' },
      { id: 'resize-image', anchor: 'resize the image before publishing' },
      { id: 'jpg-webp', anchor: 'convert a JPG to WebP instead' }
    ]
  },

  'webp-png': {
    title: 'WebP to PNG Converter — Free & Private',
    description: 'Convert WebP to PNG directly in your browser and keep transparent areas intact. No account and no server upload.',
    intro: 'Convert a static WebP image into a widely compatible PNG file while keeping transparent areas intact.',
    sections: [
      {
        title: 'Why convert WebP back to PNG',
        paragraphs: [
          'WebP is excellent for web delivery, but some editors, upload forms, print workflows and older software still expect PNG. Converting to PNG is useful when a destination rejects WebP or when you want a conventional lossless file for further editing.'
        ]
      },
      {
        title: 'What happens to transparency and animation',
        paragraphs: [
          'Static WebP transparency is retained in the PNG output. Toolmera currently targets static images and does not advertise animated WebP conversion, so use a dedicated animation workflow if motion must be preserved.'
        ]
      },
      {
        title: 'PNG may be larger — that is expected',
        paragraphs: [
          'PNG is a lossless format and will often produce a larger file than the WebP you started with. The tradeoff is compatibility and a lossless editing format, not a smaller file.'
        ]
      }
    ],
    faq: [
      { q: 'Does converting WebP to PNG lose quality?', a: 'Toolmera re-encodes the displayed WebP pixels into PNG. It does not restore detail that may already have been removed from a lossy WebP source.' },
      { q: 'Will the PNG be bigger than the original WebP?', a: 'Often, yes. PNG is usually larger because it uses lossless storage.' },
      { q: 'What happens to an animated WebP?', a: 'Animated WebP is not a supported workflow in the current Toolmera converter.' },
      { q: 'Can I replace transparency with a solid background?', a: 'Not in this tool. If you want a solid background, convert through PNG to JPG after creating the PNG.' }
    ],
    related: [
      { id: 'png-webp', anchor: 'convert PNG back to WebP' },
      { id: 'png-jpg', anchor: 'replace transparency with a solid background' },
      { id: 'compress-image', anchor: 'reduce the output file size' }
    ]
  },

  'jpg-webp': {
    title: 'JPG to WebP Converter — Smaller Web Images',
    description: 'Convert JPG to WebP in your browser with adjustable quality and a clear before-and-after size comparison.',
    intro: 'Convert JPG photos to WebP for a smaller web-ready file, with adjustable quality and local browser processing.',
    sections: [
      {
        title: 'Why WebP can be smaller than JPG',
        paragraphs: [
          'WebP uses a newer image codec than JPEG and can often represent photographic detail more efficiently. The exact result depends on the image and the quality setting, so the most useful number is the size comparison shown after your conversion.'
        ]
      },
      {
        title: 'Picking a quality setting',
        paragraphs: [
          'Use a higher value for images with text overlays, fine texture or sharp edges. Lower values shrink the file more aggressively but can introduce softness or visible compression artifacts. Start high, check the result, then step down only if you need a smaller file.'
        ]
      },
      {
        title: 'JPG to WebP vs. compressing the JPG',
        paragraphs: [
          'Compressing a JPG keeps the same format and applies another round of JPEG compression. Converting to WebP changes the codec itself, which can produce a smaller file at a similar visual quality. If the destination cannot accept WebP, compress the original JPG instead.'
        ]
      },
      {
        title: 'What happens to EXIF metadata',
        paragraphs: [
          'Toolmera decodes the image into the browser canvas and creates a new WebP file from the pixels. Camera metadata such as EXIF fields and GPS data is not copied into that new output file.'
        ]
      }
    ],
    faq: [
      { q: 'How much smaller will WebP be than my JPG?', a: 'There is no fixed percentage. It depends on the photo and the quality setting, so Toolmera shows the actual before-and-after size for your file.' },
      { q: 'What quality setting should I use?', a: 'Start toward the higher end for photographs with fine detail, then reduce the value while checking whether the visual result still looks acceptable.' },
      { q: 'Does conversion remove EXIF and location data?', a: 'The current browser-canvas workflow creates a fresh WebP from the decoded pixels and does not copy the original EXIF metadata.' },
      { q: 'Does WebP work in modern browsers?', a: 'Modern browsers support WebP, but a specific older application or upload platform may still require JPG or PNG.' }
    ],
    related: [
      { id: 'compress-image', anchor: 'compress the JPG without changing format' },
      { id: 'png-webp', anchor: 'convert a PNG to WebP' },
      { id: 'resize-image', anchor: 'resize the image before export' }
    ]
  },

  'jpg-png': {
    title: 'JPG to PNG Converter — Free & Private',
    description: 'Convert JPG to PNG in your browser for editing or workflows that require PNG input. Free and no signup.',
    intro: 'Convert a JPG into a PNG file for further editing or for tools and workflows that require PNG input.',
    sections: [
      {
        title: 'What this conversion does — and does not do',
        paragraphs: [
          'Converting a JPG to PNG cannot restore image detail that JPEG compression already removed. The PNG output simply stores the current image losslessly from that point forward.',
          'That makes the conversion useful before repeated editing or when another tool requires PNG, but it is not a way to upgrade the visual quality of an existing JPG.'
        ]
      },
      {
        title: 'When JPG to PNG actually helps',
        paragraphs: [
          'Use JPG to PNG when an upload form requires a PNG file, when you want a lossless base for additional edits, or when you plan to add transparency later in an editor. Expect the PNG file to be larger for most photographs.'
        ]
      }
    ],
    faq: [
      { q: 'Will JPG to PNG improve image quality?', a: 'No. PNG cannot restore detail already lost to JPEG compression.' },
      { q: 'Why would I convert JPG to PNG?', a: 'Common reasons include a workflow that requires PNG, preparing for further edits, or creating a lossless working copy.' },
      { q: 'Will the file size increase?', a: 'Usually yes, especially for photographic content, because PNG stores the image losslessly.' },
      { q: 'Can this conversion add transparency?', a: 'No. A JPG has no transparency data, so the PNG starts with the same solid image content as the source.' }
    ],
    related: [
      { id: 'png-jpg', anchor: 'convert a PNG back to JPG' },
      { id: 'resize-image', anchor: 'resize the PNG to exact dimensions' },
      { id: 'compress-image', anchor: 'reduce file size after conversion' }
    ]
  },

  'png-jpg': {
    title: 'PNG to JPG Converter — Choose a Background Color',
    description: 'Convert PNG to JPG in your browser with adjustable quality and a selectable background color for transparent areas.',
    intro: 'Convert PNG images to compact JPG files. If the PNG is transparent, choose the background color that should replace transparency.',
    sections: [
      {
        title: 'Why transparency needs a background color',
        paragraphs: [
          'JPG has no alpha channel, so every pixel must end up with a solid color. If your PNG contains transparent areas, Toolmera fills those areas with the background color you choose before creating the JPG.',
          'The default is white, which works well for many product images and documents, but you can change it before reconverting the file.'
        ]
      },
      {
        title: 'Picking a quality setting',
        paragraphs: [
          'Higher quality values preserve sharper edges and fine detail; lower values reduce the file more aggressively. For screenshots, logos or graphics with text, keep the setting high. For photo-like PNGs, you can usually reduce it further without an obvious visual difference.'
        ]
      },
      {
        title: 'When to keep the PNG instead',
        paragraphs: [
          'Keep the PNG if transparency is important for the final use. If you want smaller web files while retaining transparency, PNG to WebP is the better path.'
        ]
      }
    ],
    faq: [
      { q: 'What happens to my transparent PNG background?', a: 'Transparent areas are filled with the background color you select. Toolmera defaults to white.' },
      { q: 'Can I choose a different background color?', a: 'Yes. The PNG to JPG tool includes a background-color picker.' },
      { q: 'Can I recover transparency from the JPG later?', a: 'No. Keep the original PNG if you may need the transparency again.' },
      { q: 'Will JPG usually be smaller than PNG?', a: 'For photo-like images it often is, but the exact result depends on the source and the quality setting. Toolmera shows the before-and-after size.' }
    ],
    related: [
      { id: 'png-webp', anchor: 'keep transparency and convert to WebP' },
      { id: 'compress-image', anchor: 'compress the result further' },
      { id: 'jpg-png', anchor: 'convert JPG back to PNG' }
    ]
  },

  'compress-image': {
    title: 'Compress Image Online — JPG, PNG & WebP',
    description: 'Reduce image file size in your browser with adjustable quality and a before-and-after size comparison.',
    intro: 'Reduce image file size while staying in control of quality. Toolmera processes the image locally and shows the size change before download.',
    sections: [
      {
        title: 'How compression works for JPG, PNG and WebP',
        paragraphs: [
          'JPEG and WebP support adjustable lossy quality, so lowering the quality setting can reduce file size by discarding more visual detail. PNG works differently: its standard format is lossless and does not expose the same browser quality control.',
          'In the current Toolmera compressor, PNG input is exported as WebP to achieve a meaningful size reduction. JPG remains JPG and WebP remains WebP.'
        ]
      },
      {
        title: 'How far should I compress an image?',
        paragraphs: [
          'There is no universal best quality number. Photographs, screenshots and flat graphics react differently. Use the before-and-after size together with a visual check, and stop lowering quality once edges, text, gradients or fine texture begin to look noticeably worse.'
        ]
      },
      {
        title: 'Compress vs. convert vs. resize',
        paragraphs: [
          'Compression changes how efficiently the image is stored. Conversion changes the file format. Resizing changes the pixel dimensions. If an image is much larger than the size it will be displayed at, resizing first and then compressing is usually the better workflow.'
        ]
      }
    ],
    faq: [
      { q: 'Will compression change the image dimensions?', a: 'No. The compressor keeps the current width and height. Use Resize Image if you need different pixel dimensions.' },
      { q: 'What happens when I compress a PNG?', a: 'The current Toolmera compressor exports PNG input as WebP because browser-based PNG does not expose the same adjustable lossy quality control.' },
      { q: 'Can I compress multiple images at once?', a: 'Yes. The current batch workflow accepts up to four images at once and shows a separate result for each file.' },
      { q: 'How do I get the smallest result?', a: 'If the image is larger than necessary, resize it first, then compress it. For PNG or JPG assets intended for the web, converting to WebP can also reduce size further.' }
    ],
    related: [
      { id: 'resize-image', anchor: 'resize first for a smaller final file' },
      { id: 'png-webp', anchor: 'convert PNG to WebP' },
      { id: 'jpg-webp', anchor: 'convert JPG to WebP' }
    ]
  },

  'resize-image': {
    title: 'Resize Image Online — Exact Pixels & Aspect Ratio',
    description: 'Resize an image to exact pixel dimensions in your browser while preserving its aspect ratio automatically.',
    intro: 'Resize images to exact pixel dimensions for websites, social media and documents. Toolmera keeps the original aspect ratio automatically.',
    sections: [
      {
        title: 'Aspect ratio: why it matters',
        paragraphs: [
          'Aspect ratio is the relationship between an image\'s width and height. If those proportions change independently, faces, logos and objects can look stretched or squashed.',
          'The current Toolmera resizer keeps the source aspect ratio automatically: changing the width recalculates the height, and changing the height recalculates the width.'
        ]
      },
      {
        title: 'What if the target size has a different shape?',
        paragraphs: [
          'If you need an exact square or banner size that does not match the original aspect ratio, resizing alone cannot satisfy both dimensions without distortion. Crop the image to the target shape first, then resize it. Toolmera does not currently include crop or padding controls in this resizer.'
        ]
      },
      {
        title: 'Enlarging vs. shrinking',
        paragraphs: [
          'Shrinking generally looks clean because pixels are being reduced. Enlarging cannot create real detail that was not present in the source, so the farther you scale up, the softer the result may look.'
        ]
      }
    ],
    faq: [
      { q: 'Will resizing distort my image?', a: 'Not with the current Toolmera workflow. Width and height stay linked to the original aspect ratio automatically.' },
      { q: 'What if I need an exact size with a different aspect ratio?', a: 'Crop the image to the target shape first, then resize it. The current resizer does not include crop or padding controls.' },
      { q: 'Does resizing change the file format?', a: 'No. The current resizer exports the image using the same MIME format as the source file.' },
      { q: 'Can resizing make a small image sharper?', a: 'No. Enlarging can only interpolate existing pixels; it cannot recreate missing source detail.' }
    ],
    related: [
      { id: 'compress-image', anchor: 'compress the resized image' },
      { id: 'png-webp', anchor: 'convert a PNG to WebP after resizing' },
      { id: 'jpg-webp', anchor: 'convert a JPG to WebP after resizing' }
    ]
  },
  'merge-pdf': {
    title: 'Merge PDF Free — Combine Files in Your Browser',
    description: 'Merge PDF files for free in the order you choose. Everything runs in your browser and your documents are not uploaded to a Toolmera server.',
    intro: 'Combine multiple PDFs into one file for free, arrange the file order before merging, and keep the entire workflow on your device.',
    sections: [
      {
        title: 'Why merge PDFs instead of sending several files',
        paragraphs: [
          'Combining related documents into a single PDF removes the friction of managing several attachments. A reviewer opens one file instead of five, a printed packet stays together, and an archived record reads as one coherent document.',
          'It is a practical step before submitting multi-part paperwork, sharing a report with appendices, or filing scanned documents that arrived as separate PDFs.'
        ]
      },
      {
        title: 'Setting the page order',
        paragraphs: [
          'Each source PDF keeps its internal page order. The order of the source files controls how those page groups appear in the final document.',
          'Toolmera now shows the selected files as an output queue. Use the up and down controls to arrange them before merging; the tool then combines the PDFs exactly in that sequence.'
        ]
      },
      {
        title: 'What merging does — and does not — change',
        paragraphs: [
          'Toolmera copies the existing PDF pages into a new document rather than rendering them as images, so text, graphics and page formatting are carried into the merged file as PDF content.',
          'Merge PDF works with PDF input only. If you need to include JPG or PNG images, convert those images to PDF first, then add the resulting PDF to the merge queue.'
        ]
      }
    ],
    faq: [
      { q: 'Does the order of my PDF files matter?', a: 'Yes. The final PDF follows the file order shown in the Toolmera output queue. You can move files up or down before merging.' },
      { q: 'Will merging change the quality or formatting of my PDFs?', a: 'Toolmera copies the existing PDF pages into the new document rather than re-rendering them as images, so the original page content is carried across.' },
      { q: 'Can I merge more than two PDFs at once?', a: 'Yes. The current tool accepts multiple PDFs and does not impose a fixed Toolmera file-count limit, although very large jobs are naturally limited by the memory available in your browser.' },
      { q: 'Can I merge JPG or PNG images directly with PDFs?', a: 'Not directly in Merge PDF. Convert the images first with JPG to PDF or PNG to PDF, then merge the resulting PDF files.' }
    ],
    related: [
      { id: 'split-pdf', anchor: 'extract pages from a PDF instead' },
      { id: 'jpg-pdf', anchor: 'convert JPG images to PDF first' },
      { id: 'png-pdf', anchor: 'convert PNG images to PDF first' }
    ]
  },

  'split-pdf': {
    title: 'Split PDF Free — Extract Pages in Your Browser',
    description: 'Extract one continuous page range from a PDF for free in your browser. The original document stays untouched.',
    intro: 'Pull one continuous page range out of a PDF into a new file for free, processed locally in your browser.',
    sections: [
      {
        title: 'How to choose the pages you want',
        paragraphs: [
          'The current Toolmera splitter supports one continuous range per export. Enter a range such as 4-9 to create a new PDF containing pages 4 through 9.',
          'If you need two separate ranges, export them in separate passes. Multiple comma-separated ranges and thumbnail page selection are not part of the current tool yet.'
        ]
      },
      {
        title: 'Common reasons to split a PDF',
        paragraphs: [
          'Splitting is useful when only part of a larger document needs to be shared: one chapter from a report, a signature page from a contract, a specific exhibit, or a smaller section from a scanned document.',
          'It is also useful when a large PDF needs to be broken into smaller, more relevant files for email, review or archiving.'
        ]
      },
      {
        title: 'The original file is never changed',
        paragraphs: [
          'Toolmera reads the source PDF and creates a new document from the selected pages. The original file on your device is not modified, reordered or deleted.'
        ]
      }
    ],
    faq: [
      { q: 'Can I extract more than one page range at once?', a: 'Not in the current version. Toolmera exports one continuous range per pass, such as 4-9.' },
      { q: 'Will splitting reduce PDF quality?', a: 'Toolmera copies the selected PDF pages into a new document instead of turning them into screenshots, so the page content is carried across as PDF content.' },
      { q: 'Does splitting change my original PDF?', a: 'No. It creates a new PDF from the selected pages and leaves the original file untouched.' },
      { q: 'Can I preview page thumbnails before extracting?', a: 'Not yet. Pages are currently selected by entering a page range.' }
    ],
    related: [
      { id: 'merge-pdf', anchor: 'merge PDF files into one document' }
    ]
  },

  'jpg-pdf': {
    title: 'JPG to PDF Free — Combine Photos into One PDF',
    description: 'Convert one or more JPG images into a single PDF for free in your browser, with control over the page order.',
    intro: 'Combine JPG photos or scans into one PDF for free, arrange their page order, and process everything on your device.',
    sections: [
      {
        title: 'Turning multiple photos into one document',
        paragraphs: [
          'A common use for JPG to PDF is turning several photographed pages into one ordered document: forms, receipts, notes, IDs or scanned paperwork captured as separate images.',
          'Each selected JPG becomes one page in the final PDF. Toolmera shows the output queue before conversion so you can move images up or down and set the document order first.'
        ]
      },
      {
        title: 'How Toolmera sizes each PDF page',
        paragraphs: [
          'The current converter sizes each PDF page to the pixel dimensions of the JPG placed on it. It does not force every image into A4, Letter or another fixed paper size.',
          'That keeps the image fitted to its own page without adding margins, but a PDF made from mixed portrait and landscape images can therefore contain pages with different shapes and sizes.'
        ]
      },
      {
        title: 'What happens to JPG quality',
        paragraphs: [
          'Toolmera embeds the JPG image data into the PDF without sending the image through the browser canvas for another JPEG export. That avoids an extra lossy image-conversion step during PDF creation.'
        ]
      }
    ],
    faq: [
      { q: 'What order will my JPG images appear in the PDF?', a: 'They appear in the order shown in the Toolmera output queue. Use the up and down controls before converting to arrange the pages.' },
      { q: 'Can I mix photos with different sizes and orientations?', a: 'Yes. Each image becomes a page sized to that image, so portrait and landscape pages can coexist in the same PDF.' },
      { q: 'Will JPG to PDF recompress my photo?', a: 'The current Toolmera implementation embeds the JPG into the PDF rather than re-exporting it through canvas as another JPG.' },
      { q: 'Can I mix JPG and PNG files in the same conversion?', a: 'Not in this tool. JPG to PDF accepts JPG images; use PNG to PDF for PNG files, then Merge PDF if you need to combine the resulting documents.' }
    ],
    related: [
      { id: 'png-pdf', anchor: 'convert PNG images to PDF instead' },
      { id: 'merge-pdf', anchor: 'combine this PDF with other PDFs' },
      { id: 'compress-image', anchor: 'shrink photos before creating the PDF' },
      { id: 'resize-image', anchor: 'resize photos before creating the PDF' }
    ]
  },

  'png-pdf': {
    title: 'PNG to PDF Free — Combine Images in Your Browser',
    description: 'Convert one or more PNG images into a single PDF for free in your browser and arrange the page order before export.',
    intro: 'Build a PDF from PNG screenshots, diagrams or designs for free, with the output order you set and no server upload.',
    sections: [
      {
        title: 'What happens to transparent backgrounds',
        paragraphs: [
          'Toolmera embeds the PNG as an image object in the PDF, including its alpha transparency data. On a normal blank PDF page there is nothing behind that image, so transparent areas usually appear as the page background, which PDF viewers commonly display as white.',
          'The converter does not currently offer a PDF-page background color picker.'
        ]
      },
      {
        title: 'Why PNG works well for screenshots and diagrams',
        paragraphs: [
          'PNG is lossless, which makes it well suited to screenshots, UI mockups, diagrams and graphics with fine text or hard edges. Turning several of those images into one PDF creates a single file that is easier to attach, print, review or archive.',
          'Each PNG becomes one PDF page and the output queue lets you arrange the page sequence before creating the document.'
        ]
      },
      {
        title: 'How Toolmera sizes PNG pages',
        paragraphs: [
          'Each PDF page is sized to the dimensions of the PNG placed on it. Images with different sizes or orientations can therefore produce PDF pages with different dimensions; A4, Letter, margin and padding controls are not currently included.'
        ]
      }
    ],
    faq: [
      { q: 'Will a transparent PNG stay transparent in the PDF?', a: 'The embedded PNG retains its alpha transparency. On an otherwise blank PDF page, transparent areas normally show the page background, which most viewers display as white.' },
      { q: 'Will converting a PNG to PDF blur screenshots or diagrams?', a: 'The current implementation embeds the PNG into the PDF without a lossy JPEG conversion step, so the source image remains lossless.' },
      { q: 'Can I combine PNGs of different sizes in one PDF?', a: 'Yes. Each image gets a page sized to that image, so page dimensions can vary within the PDF.' },
      { q: 'Can I mix PNG and JPG images in one conversion?', a: 'Not in this tool. Use the separate JPG to PDF converter for JPG files, then combine documents with Merge PDF if needed.' }
    ],
    related: [
      { id: 'jpg-pdf', anchor: 'convert JPG images to PDF instead' },
      { id: 'merge-pdf', anchor: 'combine this PDF with other PDFs' },
      { id: 'png-webp', anchor: 'convert large PNGs to WebP for web use' },
      { id: 'compress-image', anchor: 'reduce image size before creating the PDF' }
    ]
  },
  'age': {
    title: 'Age Calculator — Years, Months & Days',
    description: 'Calculate calendar age between a date of birth and any comparison date, with total days, weeks, hours and a next-birthday countdown.',
    intro: 'Enter a date of birth and an as-of date to get a calendar age in years, months and days, plus total time and the next birthday.',
    sections: [
      {
        title: 'What “calendar age” means here',
        paragraphs: [
          'Toolmera calculates age as a calendar difference between two dates rather than dividing elapsed time by an average year or month length. That matters because months have different numbers of days and leap years add an extra day.',
          'The result is expressed as completed years, completed months and remaining days between the date of birth and the selected “age as of” date.'
        ]
      },
      {
        title: 'Why years, months and days are not just total days ÷ 365',
        paragraphs: [
          'A simple division by 365 or 365.25 is only an approximation. Calendar age has to respect real month lengths and leap years, so Toolmera separates the calendar breakdown from total elapsed days.',
          'Total weeks and hours are also shown as elapsed-time views of the same date range, while the years/months/days result remains calendar-based.'
        ]
      },
      {
        title: 'Calculate age today — or on another date',
        paragraphs: [
          'The comparison date defaults to today, but you can change it to a past or future date. That makes the calculator useful for questions such as “How old was I on this date?” or “How old will I be when this event happens?”',
          'For February 29 birthdays, Toolmera uses February 28 as the anniversary date in non-leap years so the convention remains consistent.'
        ]
      }
    ],
    faq: [
      { q: 'Can I calculate age on a date other than today?', a: 'Yes. Change the “Age as of” field to any valid date on or after the date of birth.' },
      { q: 'How does Toolmera handle February 29 birthdays?', a: 'In non-leap years, Toolmera treats February 28 as the anniversary for the calendar-age and next-birthday calculation.' },
      { q: 'What is the difference between calendar age and total days?', a: 'Calendar age is expressed in years, months and days using real calendar boundaries. Total days is the elapsed number of whole calendar days between the two dates.' },
      { q: 'Does the calculator include hours and weeks?', a: 'Yes. Toolmera also shows total weeks and total hours derived from the elapsed calendar-day count.' }
    ],
    related: []
  },

  'percentage': {
    title: 'Percentage Calculator — Four Common Percentage Modes',
    description: 'Calculate what percent X is of Y, find X% of a number, measure percentage increase or decrease, and compare percentage difference.',
    intro: 'Choose the percentage question you need: part of a total, percent of a number, increase or decrease, or percentage difference.',
    sections: [
      {
        title: 'Four percentage questions — four different formulas',
        paragraphs: [
          'Percentage calculations are often grouped under one name even though they answer different questions. Toolmera separates them into four modes so the inputs and formula match the problem you are actually solving.',
          'Use “X is what % of Y?” for part-of-a-whole questions, “What is X% of Y?” to calculate a percentage of a number, “Increase / decrease” for before-and-after change, and “Percentage difference” when comparing two values without treating either one as the original.'
        ]
      },
      {
        title: 'The formulas, with quick examples',
        paragraphs: [
          'Part of a total uses (Value ÷ Total) × 100. For example, 42 out of 60 is 70%. A percentage of a number uses Number × (Percent ÷ 100), so 20% of 80 is 16.',
          'Percentage change uses ((New − Old) ÷ |Old|) × 100. Percentage difference uses the absolute difference divided by the average magnitude of the two values, then × 100. Toolmera shows the active formula beneath the result.'
        ]
      },
      {
        title: 'Percentage change vs. percentage difference',
        paragraphs: [
          'Use percentage change when one value is clearly the starting point and the other is the new value. The sign tells you whether the result is an increase or decrease.',
          'Use percentage difference when the two values are peers and neither is the baseline. This is common when comparing two measurements, estimates or experimental results.'
        ]
      }
    ],
    faq: [
      { q: 'Can this calculate percentage increase and decrease?', a: 'Yes. Choose the “Increase / decrease” mode and enter the starting value and new value.' },
      { q: 'Can I calculate 20% of 80?', a: 'Yes. Choose “What is X% of Y?”, enter 20 for the percent and 80 for the number, and the result is 16.' },
      { q: 'What happens if the total or starting value is zero?', a: 'Toolmera marks calculations that require division by zero as undefined instead of returning a misleading percentage.' },
      { q: 'What is the difference between percentage change and percentage difference?', a: 'Percentage change compares a new value with a baseline. Percentage difference compares two peer values using their average as the reference.' }
    ],
    related: [
      { id: 'gst-in', anchor: 'calculate GST percentages for India' }
    ]
  },

  'bmi': {
    title: 'BMI Calculator — Metric & Imperial',
    description: 'Calculate adult BMI from kg/cm or lb/in measurements, with standard adult categories and clear screening limitations.',
    intro: 'Calculate adult BMI from metric or imperial measurements. BMI is a general screening estimate, not a diagnosis.',
    sections: [
      {
        title: 'What your adult BMI category means',
        paragraphs: [
          'BMI is weight divided by height squared. Toolmera calculates the same BMI whether you enter kilograms and centimeters or pounds and inches, then maps the result to the standard adult categories.',
          'For adults, the categories are: underweight below 18.5, healthy weight from 18.5 to below 25, overweight from 25 to below 30, and obesity at 30 or above. Toolmera also shows obesity class 1, 2 or 3 when the BMI is 30 or higher.'
        ]
      },
      {
        title: 'What BMI does not measure',
        paragraphs: [
          'BMI does not directly measure body fat, muscle mass, fat distribution, fitness or metabolic health. A muscular person can have a high BMI without having a high body-fat percentage, while an older adult with lower muscle mass can have a BMI that understates body fat.',
          'That is why BMI is best treated as a broad screening measure rather than a standalone judgment about an individual’s health.'
        ]
      },
      {
        title: 'Who this calculator is not designed for',
        paragraphs: [
          'The fixed adult BMI categories are not the correct reference for children or teenagers, who use age- and sex-specific percentile approaches. Standard adult BMI categories are also not intended for pregnancy.',
          'If BMI is being used for a health decision rather than general information, interpret it alongside other relevant health information with a qualified healthcare professional.'
        ]
      }
    ],
    faq: [
      { q: 'Can I use pounds and inches?', a: 'Yes. Switch the unit selector to Imperial to enter weight in pounds and height in inches.' },
      { q: 'Is BMI the same as body fat percentage?', a: 'No. BMI is a weight-to-height ratio and does not directly measure body fat or muscle mass.' },
      { q: 'What is considered a healthy adult BMI?', a: 'The standard adult healthy-weight range is 18.5 to below 25. BMI is a screening category, not an individual diagnosis.' },
      { q: 'Is this BMI calculator for children or pregnancy?', a: 'No. The fixed adult categories shown here are not the appropriate reference for children, teenagers or pregnancy.' }
    ],
    related: [],
    sources: [
      { label: 'CDC — Adult BMI Categories', href: 'https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html' }
    ]
  },

  'compound': {
    title: 'Compound Interest Calculator — Contributions & Frequency',
    description: 'Estimate compound growth with annual, quarterly, monthly or daily compounding, optional monthly contributions and a year-by-year breakdown.',
    intro: 'Model compound growth from a starting amount, interest rate, time period, compounding frequency and optional monthly contributions.',
    sections: [
      {
        title: 'The compound-interest formula behind the calculator',
        paragraphs: [
          'For a lump sum with no recurring contribution, compound growth follows A = P(1 + r/n)^(nt), where P is the starting amount, r is the annual nominal rate as a decimal, n is the number of compounding periods per year and t is time in years.',
          'Choosing annual, quarterly, monthly or daily compounding changes n. More frequent compounding produces a slightly higher effective annual return when the nominal annual rate is held constant.'
        ]
      },
      {
        title: 'How monthly contributions are modeled',
        paragraphs: [
          'When you add a monthly contribution, Toolmera first converts the selected compounding setup to its equivalent monthly growth rate, then adds each contribution at the end of the month. This keeps the recurring-contribution model consistent across annual, quarterly, monthly and daily compounding choices.',
          'The results separate total contributed money from interest earned so you can see how much of the final value came from your own deposits and how much came from compound growth.'
        ]
      },
      {
        title: 'What the result assumes',
        paragraphs: [
          'The model assumes a constant stated interest rate for the whole period and regular monthly contributions of the amount you enter. It does not model taxes, account fees, inflation, withdrawals or a changing market return.',
          'Use the result as a scenario model, not a forecast of what a real investment or savings account is guaranteed to produce.'
        ]
      }
    ],
    faq: [
      { q: 'Can I include monthly contributions?', a: 'Yes. Enter an optional monthly contribution; Toolmera adds it at the end of each modeled month.' },
      { q: 'Which compounding frequencies are available?', a: 'You can choose annual, quarterly, monthly or daily compounding.' },
      { q: 'Does the calculator show how much I contributed versus earned?', a: 'Yes. The result separates total contributions from interest earned and includes a year-by-year growth table.' },
      { q: 'Does this account for inflation, tax or fees?', a: 'No. The result is a nominal growth scenario before inflation, taxes, fees or withdrawals.' }
    ],
    related: [
      { id: 'sip-in', anchor: 'model India-focused monthly SIP growth' },
      { id: 'fd-in', anchor: 'estimate a fixed deposit maturity value' }
    ]
  },
  'length': {
    title: 'Length Converter — Metric & Imperial Units',
    description: 'Convert meters, kilometers, centimeters, millimeters, feet, inches, yards and miles instantly with clear conversion factors.',
    intro: 'Convert common metric and imperial length measurements in real time with quick pair shortcuts and transparent conversion relationships.',
    sections: [
      {
        title: 'Common length conversion factors',
        paragraphs: [
          'Length conversion works by expressing both units through a shared base. Toolmera uses meters internally for the supported length units, then converts the result into the unit you choose.',
          'Several widely used relationships are exact definitions, including 1 inch = 2.54 centimeters and 1 foot = 0.3048 meters. Toolmera displays results rounded to a maximum of six decimal places.'
        ],
        facts: [
          { label: '1 inch', value: '2.54 cm' },
          { label: '1 foot', value: '0.3048 m' },
          { label: '1 yard', value: '0.9144 m' },
          { label: '1 mile', value: '1.609344 km' },
          { label: '1 kilometer', value: '1000 m' }
        ]
      },
      {
        title: 'Metric vs. imperial length units',
        paragraphs: [
          'Metric length units scale in powers of ten: millimeters, centimeters, meters and kilometers. Feet, inches, yards and miles use different fixed relationships, so a converter is useful when switching between engineering, travel, construction or everyday measurement systems.',
          'Use the quick-pair buttons for common conversions such as inches to centimeters, feet to meters, miles to kilometers and yards to meters.'
        ]
      }
    ],
    faq: [
      { q: 'How many centimeters are in one inch?', a: 'One inch is exactly 2.54 centimeters.' },
      { q: 'How do I convert meters to feet?', a: 'Divide meters by 0.3048, or multiply by approximately 3.280839895. Toolmera applies the conversion automatically.' },
      { q: 'Does Toolmera support yards?', a: 'Yes. Yards are available alongside meters, kilometers, centimeters, millimeters, feet, inches and miles.' },
      { q: 'Why is the displayed result rounded?', a: 'Toolmera performs the conversion with JavaScript number arithmetic and displays the result to a maximum of six decimal places for readability.' }
    ],
    related: [
      { id: 'temperature', anchor: 'convert Celsius, Fahrenheit and Kelvin' }
    ]
  },

  'temperature': {
    title: 'Temperature Converter — Celsius, Fahrenheit & Kelvin',
    description: 'Convert Celsius, Fahrenheit and Kelvin instantly with standard formulas, quick reference values and absolute-zero validation.',
    intro: 'Convert between Celsius, Fahrenheit and Kelvin in real time using the standard scale relationships, with a guard against values below absolute zero.',
    sections: [
      {
        title: 'Temperature conversion formulas',
        paragraphs: [
          'Celsius, Fahrenheit and Kelvin use different zero points and scale relationships. Toolmera converts the input to Celsius first, then calculates the requested output scale.',
          'The calculator rejects inputs that would represent a temperature below absolute zero.'
        ],
        facts: [
          { label: 'Celsius → Fahrenheit', value: '°F = (°C × 9/5) + 32' },
          { label: 'Fahrenheit → Celsius', value: '°C = (°F − 32) × 5/9' },
          { label: 'Celsius → Kelvin', value: 'K = °C + 273.15' },
          { label: 'Kelvin → Celsius', value: '°C = K − 273.15' }
        ]
      },
      {
        title: 'Useful temperature reference points',
        paragraphs: [
          'Reference values make it easier to sanity-check a conversion. Water freezes at 0 °C / 32 °F under standard reference conditions, while −40 is the point where Celsius and Fahrenheit have the same numeric value.',
          'Kelvin starts at absolute zero, so negative Kelvin values are not physically valid in this converter.'
        ],
        facts: [
          { label: 'Absolute zero', value: '0 K = −273.15 °C = −459.67 °F' },
          { label: 'Water freezing point', value: '0 °C = 32 °F = 273.15 K' },
          { label: '−40 point', value: '−40 °C = −40 °F' },
          { label: 'Water boiling point', value: '100 °C = 212 °F = 373.15 K' }
        ]
      }
    ],
    faq: [
      { q: 'At what temperature are Celsius and Fahrenheit equal?', a: 'They are equal at −40: −40 °C is exactly −40 °F.' },
      { q: 'Can I enter a temperature below absolute zero?', a: 'No. Toolmera flags any input that converts to less than 0 K, which is below absolute zero.' },
      { q: 'How do I convert Celsius to Fahrenheit?', a: 'Multiply Celsius by 9/5 and add 32.' },
      { q: 'How do I convert Celsius to Kelvin?', a: 'Add 273.15 to the Celsius value.' }
    ],
    related: [
      { id: 'length', anchor: 'convert metric and imperial length units' }
    ]
  },

  'word-counter': {
    title: 'Word Counter — Words, Characters & Reading Time',
    description: 'Count words, characters with and without spaces, sentences, paragraphs and estimated reading time directly in your browser.',
    intro: 'Paste or type text to see word count, character count, sentence and paragraph estimates, plus reading time.',
    sections: [
      {
        title: 'What each text metric means',
        paragraphs: [
          'Word count uses the browser’s language-aware word segmenter when available, with a whitespace-token fallback. Character count uses Unicode code points, and the “No spaces” metric removes whitespace before counting.',
          'Sentence count is a segmentation estimate rather than a grammar analysis. Paragraphs are separated by blank lines, while reading time is estimated at 220 words per minute.'
        ],
        facts: [
          { label: 'Words', value: 'Language-aware segmentation when supported' },
          { label: 'Characters', value: 'Unicode code points, including spaces' },
          { label: 'No spaces', value: 'Characters after removing whitespace' },
          { label: 'Reading time', value: 'Estimated at 220 words/minute' }
        ]
      },
      {
        title: 'When a word counter is useful',
        paragraphs: [
          'Word and character counts are useful for assignments, editorial limits, ad copy, social posts, product descriptions and interface text where a length target matters.',
          'Because sentence detection and reading time are estimates, use those metrics as planning signals rather than exact linguistic measurements.'
        ]
      }
    ],
    faq: [
      { q: 'Are hyphenated words counted as one word or two?', a: 'When the browser language segmenter is available, segmentation follows that engine’s word rules. The fallback treats whitespace-separated text as words, so a hyphenated token without spaces remains one token.' },
      { q: 'Does the character count include spaces?', a: 'The main Characters metric includes spaces. Toolmera also shows a separate No spaces count.' },
      { q: 'How is reading time calculated?', a: 'Reading time is estimated at 220 words per minute and rounded up to the next whole minute when text is present.' },
      { q: 'Is sentence count exact?', a: 'No. It is a segmentation estimate and should not be treated as a full grammar parse.' }
    ],
    related: [
      { id: 'case-converter', anchor: 'change text case after checking its length' }
    ]
  },

  'case-converter': {
    title: 'Case Converter — Uppercase, Title, camelCase & More',
    description: 'Convert text to uppercase, lowercase, simple title case, sentence case, camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE.',
    intro: 'Transform text between common capitalization and developer naming styles, then copy the result in one click.',
    sections: [
      {
        title: 'Capitalization and naming styles explained',
        paragraphs: [
          'UPPERCASE and lowercase change letter case without restructuring the text. Sentence case lowercases the input and capitalizes the beginning of sentences. Simple Title Case capitalizes each word.',
          'Developer naming modes reshape whitespace-separated words into camelCase, PascalCase, snake_case, kebab-case or CONSTANT_CASE for identifiers, configuration values and code conventions.'
        ],
        facts: [
          { label: 'camelCase', value: 'exampleVariableName' },
          { label: 'PascalCase', value: 'ExampleVariableName' },
          { label: 'snake_case', value: 'example_variable_name' },
          { label: 'kebab-case', value: 'example-variable-name' },
          { label: 'CONSTANT_CASE', value: 'EXAMPLE_VARIABLE_NAME' }
        ]
      },
      {
        title: 'Simple Title Case is not an editorial style guide',
        paragraphs: [
          'Toolmera’s Simple Title Case capitalizes every word. It does not apply AP, Chicago, APA or MLA rules for articles, conjunctions, prepositions or other minor words.',
          'If a publication requires a specific editorial style, use the conversion as a starting point and review the result against that style guide.'
        ]
      }
    ],
    faq: [
      { q: 'Does Title Case keep small words such as “and” or “of” lowercase?', a: 'No. Toolmera’s Simple Title Case capitalizes every word and does not apply publication-specific minor-word rules.' },
      { q: 'Can I convert text to camelCase or snake_case?', a: 'Yes. Toolmera supports camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE in addition to editorial-style case changes.' },
      { q: 'Can I copy the converted text?', a: 'Yes. Use the Copy button beside the output after applying a case mode.' },
      { q: 'Can I undo a transformation?', a: 'You can apply another mode to the original text, but transformations that remove separators or original capitalization may not be perfectly reversible from the transformed output alone.' }
    ],
    related: [
      { id: 'word-counter', anchor: 'check word and character counts' }
    ]
  },

  'json': {
    title: 'JSON Formatter & Validator — Beautify & Minify',
    description: 'Format, validate and minify JSON locally with selectable indentation, clear parse errors and no Toolmera server upload.',
    intro: 'Paste JSON to pretty-print or minify it, validate strict JSON syntax and inspect parse errors directly in your browser.',
    sections: [
      {
        title: 'JSON syntax validation and common errors',
        paragraphs: [
          'Valid JSON follows strict syntax rules. Property names and string values use double quotes, trailing commas are invalid, and comments are not part of standard JSON. Toolmera validates input with the browser’s JSON.parse implementation.',
          'When the browser error message includes a character position, Toolmera also derives a line and column to make the problem easier to locate. The tool reports malformed JSON; it does not automatically repair it.'
        ],
        facts: [
          { label: 'Valid key', value: '"name": "Toolmera"' },
          { label: 'Invalid key', value: "name: 'Toolmera'" },
          { label: 'Trailing comma', value: 'Invalid in standard JSON' },
          { label: 'Comments', value: 'Invalid in standard JSON' }
        ]
      },
      {
        title: 'Pretty print vs. minify',
        paragraphs: [
          'Pretty printing adds indentation and line breaks so nested objects and arrays are easier to inspect. Toolmera supports 2-space, 4-space and tab indentation.',
          'Minifying removes optional whitespace to create a compact JSON string. Both operations parse the JSON first, so malformed input produces a validation error instead of a misleading reformatted result.'
        ]
      }
    ],
    faq: [
      { q: 'Does Toolmera repair invalid JSON?', a: 'No. It validates with JSON.parse and reports the parse error. You must correct malformed JSON before it can be formatted or minified.' },
      { q: 'Can I choose the indentation style?', a: 'Yes. The formatter supports 2 spaces, 4 spaces or tabs.' },
      { q: 'Why are trailing commas rejected?', a: 'Trailing commas are not valid in standard JSON, even though some programming-language object syntaxes allow them.' },
      { q: 'Is JSON processed locally?', a: 'Yes. The formatter, validator and minifier run in the browser and do not send the pasted JSON to a Toolmera processing server.' }
    ],
    related: [
      { id: 'base64', anchor: 'encode a text payload as Base64' }
    ],
    sources: [
      { label: 'RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format', href: 'https://www.rfc-editor.org/rfc/rfc8259' }
    ]
  },

  'base64': {
    title: 'Base64 Encode & Decode — UTF-8 & Base64URL',
    description: 'Encode UTF-8 text to standard Base64 or Base64URL and decode it back locally in your browser.',
    intro: 'Encode text to Base64 or Base64URL, decode UTF-8 text, and keep the entire operation in your browser.',
    sections: [
      {
        title: 'What Base64 encoding does',
        paragraphs: [
          'Base64 represents bytes using a restricted set of ASCII characters so binary or UTF-8 data can travel through text-oriented systems. Toolmera converts text to UTF-8 bytes before encoding and converts decoded bytes back to UTF-8 text.',
          'Base64 increases data size compared with the original bytes and provides no secrecy. It is an encoding format, not encryption.'
        ],
        facts: [
          { label: 'Standard alphabet', value: 'A–Z, a–z, 0–9, +, /' },
          { label: 'Padding', value: '= may be added at the end' },
          { label: 'Base64URL', value: 'Uses - and _ instead of + and /' },
          { label: 'Security', value: 'Encoding, not encryption' }
        ]
      },
      {
        title: 'Standard Base64 vs. Base64URL',
        paragraphs: [
          'Standard Base64 uses + and / characters and commonly uses = padding. Base64URL replaces + with - and / with _; unpadded Base64URL is common in URL-oriented formats.',
          'Toolmera provides separate Standard Base64 and Base64URL modes. The current utility is text-focused: it does not upload or encode files and it does not generate Data URI wrappers.'
        ]
      }
    ],
    faq: [
      { q: 'Does Base64 encrypt my data?', a: 'No. Base64 is reversible encoding and provides no confidentiality.' },
      { q: 'Does Toolmera support emojis and non-English text?', a: 'Yes for valid UTF-8 text. Toolmera uses TextEncoder before encoding and TextDecoder when decoding.' },
      { q: 'What is the difference between Base64 and Base64URL?', a: 'Base64URL uses - and _ in place of + and / and is designed to be friendlier in URL-oriented contexts.' },
      { q: 'Can I encode an image or file?', a: 'Not in the current Toolmera utility. This page encodes and decodes text.' }
    ],
    related: [
      { id: 'json', anchor: 'format and validate JSON before encoding' }
    ],
    sources: [
      { label: 'RFC 4648 — Base-N Encodings', href: 'https://www.rfc-editor.org/rfc/rfc4648' }
    ]
  },
  'cagr': {
    title: 'Free CAGR Calculator — Compound Annual Growth Rate',
    description: 'Calculate CAGR from a beginning value, ending value and number of years, with the formula, limitations and related return metrics explained clearly.',
    intro: 'Calculate the compound annual growth rate between a starting value and an ending value over a multi-year period.',
    sections: [
      {
        title: 'The CAGR formula explained',
        paragraphs: [
          'CAGR is the constant annualized rate that would connect a beginning value to an ending value if growth had compounded steadily over the full period. It is a smoothing measure, not a record of what happened in each individual year.',
          'Toolmera uses CAGR = ((Ending Value ÷ Beginning Value)^(1 ÷ Years) − 1) × 100.'
        ],
        facts: [
          { label: 'Formula', value: '((Ending ÷ Beginning)^(1/Years) − 1) × 100' },
          { label: 'Result', value: 'Annualized compounded percentage rate' }
        ]
      },
      {
        title: 'CAGR vs. total return and average annual return',
        paragraphs: [
          'Total return measures the overall percentage change from beginning to end without considering how long the period lasted. CAGR converts that start-to-finish change into one annualized compounded rate.',
          'A simple average of yearly returns can be misleading because gains and losses compound multiplicatively. CAGR is geometric, but it still does not reveal the actual path of yearly returns.'
        ]
      },
      {
        title: 'What CAGR hides — and when XIRR is different',
        paragraphs: [
          'CAGR hides volatility and ignores intermediate deposits or withdrawals. Two investments can have the same CAGR even if one followed a smooth path and the other moved sharply up and down.',
          'When cash flows happen on different dates, a cash-flow-aware measure such as XIRR is usually more appropriate than simple CAGR.'
        ]
      }
    ],
    faq: [
      { q: 'What does CAGR mean?', a: 'CAGR means compound annual growth rate. It is the constant annualized compounded rate that links a beginning value to an ending value over a specified period.' },
      { q: 'Is CAGR the same as total return?', a: 'No. Total return measures overall growth across the full period; CAGR annualizes that growth into one compounded yearly rate.' },
      { q: 'Does CAGR show yearly volatility?', a: 'No. CAGR smooths the full period into one rate and does not describe the actual year-by-year path.' },
      { q: 'Can CAGR handle deposits or withdrawals?', a: 'Not correctly by itself. Intermediate cash flows generally require a cash-flow-aware measure such as XIRR.' }
    ],
    related: [
      { id: 'roi', anchor: 'calculate total and annualized ROI' },
      { id: 'compound', anchor: 'model compound growth with recurring contributions' }
    ]
  },

  'loan': {
    title: 'Free Loan Calculator — Monthly Payments & Interest',
    description: 'Calculate fixed-rate monthly loan payments, total interest, total repayment and a full amortization schedule for any currency.',
    intro: 'Estimate a fixed-rate loan payment, compare total interest and inspect how the balance changes across the repayment schedule.',
    sections: [
      {
        title: 'How amortized loan payments are calculated',
        paragraphs: [
          'A fixed-rate amortized loan spreads repayment across equal monthly installments. Early payments contain a larger interest share because interest is calculated on the higher outstanding balance; over time, more of each payment goes toward principal.',
          'Toolmera uses the standard fixed-payment formula M = P × r(1+r)^n ÷ ((1+r)^n − 1), where P is principal, r is the monthly interest rate and n is the number of monthly payments.'
        ],
        facts: [
          { label: 'Monthly rate', value: 'Annual rate ÷ 12 ÷ 100' },
          { label: 'Number of payments', value: 'Years × 12, or entered months' },
          { label: 'Zero-interest case', value: 'Payment = Principal ÷ number of payments' }
        ]
      },
      {
        title: 'What changes the total cost of a loan',
        paragraphs: [
          'A higher principal or higher interest rate increases both the payment and total interest. A longer term usually lowers the monthly payment but keeps the balance outstanding for longer, which can increase lifetime interest.',
          'The current calculator models a constant fixed rate and scheduled monthly payments. It does not include lender fees, taxes, insurance, prepayments or variable-rate changes.'
        ]
      },
      {
        title: 'Reading the amortization schedule',
        paragraphs: [
          'The schedule separates every payment into principal and interest and shows the remaining balance. Use the yearly view for a compact overview or switch to monthly detail to inspect each payment period.',
          'Because the calculator is currency-agnostic, the numbers can represent USD, EUR, GBP, CAD, AUD or another currency as long as all monetary inputs use the same unit.'
        ]
      }
    ],
    faq: [
      { q: 'Does the loan calculator support 0% interest?', a: 'Yes. At a 0% rate, Toolmera divides the principal evenly across the selected number of monthly payments.' },
      { q: 'Is this calculator tied to a specific currency?', a: 'No. The formula is currency-agnostic; use the same currency consistently for the loan amount and results.' },
      { q: 'Why does a longer loan term usually cost more interest?', a: 'A longer term keeps part of the principal outstanding for more payment periods, allowing interest to accrue for longer even though the monthly payment is lower.' },
      { q: 'Does the amortization schedule include fees or insurance?', a: 'No. It models principal and fixed-rate interest only and excludes fees, taxes, insurance, prepayments and rate changes.' }
    ],
    related: [
      { id: 'simple-interest', anchor: 'compare with non-compounding simple interest' },
      { id: 'compound', anchor: 'explore compound interest growth' }
    ]
  },

  'roi': {
    title: 'Free ROI Calculator — Return on Investment',
    description: 'Calculate ROI percentage, net gain or loss and optional annualized ROI from an initial amount, returned value and holding period.',
    intro: 'Measure total return on investment and, when a duration is provided, compare it with an annualized compounded rate.',
    sections: [
      {
        title: 'How Return on Investment is calculated',
        paragraphs: [
          'ROI measures net gain or loss relative to the amount originally invested. Toolmera calculates Net Gain = Amount Returned − Amount Invested, then ROI = Net Gain ÷ Amount Invested × 100.',
          'A positive result represents a gain relative to the starting cost; a negative result represents a loss.'
        ],
        facts: [
          { label: 'Net gain/loss', value: 'Amount Returned − Amount Invested' },
          { label: 'ROI', value: '(Net Gain ÷ Amount Invested) × 100' }
        ]
      },
      {
        title: 'Simple ROI vs. annualized ROI',
        paragraphs: [
          'Simple ROI ignores how long the result took to achieve. A 50% gain over one year and a 50% gain over ten years have the same simple ROI even though their annualized growth rates are very different.',
          'When a positive duration and positive ending value are provided, Toolmera also shows the compounded annualized rate implied by the start and end values.'
        ]
      },
      {
        title: 'What the calculator does not include automatically',
        paragraphs: [
          'ROI can be used for investments, business projects or marketing spend, but the quality of the result depends on what you include in the returned value and investment cost.',
          'Taxes, fees, operating expenses and other costs are not added automatically. Include them in your own input assumptions when they matter.'
        ]
      }
    ],
    faq: [
      { q: 'Can ROI be negative?', a: 'Yes. If the amount returned is lower than the amount invested, Toolmera shows a negative ROI and labels the absolute difference as a net loss.' },
      { q: 'What is annualized ROI?', a: 'It converts the start-to-finish value change into an equivalent compounded annual rate using the duration you enter.' },
      { q: 'Does this include taxes or ongoing fees?', a: 'No. The calculator only uses the values entered. Adjust your inputs if you want those costs reflected.' },
      { q: 'Is ROI the same as CAGR?', a: 'Simple ROI measures total percentage gain or loss, while CAGR annualizes a start-to-finish value change over time.' }
    ],
    related: [
      { id: 'cagr', anchor: 'compare with compound annual growth rate' },
      { id: 'percentage', anchor: 'solve general percentage-change questions' }
    ]
  },

  'discount': {
    title: 'Free Discount Calculator — Sale Price & Savings',
    description: 'Calculate final sale price, total savings and effective discount for percentage, fixed-amount and stacked discounts.',
    intro: 'Calculate sale prices instantly, including sequential offers such as 20% off plus an extra 10% off.',
    sections: [
      {
        title: 'How percentage discounts reduce a price',
        paragraphs: [
          'For a single percentage discount, savings equal Original Price × Discount Rate. The final price is the original amount minus those savings.',
          'Toolmera also supports a fixed-amount discount when a promotion removes a specific monetary amount instead of a percentage.'
        ]
      },
      {
        title: 'Why stacked discounts are not simply added',
        paragraphs: [
          'Sequential discounts are applied one after another. A 20% discount on 100 reduces the price to 80; an additional 10% discount then removes 8 from that reduced balance.',
          'The final price is 72, so the effective discount is 28%, not 30%. Toolmera calculates the combined effective percentage automatically.'
        ],
        facts: [
          { label: '20% off 100', value: 'Price becomes 80' },
          { label: 'Extra 10% off 80', value: 'Price becomes 72' },
          { label: 'Effective total discount', value: '28%' }
        ]
      }
    ],
    faq: [
      { q: 'Why is 20% off plus 10% off not 30% off?', a: 'The second discount is applied to the already-reduced price, so 20% followed by 10% produces an effective 28% reduction.' },
      { q: 'Can I enter a fixed amount off instead of a percentage?', a: 'Yes. Switch to Fixed amount off and enter the monetary discount directly.' },
      { q: 'Does the calculator include sales tax?', a: 'No. It calculates promotional discounts only; tax rules vary by location.' },
      { q: 'Can the final price go below zero?', a: 'No. Toolmera caps savings at the original price so the final price cannot become negative.' }
    ],
    related: [
      { id: 'percentage', anchor: 'use the full percentage calculator' }
    ]
  },

  'simple-interest': {
    title: 'Free Simple Interest Calculator — Interest & Balance',
    description: 'Calculate non-compounding simple interest and total amount across years, months or days with 365-day and 360-day conventions.',
    intro: 'Calculate interest that accrues only on the original principal using a transparent simple-interest formula.',
    sections: [
      {
        title: 'The simple interest formula explained',
        paragraphs: [
          'Simple interest calculates interest only on the original principal. Interest already accrued is not added back to the principal for future interest calculations.',
          'Toolmera uses I = P × r × t, where P is principal, r is the annual rate as a decimal and t is time expressed in years.'
        ],
        facts: [
          { label: 'Interest', value: 'I = P × r × t' },
          { label: 'Total amount', value: 'A = P + I' },
          { label: 'Months', value: 't = months ÷ 12' }
        ]
      },
      {
        title: 'Simple interest vs. compound interest',
        paragraphs: [
          'Simple interest grows linearly because the interest base remains the original principal. Compound interest can grow faster because accumulated interest is added to the balance and can itself earn interest.',
          'Use the Compound Interest Calculator when interest is periodically capitalized or when recurring contributions are part of the scenario.'
        ]
      },
      {
        title: '365-day vs. 360-day calculations',
        paragraphs: [
          'For day-based periods, Toolmera lets you choose a 365-day year or a 360-day banking convention. The selected basis changes how a number of days is converted into a fraction of a year.',
          'Real contracts can use their own day-count conventions, so check the applicable agreement when the exact contractual interest amount matters.'
        ]
      }
    ],
    faq: [
      { q: 'How is simple interest calculated for months?', a: 'Toolmera converts months to years by dividing the number of months by 12, then applies I = P × r × t.' },
      { q: 'How are day-based periods handled?', a: 'Choose either a 365-day year or a 360-day banking basis; Toolmera divides the number of days by that basis.' },
      { q: 'Does simple interest compound?', a: 'No. Interest is calculated only on the original principal in this tool.' },
      { q: 'What is the difference from the Compound Interest Calculator?', a: 'Compound interest can earn interest on prior interest; simple interest does not.' }
    ],
    related: [
      { id: 'compound', anchor: 'compare with compound interest' },
      { id: 'loan', anchor: 'calculate an amortized fixed-rate loan' }
    ]
  },

  'date-difference': {
    title: 'Free Date Difference Calculator — Days Between Dates',
    description: 'Calculate calendar duration, total days, weeks, hours and weekday-only business days between two dates with an inclusive-end option.',
    intro: 'Measure the elapsed time between any two calendar dates and choose whether the end date should be included.',
    sections: [
      {
        title: 'How calendar differences are calculated',
        paragraphs: [
          'Calendar duration has to respect real month lengths and leap years rather than treating every month or year as the same number of days. Toolmera calculates a calendar years-months-days breakdown separately from the absolute elapsed-day count.',
          'The total-day calculation uses UTC calendar-day boundaries to avoid local timezone shifts changing the selected dates.'
        ]
      },
      {
        title: 'Exclusive vs. inclusive end dates',
        paragraphs: [
          'Standard elapsed difference treats January 1 to January 2 as one day. When Include end date is enabled, both calendar dates are counted, so that same range spans two counted days.',
          'Use the inclusive option for workflows such as event dates or other periods where the final calendar day should be part of the count.'
        ]
      },
      {
        title: 'How business days are counted',
        paragraphs: [
          'Toolmera counts Monday through Friday as business days and excludes Saturdays and Sundays. The business-day count follows the same end-date inclusion setting as the total-day result.',
          'Public holidays are not removed because holiday calendars differ by country and region.'
        ]
      }
    ],
    faq: [
      { q: 'Does the calculator account for leap years?', a: 'Yes. Calendar and total-day calculations use real Gregorian calendar dates, including February 29 in leap years.' },
      { q: 'What does Include end date do?', a: 'It adds the ending calendar date to the counted period. Without it, the tool measures standard elapsed time between the two dates.' },
      { q: 'Are public holidays excluded from business days?', a: 'No. Business days exclude Saturdays and Sundays only; public holidays vary by location.' },
      { q: 'How is this different from the Age Calculator?', a: 'Age Calculator is designed around birth dates and birthday milestones; Date Difference measures general start-to-end calendar intervals.' }
    ],
    related: [
      { id: 'age', anchor: 'calculate age and birthday milestones' }
    ]
  },

  'average': {
    title: 'Free Average Calculator — Mean, Median, Mode & Range',
    description: 'Calculate mean, median, mode, range, sum, count, minimum and maximum from numbers separated by spaces, commas or line breaks.',
    intro: 'Paste a list of numbers to calculate the main descriptive statistics in one compact summary.',
    sections: [
      {
        title: 'Mean, median and mode explained',
        paragraphs: [
          'The arithmetic mean is the sum of all values divided by the number of values. The median is the middle value after sorting the dataset, or the average of the two middle values when the count is even.',
          'The mode is the most frequently occurring value. Toolmera can report multiple modes when several values share the same highest frequency; if every value occurs only once, it reports No mode.'
        ],
        facts: [
          { label: 'Mean', value: 'Sum ÷ Count' },
          { label: 'Median', value: 'Middle value of the sorted dataset' },
          { label: 'Range', value: 'Maximum − Minimum' }
        ]
      },
      {
        title: 'When median can be more useful than mean',
        paragraphs: [
          'The mean reacts strongly to extreme values because every number contributes directly to the total. The median depends on position rather than magnitude, so it can better represent the center of a highly skewed dataset.',
          'Toolmera shows both so you can compare the arithmetic center with the ordered middle of the data.'
        ]
      },
      {
        title: 'Flexible dataset input',
        paragraphs: [
          'Enter numbers separated by commas, spaces or line breaks. The calculator validates the tokens before producing results and also reports count, sum, minimum and maximum.',
          'Use Copy statistical summary when you want to move the calculated results into notes, a document or another workflow.'
        ]
      }
    ],
    faq: [
      { q: 'How can I separate the numbers?', a: 'Use spaces, commas or line breaks. Toolmera parses all three separator styles.' },
      { q: 'What happens when there is no repeated number?', a: 'If every value occurs only once, Toolmera reports No mode.' },
      { q: 'How is median calculated for an even number of values?', a: 'The values are sorted and the two middle numbers are averaged.' },
      { q: 'Can a dataset have more than one mode?', a: 'Yes. If multiple values share the same highest frequency, Toolmera lists all of them.' }
    ],
    related: [
      { id: 'percentage', anchor: 'calculate percentages from your results' }
    ]
  },
  'webp-jpg': {
    title: 'Free WebP to JPG Converter — Convert Images Online',
    description: 'Convert static WebP images to JPG in your browser with adjustable quality and a selectable background color for transparent areas.',
    intro: 'Convert WebP images to widely compatible JPG files locally, with control over JPEG quality and the color used behind transparent pixels.',
    sections: [
      {
        title: 'Why convert WebP to JPG',
        paragraphs: [
          'WebP is efficient for modern web delivery, but some editors, upload forms and legacy applications still work more reliably with JPG. Converting changes the file format without changing the pixel dimensions.',
          'Toolmera decodes the static WebP in the browser, draws it to Canvas and exports a new JPEG file.'
        ]
      },
      {
        title: 'What happens to transparency',
        paragraphs: [
          'JPG does not support an alpha channel. If the source WebP contains transparent pixels, Toolmera fills the Canvas with your selected background color before drawing the image.',
          'White is the default, but you can choose another color and reconvert before downloading.'
        ]
      },
      {
        title: 'Quality and metadata tradeoffs',
        paragraphs: [
          'JPEG is lossy, so lowering quality can reduce file size while also removing detail. The current slider lets you choose the balance and shows the actual before-and-after size.',
          'Because Canvas creates a fresh image file from decoded pixels, source EXIF or GPS metadata is not copied into the JPG output.'
        ]
      }
    ],
    faq: [
      { q: 'Can JPG keep WebP transparency?', a: 'No. JPG has no alpha channel, so Toolmera replaces transparent areas with the background color you choose.' },
      { q: 'Does WebP to JPG reduce quality?', a: 'JPG uses lossy compression. Higher quality settings retain more detail; lower settings can reduce file size more aggressively.' },
      { q: 'Can I convert several WebP files at once?', a: 'Yes. You can queue up to four WebP images in the current batch converter.' },
      { q: 'Does the JPG keep WebP metadata?', a: 'No. The current Canvas-based conversion creates a fresh image from pixels and does not copy source EXIF or GPS metadata.' }
    ],
    related: [
      { id: 'webp-png', anchor: 'convert WebP to PNG and keep transparency' },
      { id: 'png-jpg', anchor: 'convert PNG to JPG with a background color' },
      { id: 'compress-jpg', anchor: 'compress the JPG after conversion' }
    ]
  },

  'heic-jpg': {
    title: 'Free HEIC to JPG Converter — Convert iPhone Photos Online',
    description: 'Convert HEIC and HEIF photos to JPG or PNG locally in your browser with adjustable JPG quality and no Toolmera file upload.',
    intro: 'Decode HEIC or HEIF photos in your browser, choose JPG or PNG output, and download a new image file.',
    sections: [
      {
        title: 'Why HEIC photos sometimes need conversion',
        paragraphs: [
          'HEIC and HEIF are efficient image containers commonly produced by Apple devices, but some websites, desktop apps and older workflows still expect JPG or PNG.',
          'Toolmera loads a dedicated browser decoder only when this tool is used, then creates a standard image file from the decoded photo.'
        ]
      },
      {
        title: 'Choose JPG or PNG output',
        paragraphs: [
          'Choose JPG when broad photo compatibility and smaller photographic files matter. Choose PNG when your downstream workflow specifically requires PNG.',
          'JPG quality is adjustable. PNG output does not use the same lossy quality control.'
        ]
      },
      {
        title: 'Metadata and memory limits',
        paragraphs: [
          'The converted output is a fresh image and does not preserve the original HEIC metadata. Bursts, Live Photo metadata and other container-level information are not a supported preservation workflow.',
          'High-resolution phone photos can require substantial browser memory while decoding, so very large files may be limited by the device running the browser.'
        ]
      }
    ],
    faq: [
      { q: 'Can Toolmera convert HEIF as well as HEIC?', a: 'Yes. The current upload accepts HEIC and HEIF image files supported by the browser-side decoder.' },
      { q: 'Can I output PNG instead of JPG?', a: 'Yes. Use the output toggle to choose JPG or PNG before reconverting.' },
      { q: 'Does conversion keep camera metadata?', a: 'No. The current browser conversion creates a new image file and does not preserve the original HEIC metadata.' },
      { q: 'Can I batch-convert many HEIC photos?', a: 'Yes. You can queue up to four HEIC or HEIF photos and convert them in one batch.' }
    ],
    related: [
      { id: 'compress-jpg', anchor: 'compress the converted JPG' },
      { id: 'jpg-png', anchor: 'convert an existing JPG to PNG' },
      { id: 'resize-image', anchor: 'resize a converted photo' }
    ]
  },

  'compress-jpg': {
    title: 'Free Compress JPG — Reduce JPEG File Size Online',
    description: 'Compress JPG and JPEG images in your browser with an adjustable quality slider and a real before-and-after size comparison.',
    intro: 'Reduce JPG file size while keeping JPG output and checking the actual size result before download.',
    sections: [
      {
        title: 'How JPG compression works here',
        paragraphs: [
          'Toolmera decodes the source JPG, draws the pixels to Canvas and exports a fresh JPEG at the quality level you choose. Lower settings generally reduce file size more but can introduce softness or compression artifacts.',
          'There is no universal percentage saving because the result depends on how the source file was originally encoded and how much visual detail it contains.'
        ]
      },
      {
        title: 'Why the result may not always be smaller',
        paragraphs: [
          'A JPG that was already heavily optimized can sometimes become larger when re-encoded at a new setting. Toolmera compares the bytes and keeps the original file when the new JPEG would be larger.',
          'The displayed before-and-after size is the useful measure for your specific image.'
        ]
      },
      {
        title: 'Resize, compress or convert?',
        paragraphs: [
          'Resize Image changes pixel dimensions. Compress JPG keeps JPG but changes encoding quality. JPG to WebP changes the image codec entirely.',
          'If a photo is far larger than its display size, resizing first and then compressing is often the more effective workflow.'
        ]
      }
    ],
    faq: [
      { q: 'Will compression change my JPG dimensions?', a: 'No. Compress JPG keeps the current pixel width and height.' },
      { q: 'What happens if the compressed version is larger?', a: 'Toolmera keeps the original JPG bytes instead of giving you a larger re-encoded file.' },
      { q: 'Does the tool preserve EXIF metadata?', a: 'No. Canvas re-encoding creates a fresh JPEG from pixels and does not copy the original EXIF metadata.' },
      { q: 'Can I compress several JPGs at once?', a: 'Yes. You can queue up to four JPG or JPEG images in one compression batch.' }
    ],
    related: [
      { id: 'compress-image', anchor: 'use the multi-format image compressor' },
      { id: 'resize-image', anchor: 'resize the JPG before compression' },
      { id: 'jpg-webp', anchor: 'convert the JPG to WebP instead' }
    ]
  },

  'compress-png': {
    title: 'Free Compress PNG — Reduce PNG File Size Online',
    description: 'Compress PNG images with browser-side palette quantization while keeping PNG output and transparency data in the image pipeline.',
    intro: 'Reduce PNG size with color-palette quantization and keep the output as a genuine PNG file.',
    sections: [
      {
        title: 'How PNG quantization reduces size',
        paragraphs: [
          'PNG does not expose a JPEG-style quality slider in the browser. Toolmera instead uses palette quantization: the decoded RGBA pixels are re-encoded with a limited color palette.',
          'You can choose 256, 128 or 64 colors. Fewer colors can reduce size more, but gradients and detailed artwork may show stronger color simplification.'
        ]
      },
      {
        title: 'PNG output stays PNG',
        paragraphs: [
          'Unlike Toolmera’s general Compress Image page, this dedicated tool does not convert PNG input to WebP. The output remains a PNG blob.',
          'The encoder receives RGBA pixel data, so transparency is part of the source used during the PNG re-encode. Always inspect important assets before replacing originals.'
        ]
      },
      {
        title: 'When to use PNG compression instead of WebP',
        paragraphs: [
          'Use this tool when a destination specifically requires PNG or when you need to stay within a PNG-based workflow. If format flexibility is available, PNG to WebP may produce a smaller web-delivery file.'
        ]
      }
    ],
    faq: [
      { q: 'Does this tool convert PNG to WebP?', a: 'No. Compress PNG produces a PNG output file.' },
      { q: 'What does the color setting change?', a: 'It limits the palette used by the PNG encoder. Lower palette counts can reduce file size but may simplify colors more visibly.' },
      { q: 'Can PNG transparency be used in the output?', a: 'The compressor encodes from RGBA pixel data, including alpha information from the decoded source. Check the output visually for critical transparent assets.' },
      { q: 'Is this lossless compression?', a: 'No. Palette quantization can reduce color precision, so the dedicated compressor should be treated as a lossy PNG optimization workflow.' }
    ],
    related: [
      { id: 'png-webp', anchor: 'convert PNG to WebP for web delivery' },
      { id: 'compress-image', anchor: 'use the general image compressor' },
      { id: 'resize-image', anchor: 'resize the PNG before optimization' }
    ]
  },

  'crop-image': {
    title: 'Free Crop Image Tool — Crop Photos Online',
    description: 'Crop static JPG, PNG and WebP images in your browser with visual drag selection, aspect-ratio presets and exact crop coordinates.',
    intro: 'Draw a crop area on your image, choose a common aspect ratio, fine-tune the pixel coordinates, and export the selected region locally.',
    sections: [
      {
        title: 'How the visual crop selection works',
        paragraphs: [
          'Upload a static JPG, PNG or WebP and drag across the preview to create a crop rectangle. Toolmera shows only the selected area at full brightness while dimming the pixels that will be removed.',
          'You can also edit X, Y, width and height numerically when an exact pixel region matters.'
        ]
      },
      {
        title: 'Aspect ratios for common layouts',
        paragraphs: [
          'Free crop follows the rectangle you draw. Presets for 1:1, 4:3, 16:9 and 9:16 create centered selections with those proportions, which can help prepare assets for square, landscape or vertical layouts.',
          'Cropping changes which pixels are kept; it is different from resizing, which changes the dimensions of the retained image.'
        ]
      },
      {
        title: 'What happens during export',
        paragraphs: [
          'The selected pixels are drawn to a new Canvas and exported in the source image format when that format is JPG, PNG or WebP.',
          'JPEG and WebP outputs are re-encoded, while PNG uses PNG export. Source metadata is not copied into the new cropped file.'
        ]
      }
    ],
    faq: [
      { q: 'Can I crop to a square?', a: 'Yes. Choose the 1:1 preset and then drag or fine-tune the crop area.' },
      { q: 'Can I enter exact crop dimensions?', a: 'Yes. The current tool exposes X, Y, width and height fields in source-image pixels.' },
      { q: 'Does cropping resize the selected area?', a: 'No. The exported crop uses the selected pixel width and height. Use Resize Image afterward if you need different output dimensions.' },
      { q: 'Does the cropper support animation?', a: 'The current crop workflow is intended for static JPG, PNG and WebP images.' }
    ],
    related: [
      { id: 'resize-image', anchor: 'resize the cropped image' },
      { id: 'compress-image', anchor: 'compress the cropped image' },
      { id: 'compress-jpg', anchor: 'compress a cropped JPG' }
    ]
  },

  'pdf-jpg': {
    title: 'Free PDF to JPG Converter — Convert PDF Pages to Images',
    description: 'Convert selected PDF pages to JPG or PNG in your browser, choose render scale, and download multiple pages as a ZIP.',
    intro: 'Render PDF pages locally as JPG or PNG images with page-range selection and sequential processing for better memory control.',
    sections: [
      {
        title: 'How PDF pages become images',
        paragraphs: [
          'A PDF page is not simply an image file. Toolmera uses a PDF rendering engine in the browser to paint the selected page onto Canvas, then exports those rendered pixels as JPG or PNG.',
          'Choose JPG for compact photographic-style output or PNG when you want a lossless image encoding of the rendered page.'
        ]
      },
      {
        title: 'Page selection and render scale',
        paragraphs: [
          'Enter all to render every page, or use page syntax such as 1-3, 5. The render-scale control changes the pixel dimensions produced from the PDF viewport.',
          'Higher scale gives more pixels and sharper small text, but it also increases output size, rendering time and browser memory use.'
        ]
      },
      {
        title: 'Multi-page downloads and limitations',
        paragraphs: [
          'A single selected page downloads as one image. Multiple selected pages are processed sequentially and bundled into a ZIP file.',
          'Password-protected PDFs are not supported in the current version. Very large or complex PDFs can also be limited by available browser memory.'
        ]
      }
    ],
    faq: [
      { q: 'Can I convert only selected PDF pages?', a: 'Yes. Enter all or a mixed selection such as 1-3, 5.' },
      { q: 'Can I output PNG instead of JPG?', a: 'Yes. The same PDF renderer includes a JPG / PNG output toggle.' },
      { q: 'How are multiple image pages downloaded?', a: 'When more than one page is selected, Toolmera packages the rendered images into a ZIP file.' },
      { q: 'Can Toolmera convert a password-protected PDF?', a: 'Not in the current version. Use an unencrypted PDF that the browser can parse without a password prompt.' }
    ],
    related: [
      { id: 'jpg-pdf', anchor: 'convert JPG images back to PDF' },
      { id: 'rotate-pdf', anchor: 'rotate PDF pages before rendering' },
      { id: 'remove-pdf-pages', anchor: 'remove unwanted pages first' }
    ]
  },

  'rotate-pdf': {
    title: 'Free Rotate PDF Tool — Rotate PDF Pages Online',
    description: 'Rotate all, odd, even or custom PDF pages by 90 degrees clockwise, counter-clockwise or 180 degrees directly in your browser.',
    intro: 'Fix sideways or upside-down PDF pages and save the rotation into a new PDF file locally.',
    sections: [
      {
        title: 'Rotate all pages or only selected pages',
        paragraphs: [
          'Use All pages when the whole document has the wrong orientation, Odd or Even for alternating scan problems, or Custom pages for syntax such as 2, 5-8.',
          'Toolmera validates custom page numbers against the actual PDF page count before saving.'
        ]
      },
      {
        title: 'How permanent PDF rotation works',
        paragraphs: [
          'Toolmera reads each selected page’s current rotation angle and adds 90 degrees clockwise, 90 degrees counter-clockwise or 180 degrees.',
          'The page content is not rasterized into screenshots during this operation; the updated document is saved as a new PDF.'
        ]
      }
    ],
    faq: [
      { q: 'Can I rotate one PDF page without rotating the rest?', a: 'Yes. Choose Custom pages and enter a page number or range.' },
      { q: 'What if a page already has a rotation value?', a: 'Toolmera adds your selected rotation to the page’s current angle instead of blindly replacing it.' },
      { q: 'Does rotating a PDF turn the page into an image?', a: 'No. The operation updates page rotation structurally and saves a new PDF.' },
      { q: 'Does Toolmera modify the original PDF on my device?', a: 'No. It creates a separate rotated PDF for download.' }
    ],
    related: [
      { id: 'remove-pdf-pages', anchor: 'remove unwanted PDF pages' },
      { id: 'merge-pdf', anchor: 'merge rotated PDF files' },
      { id: 'pdf-jpg', anchor: 'convert rotated pages to images' }
    ]
  },

  'remove-pdf-pages': {
    title: 'Free Remove PDF Pages — Delete Pages from PDF Online',
    description: 'Delete individual page numbers or ranges from a PDF in your browser and download a new document with the remaining pages.',
    intro: 'Enter pages such as 2, 5-9, 12, see how many pages will remain, and export a cleaned PDF locally.',
    sections: [
      {
        title: 'Page range syntax',
        paragraphs: [
          'Enter single page numbers separated by commas, ranges with a hyphen, or combine both forms. For example: 2, 5-9, 12.',
          'Toolmera checks every number against the actual document page count and prevents a selection that would remove every page.'
        ],
        facts: [
          { label: 'Single pages', value: '2, 5, 12' },
          { label: 'Page range', value: '5-9' },
          { label: 'Combined', value: '2, 5-9, 12' }
        ]
      },
      {
        title: 'What happens to the remaining pages',
        paragraphs: [
          'The selected page indices are excluded and the remaining pages are copied into a new PDF in their original order.',
          'The original source file is not overwritten. The tool creates a separate download so you can keep the original document unchanged.'
        ]
      }
    ],
    faq: [
      { q: 'Can I remove several page ranges at once?', a: 'Yes. Combine single pages and ranges in one field, for example 2, 5-9, 12.' },
      { q: 'Can I remove every page from the PDF?', a: 'No. Toolmera requires at least one page to remain in the output document.' },
      { q: 'Can I see how many pages will remain?', a: 'Yes. After a valid PDF is loaded, the interface shows the selected removal count and remaining page count.' },
      { q: 'Is the original PDF changed?', a: 'No. Toolmera creates a new PDF without the selected pages.' }
    ],
    related: [
      { id: 'split-pdf', anchor: 'extract one continuous PDF range instead' },
      { id: 'merge-pdf', anchor: 'merge the cleaned PDF with another file' },
      { id: 'rotate-pdf', anchor: 'rotate remaining pages' }
    ]
  },
  'qr-code': {
    title: 'Free QR Code Generator — Create Custom QR Codes Online',
    description: 'Generate static QR codes for URLs or text with custom colors, error correction, quiet-zone control, PNG and SVG downloads.',
    intro: 'Create a static QR code directly in your browser, customize its appearance and download PNG or SVG output.',
    sections: [
      {
        title: 'How a static QR code works',
        paragraphs: [
          'A static QR code stores the text or URL directly in the matrix. Toolmera does not create a redirect URL or a managed short link for this generator.',
          'That means the QR image itself has no subscription or account dependency. If it contains a website URL, the destination still needs to remain available for the link to work.'
        ]
      },
      {
        title: 'Error correction and quiet zones',
        paragraphs: [
          'QR error-correction levels trade data capacity for resilience. Higher levels add more recovery information, which can help a code remain readable after limited damage or obstruction but can also make the matrix denser.',
          'The quiet zone is the empty border around the symbol. Keeping a clear margin and strong foreground-to-background contrast improves scan reliability.'
        ],
        facts: [
          { label: 'L', value: 'Low error correction' },
          { label: 'M', value: 'Medium error correction' },
          { label: 'Q', value: 'Quartile error correction' },
          { label: 'H', value: 'High error correction' }
        ]
      },
      {
        title: 'PNG vs. SVG download',
        paragraphs: [
          'PNG is convenient for documents, social graphics and general image workflows. SVG is vector-based and can scale cleanly for print or design software.',
          'Always test the final QR code with the actual size, colors and destination where it will be used before printing a large batch.'
        ]
      }
    ],
    faq: [
      { q: 'Are Toolmera QR codes static or dynamic?', a: 'They are static. The entered text or URL is encoded directly into the QR matrix without a Toolmera redirect service.' },
      { q: 'Do static QR codes expire?', a: 'The QR image has no built-in expiration. A linked website can still stop working if the destination URL changes or goes offline.' },
      { q: 'Can I download an SVG QR code?', a: 'Yes. The current generator provides both PNG and SVG downloads.' },
      { q: 'Can I customize QR colors?', a: 'Yes. Choose foreground and background colors, but keep enough contrast for reliable scanning.' }
    ],
    related: [
      { id: 'base64', anchor: 'encode text as Base64 before sharing it' },
      { id: 'case-converter', anchor: 'clean up text before encoding it' }
    ]
  },

  'uuid': {
    title: 'Free UUID Generator — Generate UUID v4 & GUID Values',
    description: 'Generate one or many random UUID version 4 identifiers with case, hyphen and wrapping controls, then copy or download them.',
    intro: 'Create UUID v4 identifiers locally with the browser cryptographic API and practical bulk-formatting controls.',
    sections: [
      {
        title: 'What a UUID v4 is',
        paragraphs: [
          'A UUID is a 128-bit identifier commonly used for database records, distributed systems, API objects and other resources that need identifiers without a central counter.',
          'Version 4 UUIDs are random identifiers with specific version and variant bits. Toolmera uses crypto.randomUUID() when available and a Web Crypto byte fallback when needed.'
        ]
      },
      {
        title: 'Bulk formatting options',
        paragraphs: [
          'Generate up to 1,000 values per batch, keep or remove standard hyphens, switch letter case and wrap the output as plain lines, quoted values, braces or a JSON array.',
          'Formatting changes only the text representation; the underlying generated UUID values stay the same until you generate a new batch.'
        ]
      }
    ],
    faq: [
      { q: 'Which UUID version does this tool generate?', a: 'Toolmera generates random UUID version 4 identifiers only.' },
      { q: 'Can I generate multiple UUIDs at once?', a: 'Yes. The current batch control supports from 1 to 1,000 UUIDs.' },
      { q: 'Can I remove UUID hyphens?', a: 'Yes. Toggle standard hyphens off if your target system expects a compact hexadecimal representation.' },
      { q: 'Are generated UUIDs sent to a Toolmera server?', a: 'No. UUID generation in this tool runs in the browser with the Web Crypto API.' }
    ],
    related: [
      { id: 'json', anchor: 'format JSON containing generated UUIDs' },
      { id: 'base64', anchor: 'encode identifier text as Base64' }
    ]
  },

  'password': {
    title: 'Free Password Generator — Create Strong Random Passwords',
    description: 'Generate random passwords locally with configurable length, uppercase, lowercase, digits, symbols and ambiguous-character exclusion.',
    intro: 'Create a random password in your browser using the character sets and length you choose.',
    sections: [
      {
        title: 'How Toolmera generates password characters',
        paragraphs: [
          'Toolmera draws random choices from the browser Web Crypto API instead of Math.random(). The generator ensures that every selected character group contributes at least one character, then securely shuffles the result.',
          'You can include uppercase letters, lowercase letters, digits and symbols, and optionally remove visually ambiguous characters such as I, l, 1, O and 0.'
        ]
      },
      {
        title: 'Length and search-space estimates',
        paragraphs: [
          'Longer random passwords generally create a much larger possible search space. Toolmera displays a character-space entropy estimate based on the selected pool size and password length.',
          'That number is a mathematical estimate, not a guarantee that an account is secure. Rate limits, password reuse, phishing, credential theft and the security of the service itself also matter.'
        ]
      }
    ],
    faq: [
      { q: 'What randomness source does the generator use?', a: 'Toolmera uses the browser Web Crypto API for random character selection.' },
      { q: 'Can I exclude confusing characters?', a: 'Yes. Enable the ambiguity filter to remove I, l, 1, O and 0 from the active character pools.' },
      { q: 'Does selecting a character type guarantee it appears?', a: 'Yes. The current generator places at least one character from every selected group before filling and shuffling the rest.' },
      { q: 'Is the entropy badge a security guarantee?', a: 'No. It is a search-space estimate based on length and the available character pool, not a guarantee about an account or system.' }
    ],
    related: [
      { id: 'uuid', anchor: 'generate UUID v4 identifiers' },
      { id: 'base64', anchor: 'encode non-secret text as Base64' }
    ]
  },

  'random-number': {
    title: 'Free Random Number Generator — Pick Numbers Online',
    description: 'Generate random integers or decimals with custom min and max values, quantity, precision, unique-value and sorting controls.',
    intro: 'Pick one random value or generate a list across a custom numeric range with Web Crypto-backed sampling.',
    sections: [
      {
        title: 'Integer and decimal generation',
        paragraphs: [
          'Integer mode draws whole numbers between the inclusive minimum and maximum. Decimal mode converts the requested precision into discrete numeric steps and draws from that finite range.',
          'The generator supports up to six decimal places and can return one value or a larger list.'
        ]
      },
      {
        title: 'Unique values and sorting',
        paragraphs: [
          'Enable Unique values only when duplicates are not acceptable. Toolmera checks that the requested quantity can fit inside the selected discrete range before generating.',
          'Results can remain in random order or be sorted ascending or descending after generation.'
        ]
      },
      {
        title: 'How bounded random values are sampled',
        paragraphs: [
          'Toolmera draws browser Web Crypto values and uses rejection sampling for bounded integer selection instead of a naive modulo operation.',
          'This is a general-purpose utility and is not presented as a certified lottery, gaming or regulated drawing system.'
        ]
      }
    ],
    faq: [
      { q: 'Can I generate unique numbers only?', a: 'Yes. Enable Unique values only; the tool validates whether enough distinct values exist in the selected range.' },
      { q: 'Can the tool generate decimals?', a: 'Yes. Decimal mode supports one to six decimal places.' },
      { q: 'What is the maximum batch size?', a: 'The current interface accepts up to 10,000 generated values per run.' },
      { q: 'Does the tool use Math.random()?', a: 'No. The current implementation derives bounded values from the browser Web Crypto API.' }
    ],
    related: [
      { id: 'average', anchor: 'calculate statistics for a generated dataset' },
      { id: 'password', anchor: 'generate random passwords instead' }
    ]
  },

  'unix-timestamp': {
    title: 'Free Unix Timestamp Converter — Epoch Time to Date',
    description: 'Convert Unix timestamps in seconds or milliseconds to UTC, local and ISO dates, or convert a date-time back into epoch values.',
    intro: 'Convert Unix epoch values to readable dates and turn local or UTC date-time values back into timestamps.',
    sections: [
      {
        title: 'What Unix time represents',
        paragraphs: [
          'Unix time represents an instant as elapsed time relative to 1970-01-01T00:00:00Z. It is widely used in operating systems, application logs, databases and APIs because the numeric value itself is not a local wall-clock timezone.',
          'Toolmera shows the same parsed instant as UTC, your browser-local time and ISO 8601.'
        ]
      },
      {
        title: 'Seconds vs. milliseconds',
        paragraphs: [
          'Many systems store Unix timestamps in seconds, while JavaScript Date.now() returns milliseconds. Toolmera can auto-detect the likely unit by numeric magnitude, and a manual selector is available when you already know the source format.',
          'Both seconds and milliseconds are also shown when converting a calendar date back to epoch time.'
        ]
      },
      {
        title: 'Local time and UTC mode',
        paragraphs: [
          'Local mode interprets the date-time picker using the browser’s current timezone rules. UTC mode treats the entered calendar fields as UTC.',
          'Daylight-saving behavior for local mode follows the timezone information available to the browser and operating system.'
        ]
      }
    ],
    faq: [
      { q: 'What date does Unix time start from?', a: 'The Unix epoch starts at 1970-01-01 00:00:00 UTC.' },
      { q: 'How does Toolmera detect seconds or milliseconds?', a: 'Auto mode uses the numeric magnitude as a practical heuristic, and you can override it with an explicit Seconds or Milliseconds selection.' },
      { q: 'Can I see both UTC and local time?', a: 'Yes. Timestamp-to-date output shows UTC, browser-local and ISO 8601 representations.' },
      { q: 'Can I convert a date back to Unix time?', a: 'Yes. Enter a date-time, choose Local time or UTC interpretation, and Toolmera returns seconds and milliseconds.' }
    ],
    related: [
      { id: 'date-difference', anchor: 'calculate the duration between calendar dates' },
      { id: 'age', anchor: 'calculate age from a birth date' }
    ]
  },

  'weight': {
    title: 'Free Weight Converter — Convert Kg, Lb, Oz, Grams & Stone',
    description: 'Convert kilograms, grams, milligrams, pounds, ounces, stone and metric tonnes with a live all-unit comparison matrix.',
    intro: 'Convert weight and mass measurements between common metric and imperial units.',
    sections: [
      {
        title: 'Common mass conversion relationships',
        paragraphs: [
          'Toolmera converts every supported unit through kilograms as a shared base, then calculates the selected target and the full comparison matrix.',
          'The pound and ounce entries use international avoirdupois definitions; troy ounces for precious metals are intentionally not mixed into this general weight converter.'
        ],
        facts: [
          { label: '1 pound', value: '0.45359237 kg' },
          { label: '1 kilogram', value: '1000 g' },
          { label: '1 stone', value: '14 lb' },
          { label: '1 metric tonne', value: '1000 kg' }
        ]
      }
    ],
    faq: [
      { q: 'How many kilograms are in one pound?', a: 'One international avoirdupois pound is exactly 0.45359237 kilograms.' },
      { q: 'How many pounds are in one stone?', a: 'One stone equals 14 pounds.' },
      { q: 'Does this converter use troy ounces?', a: 'No. Ounce means the standard avoirdupois ounce used for general mass, not the troy ounce used for precious metals.' },
      { q: 'Can I compare all supported units at once?', a: 'Yes. The output matrix updates every supported weight unit from the same source value.' }
    ],
    related: [
      { id: 'length', anchor: 'convert length and distance units' },
      { id: 'volume', anchor: 'convert liquid and volume units' }
    ]
  },

  'volume': {
    title: 'Free Volume Converter — Liters, Gallons, Cups, ML & Oz',
    description: 'Convert metric, US customary and UK Imperial volume units with clearly labeled gallons, fluid ounces, cups, pints and quarts.',
    intro: 'Convert liquid and volume measurements without confusing US customary and UK Imperial unit definitions.',
    sections: [
      {
        title: 'US customary and Imperial units are different',
        paragraphs: [
          'A US liquid gallon and an Imperial gallon are not the same size. The same distinction applies to fluid ounces, pints and quarts, so Toolmera labels those systems directly in each unit name.',
          'Metric units use liters as the common base while US and Imperial definitions are converted to their exact or standardized liter equivalents.'
        ],
        facts: [
          { label: 'US liquid gallon', value: '3.785411784 L' },
          { label: 'Imperial gallon', value: '4.54609 L' },
          { label: 'US fluid ounce', value: '29.5735295625 mL' },
          { label: 'Imperial fluid ounce', value: '28.4130625 mL' }
        ]
      },
      {
        title: 'Recipe conversions need the right cup definition',
        paragraphs: [
          'Toolmera labels the included cup as US customary cup. Recipe standards can vary by country, publisher and measuring set, so check the source recipe when exact culinary volume matters.',
          'The conversion matrix keeps every unit label visible to reduce accidental mixing between measurement systems.'
        ]
      }
    ],
    faq: [
      { q: 'Are US and Imperial gallons the same?', a: 'No. A US liquid gallon is 3.785411784 liters, while an Imperial gallon is 4.54609 liters.' },
      { q: 'Which cup does Toolmera use?', a: 'The current cup entry is the US customary cup, approximately 236.5882365 mL.' },
      { q: 'Can I convert cubic meters to liters?', a: 'Yes. One cubic meter equals exactly 1,000 liters.' },
      { q: 'Why are there two fluid-ounce options?', a: 'US customary and UK Imperial fluid ounces have different volumes, so Toolmera lists them separately.' }
    ],
    related: [
      { id: 'weight', anchor: 'convert mass and weight units' },
      { id: 'area', anchor: 'convert surface and land area units' }
    ]
  },

  'area': {
    title: 'Free Area Converter — Acres, Sq Ft, Hectares & Sq Meters',
    description: 'Convert square meters, square kilometers, square feet, square yards, square miles, acres, hectares and square centimeters.',
    intro: 'Convert land and surface area measurements across metric and customary square units.',
    sections: [
      {
        title: 'Area conversion uses squared unit relationships',
        paragraphs: [
          'Area measures two-dimensional surface rather than linear distance. Toolmera converts the selected area through square meters, then shows the target value and all supported equivalents.',
          'This is why a linear value in meters cannot be converted directly into square meters without another dimension.'
        ],
        facts: [
          { label: '1 acre', value: '43,560 ft²' },
          { label: '1 hectare', value: '10,000 m²' },
          { label: '1 square mile', value: '640 acres' },
          { label: '1 m²', value: '10.7639104167 ft²' }
        ]
      },
      {
        title: 'Land units vs. general surface units',
        paragraphs: [
          'Acres and hectares are common for land, while square feet, square meters and square yards are common for rooms, buildings and smaller surfaces.',
          'The all-unit matrix lets you compare land and construction measurements without changing the source value repeatedly.'
        ]
      }
    ],
    faq: [
      { q: 'How many square feet are in one acre?', a: 'One international acre equals exactly 43,560 square feet.' },
      { q: 'How many square meters are in a hectare?', a: 'One hectare equals exactly 10,000 square meters.' },
      { q: 'Can I convert meters directly to square meters?', a: 'No. Meters measure length and square meters measure area; you need two-dimensional information to calculate area.' },
      { q: 'Can I see all area equivalents together?', a: 'Yes. The conversion matrix updates all supported area units from the current source value.' }
    ],
    related: [
      { id: 'length', anchor: 'convert linear length measurements' },
      { id: 'volume', anchor: 'convert volume and capacity units' }
    ]
  },

  'speed': {
    title: 'Free Speed Converter — MPH, KM/H, M/S, Knots & Ft/S',
    description: 'Convert speed between kilometers per hour, miles per hour, meters per second, feet per second and knots with exact reference factors.',
    intro: 'Convert road, aviation, marine and scientific speed units instantly and compare all supported equivalents from one source value.',
    sections: [
      {
        title: 'Common speed conversion relationships',
        paragraphs: [
          'Toolmera converts every supported speed through meters per second, then calculates the selected target and full comparison matrix.',
          'The mph and foot-per-second values use international foot and mile definitions, while knots use the international nautical mile.'
        ],
        facts: [
          { label: '1 mph', value: '0.44704 m/s' },
          { label: '1 km/h', value: '0.277777… m/s' },
          { label: '1 knot', value: '0.514444… m/s' }
        ]
      },
      {
        title: 'When knots and road units differ',
        paragraphs: [
          'Road speeds are commonly expressed in km/h or mph, while marine and aviation speeds commonly use knots. A knot is one nautical mile per hour, not one statute mile per hour.',
          'Toolmera keeps the unit name visible throughout the conversion so those systems are not mixed accidentally.'
        ]
      }
    ],
    faq: [
      { q: 'How many km/h are in 1 mph?', a: 'One mile per hour equals exactly 1.609344 kilometers per hour.' },
      { q: 'How many mph are in 100 km/h?', a: '100 km/h is approximately 62.1371 mph.' },
      { q: 'What is one knot in km/h?', a: 'One knot equals exactly 1.852 km/h.' },
      { q: 'Does this converter include Mach?', a: 'No. Mach depends on the local speed of sound, which varies with conditions, so it is intentionally excluded from this fixed-factor converter.' }
    ],
    related: [
      { id: 'length', anchor: 'convert distance units' },
      { id: 'temperature', anchor: 'convert temperature values' }
    ]
  },

  'data-storage': {
    title: 'Free Data Storage Converter — Bytes, KB, MB, GB, KiB & GiB',
    description: 'Convert digital storage values with separate decimal SI and binary IEC modes so KB/MB/GB are not confused with KiB/MiB/GiB.',
    intro: 'Convert file and storage sizes using explicit decimal or binary definitions, then compare every unit in the selected system.',
    sections: [
      {
        title: 'Decimal SI vs. binary IEC storage',
        paragraphs: [
          'Decimal storage uses powers of 1000: one kilobyte is 1,000 bytes, one megabyte is 1,000,000 bytes and one gigabyte is 1,000,000,000 bytes.',
          'Binary IEC units use powers of 1024: one kibibyte is 1,024 bytes, one mebibyte is 1,048,576 bytes and one gibibyte is 1,073,741,824 bytes.'
        ],
        facts: [
          { label: '1 GB', value: '1,000,000,000 bytes' },
          { label: '1 GiB', value: '1,073,741,824 bytes' },
          { label: '1 MB', value: '1,000,000 bytes' },
          { label: '1 MiB', value: '1,048,576 bytes' }
        ]
      },
      {
        title: 'Why the same drive can appear to have two sizes',
        paragraphs: [
          'Storage vendors often publish capacities with decimal units, while some operating-system interfaces have historically displayed binary quantities using decimal-looking labels.',
          'Separating SI and IEC modes makes the unit definition explicit instead of pretending that GB and GiB are interchangeable.'
        ]
      }
    ],
    faq: [
      { q: 'Is 1 GB the same as 1 GiB?', a: 'No. 1 GB is 1,000,000,000 bytes, while 1 GiB is 1,073,741,824 bytes.' },
      { q: 'How many bytes are in 1 MB?', a: 'In decimal SI notation, 1 MB is 1,000,000 bytes.' },
      { q: 'How many bytes are in 1 MiB?', a: '1 MiB is 1,048,576 bytes.' },
      { q: 'Which mode should I use?', a: 'Use decimal SI when the source uses KB, MB, GB or TB. Use binary IEC when the source explicitly uses KiB, MiB, GiB or TiB.' }
    ],
    related: [
      { id: 'base64', anchor: 'work with Base64 text' },
      { id: 'json', anchor: 'format JSON payloads' }
    ]
  },

  'color': {
    title: 'Free Color Converter — HEX, RGB & HSL',
    description: 'Convert web colors between HEX, RGB and HSL with validation, a live preview and copy-ready values.',
    intro: 'Enter a HEX, RGB or HSL color and get equivalent values in the other common web color models.',
    sections: [
      {
        title: 'HEX, RGB and HSL describe the same color differently',
        paragraphs: [
          'HEX is a compact hexadecimal representation of red, green and blue channels. RGB exposes those channels directly as values from 0 to 255.',
          'HSL describes hue as an angle and saturation and lightness as percentages, which can be easier for controlled visual adjustments.'
        ]
      },
      {
        title: 'What this converter validates',
        paragraphs: [
          'HEX input accepts three-digit or six-digit RGB hex values. RGB channels are constrained to 0–255, while HSL saturation and lightness are constrained to 0–100%.',
          'The current converter focuses on opaque colors and does not expose alpha-channel conversion.'
        ]
      }
    ],
    faq: [
      { q: 'Can I enter a 3-digit HEX color?', a: 'Yes. Values such as #0AF are expanded to their six-digit RGB equivalent.' },
      { q: 'Does the tool support alpha transparency?', a: 'Not in the current version. It converts opaque HEX, RGB and HSL values.' },
      { q: 'What range does RGB use?', a: 'Each red, green and blue channel uses a value from 0 to 255.' },
      { q: 'What range does HSL use?', a: 'Hue is expressed in degrees, while saturation and lightness are percentages.' }
    ],
    related: [
      { id: 'png-webp', anchor: 'convert web image formats' },
      { id: 'json', anchor: 'format color configuration JSON' }
    ]
  },

  'time-zone': {
    title: 'Free Time Zone Converter — Convert Date & Time Between Zones',
    description: 'Convert a local date and time between IANA time zones with browser timezone rules, UTC output and daylight-saving handling.',
    intro: 'Choose the zone where a local wall-clock time occurs, then see the same instant in another time zone and in UTC.',
    sections: [
      {
        title: 'A time zone is more than a fixed UTC offset',
        paragraphs: [
          'IANA time zones such as Europe/London or America/New_York can change their UTC offset during the year because of daylight-saving rules and historical changes.',
          'Toolmera uses the browser Intl timezone database so the conversion is based on named zone rules rather than a manually fixed offset.'
        ]
      },
      {
        title: 'Daylight-saving transitions can be ambiguous',
        paragraphs: [
          'When clocks move backward, a local wall-clock time can occur twice. When clocks move forward, some local times do not occur at all.',
          'The converter uses the browser timezone engine, but ambiguous or skipped local times should be checked carefully for scheduling, legal or operational workflows.'
        ]
      }
    ],
    faq: [
      { q: 'Does the converter handle daylight saving time?', a: 'Yes, it uses the browser’s IANA/Intl timezone rules for the selected date and zone.' },
      { q: 'Can I convert to UTC?', a: 'Yes. Every conversion also shows the matching ISO 8601 UTC timestamp.' },
      { q: 'Why use named time zones instead of UTC offsets?', a: 'Named zones can apply daylight-saving and historical rules, while a fixed offset such as UTC+2 does not identify those rules.' },
      { q: 'Are all time zones available?', a: 'Modern browsers expose the IANA timezone list. Toolmera falls back to a smaller common list when that browser API is unavailable.' }
    ],
    related: [
      { id: 'unix-timestamp', anchor: 'convert the same instant to Unix time' },
      { id: 'date-difference', anchor: 'measure duration between calendar dates' }
    ]
  },

  'url-encoder': {
    title: 'Free URL Encoder & Decoder — Percent-Encoding Tool',
    description: 'Encode or decode URL components and complete URLs locally with browser-native percent-encoding functions.',
    intro: 'Percent-encode text for a path or query component, or decode encoded values back into readable text without a server round trip.',
    sections: [
      {
        title: 'URL component vs. complete URL mode',
        paragraphs: [
          'Component mode is intended for a value that belongs inside a URL, such as a query parameter, path segment or search term. It encodes reserved syntax characters more aggressively.',
          'Complete URL mode preserves structural URL characters such as colon, slash and question mark where the browser encoding function treats them as part of the URL syntax.'
        ]
      },
      {
        title: 'Percent-encoding is not encryption',
        paragraphs: [
          'Percent-encoding represents characters in a URL-safe form. Anyone who sees the encoded value can decode it.',
          'Do not use URL encoding as a privacy or security mechanism for secrets, credentials or sensitive data.'
        ]
      }
    ],
    faq: [
      { q: 'What does %20 mean in a URL?', a: 'It is the percent-encoded representation of a space character.' },
      { q: 'Should I use component or complete URL mode?', a: 'Use component mode for query values or individual path segments. Use complete URL mode when the input is a full URL and you want to preserve its syntax.' },
      { q: 'Can decoding fail?', a: 'Yes. Invalid or incomplete percent sequences can cause the browser decoder to reject the input.' },
      { q: 'Is URL encoding secure?', a: 'No. It is a transport encoding, not encryption.' }
    ],
    related: [
      { id: 'base64', anchor: 'encode text as Base64' },
      { id: 'slug', anchor: 'create a URL slug from a title' }
    ]
  },

  'slug': {
    title: 'Free Slug Generator — Create Clean URL Slugs',
    description: 'Turn titles and phrases into lowercase URL slugs with hyphen or underscore separators and optional Unicode preservation.',
    intro: 'Create compact URL-friendly slugs from headings, article titles or product names and copy the result instantly.',
    sections: [
      {
        title: 'What the slug generator changes',
        paragraphs: [
          'The generator lowercases the input, removes combining diacritic marks where possible, replaces runs of separators and punctuation with one chosen separator, and trims separators from the edges.',
          'ASCII mode removes non-Latin characters instead of inventing transliterations. Unicode preservation keeps letters from other writing systems in the slug.'
        ]
      },
      {
        title: 'Readable slugs are easier to manage',
        paragraphs: [
          'A short descriptive slug can make routes easier to read, share and maintain. It should represent the page topic without repeating an entire sentence.',
          'Changing a published slug can break inbound links unless the old URL is redirected, so treat live URL changes carefully.'
        ]
      }
    ],
    faq: [
      { q: 'Does the tool transliterate Cyrillic or other scripts?', a: 'No. ASCII mode removes non-Latin characters rather than guessing a transliteration. Enable Unicode preservation if you want those letters kept.' },
      { q: 'Can I use underscores instead of hyphens?', a: 'Yes. The separator selector supports hyphens and underscores.' },
      { q: 'Does it lowercase the slug?', a: 'Yes. Output is normalized to lowercase.' },
      { q: 'Should I change an existing indexed URL just to improve the slug?', a: 'Not casually. A URL change can affect links and indexing; use redirects when changing a published route.' }
    ],
    related: [
      { id: 'case-converter', anchor: 'transform text case first' },
      { id: 'url-encoder', anchor: 'percent-encode a URL component' }
    ]
  },

  'jwt': {
    title: 'Free JWT Decoder — Decode Header & Payload Locally',
    description: 'Decode JWT header and payload JSON locally, inspect exp, iat and nbf timestamps, and keep signature verification clearly separate.',
    intro: 'Paste a compact JSON Web Token to inspect its first two Base64URL-encoded parts. Decoding does not verify that the token is authentic or trustworthy.',
    sections: [
      {
        title: 'What a JWT decoder can safely tell you',
        paragraphs: [
          'A compact JWT typically contains a Base64URL-encoded header, a Base64URL-encoded payload and a signature. The first two parts can be decoded without any secret key.',
          'That means decoding only reveals the claims carried in the token. It does not prove that the issuer created the token or that the payload has not been altered.'
        ]
      },
      {
        title: 'Signature verification is a separate security step',
        paragraphs: [
          'Real verification requires the expected signing algorithm and the correct verification key or public key, plus validation of issuer, audience and any application-specific policy.',
          'Toolmera intentionally does not present decoded claims as verified. The exp, iat and nbf timestamps are shown as convenience fields only.'
        ]
      }
    ],
    faq: [
      { q: 'Does Toolmera verify JWT signatures?', a: 'No. This page decodes the header and payload only.' },
      { q: 'What does exp mean?', a: 'exp is a NumericDate claim representing the token expiration time in seconds since the Unix epoch.' },
      { q: 'What does iat mean?', a: 'iat is the issued-at NumericDate claim when the issuer includes it.' },
      { q: 'Is a readable JWT payload secret?', a: 'No. JWT payloads are commonly Base64URL-encoded rather than encrypted, so sensitive information should not be assumed private simply because it appears inside a token.' }
    ],
    related: [
      { id: 'json', anchor: 'format decoded JSON' },
      { id: 'base64', anchor: 'work with Base64URL text' }
    ]
  },


  'character-counter': {
    title: 'Free Character Counter — Characters, Spaces, Lines & UTF-8 Bytes',
    description: 'Count visible characters, characters without whitespace, words, lines and UTF-8 bytes with Unicode-aware browser processing.',
    intro: 'Measure text length from several useful angles instead of treating characters, whitespace and encoded bytes as the same thing.',
    sections: [
      { title: 'Characters and bytes answer different questions', paragraphs: ['A visible character count is useful for forms, metadata and writing limits. A UTF-8 byte count is useful when a database field, API payload or storage limit is defined in bytes.', 'Because many Unicode characters use more than one UTF-8 byte, the byte total can be larger than the number of visible characters.'] },
      { title: 'Unicode-aware counting', paragraphs: ['Modern browsers can segment grapheme clusters so many emoji and combined characters are counted more like users perceive them on screen.', 'Toolmera falls back to Unicode code-point iteration when that segmentation API is not available.'] }
    ],
    faq: [
      { q: 'Does the counter include spaces?', a: 'It shows both the full character count and a separate count with whitespace removed.' },
      { q: 'Why are UTF-8 bytes higher than characters?', a: 'Many non-ASCII characters require multiple bytes when encoded as UTF-8.' },
      { q: 'Does it count emoji?', a: 'Yes. Modern browsers use grapheme segmentation when available, which improves counting for emoji sequences and combined characters.' },
      { q: 'Is this the same as the Word Counter?', a: 'No. This page focuses on character, whitespace, line and byte limits, while Word Counter emphasizes words, sentences, paragraphs and reading time.' }
    ],
    related: [{ id: 'word-counter', anchor: 'count words and reading time' }, { id: 'case-converter', anchor: 'transform text case' }]
  },

  'remove-duplicate-lines': {
    title: 'Remove Duplicate Lines Online — Free, Private Dedupe Tool',
    description: 'Remove repeated lines from lists with case sensitivity, whitespace trimming, blank-line controls and optional sorting.',
    intro: 'Deduplicate keyword lists, IDs, URLs, logs and exports while choosing exactly how matching should work.',
    sections: [
      { title: 'Define what counts as a duplicate', paragraphs: ['Case-insensitive mode can treat Apple and apple as the same line, while trimming can ignore accidental leading or trailing spaces.', 'Toolmera keeps the first surviving occurrence and preserves input order unless you explicitly choose a sort order.'] },
      { title: 'Useful for list cleanup before import', paragraphs: ['Duplicate rows can distort keyword lists, CRM imports, allowlists, test data and simple line-based exports.', 'Removing duplicates before the next workflow makes counts and downstream processing easier to reason about.'] }
    ],
    faq: [
      { q: 'Does it preserve the original order?', a: 'Yes, when Order is set to Preserve input order.' },
      { q: 'Can Apple and apple be treated as duplicates?', a: 'Yes. Turn on Ignore case.' },
      { q: 'Can blank lines be removed?', a: 'Yes. Blank-line removal is an explicit option.' },
      { q: 'Is the text uploaded?', a: 'No. Deduplication runs in the browser.' }
    ],
    related: [{ id: 'sort-lines', anchor: 'sort a line-based list' }, { id: 'text-diff', anchor: 'compare two versions of text' }]
  },

  'sort-lines': {
    title: 'Sort Lines Online — Alphabetical, Natural A–Z & Z–A',
    description: 'Sort text lines alphabetically or naturally with numeric ordering, case controls and optional blank-line removal.',
    intro: 'Reorder pasted lists in seconds, including filenames and identifiers where natural numeric sorting matters.',
    sections: [
      { title: 'Alphabetical vs. natural numeric sorting', paragraphs: ['Plain lexical sorting can place file10 before file2 because it compares characters. Natural numeric sorting recognizes the numeric portions and places file2 before file10.', 'Toolmera exposes that behavior as a toggle so the sort matches the kind of list you are cleaning.'] },
      { title: 'Locale-aware comparison', paragraphs: ['The browser Intl.Collator API is used for sorting instead of a hard-coded English-only comparison.', 'Case can be ignored or treated as significant depending on the list.'] }
    ],
    faq: [
      { q: 'Can I sort Z to A?', a: 'Yes. Choose descending order.' },
      { q: 'What is natural sort?', a: 'It compares embedded numbers numerically, so item2 comes before item10.' },
      { q: 'Can I keep blank lines?', a: 'Yes. Turn off Remove blank lines.' },
      { q: 'Does sorting remove duplicates?', a: 'No. Use Remove Duplicate Lines when deduplication is the goal.' }
    ],
    related: [{ id: 'remove-duplicate-lines', anchor: 'remove duplicate lines first' }, { id: 'case-converter', anchor: 'normalize capitalization' }]
  },

  'text-diff': {
    title: 'Text Diff Checker — Compare Two Text Blocks Online',
    description: 'Compare two blocks of text line by line and identify added, removed and unchanged lines locally in your browser.',
    intro: 'Spot structural changes between drafts, configuration snippets, lists and small code samples without uploading them.',
    sections: [
      { title: 'Line-level diff for quick comparisons', paragraphs: ['The checker uses a longest-common-subsequence comparison to align matching lines and identify insertions and removals.', 'The output prefixes additions with + and removals with -, making it easy to copy the result into notes or a review.'] },
      { title: 'Designed for pasted text, not giant repositories', paragraphs: ['The browser implementation intentionally limits each side to 600 lines so the comparison stays responsive.', 'For large source trees, use a dedicated version-control diff workflow instead.'] }
    ],
    faq: [
      { q: 'Is this a word-by-word diff?', a: 'No. The current Toolmera diff works at line level.' },
      { q: 'What do + and - mean?', a: '+ marks a line added on the right; - marks a line removed from the left.' },
      { q: 'Why is there a 600-line limit?', a: 'The limit keeps the browser-side LCS comparison responsive and predictable.' },
      { q: 'Is my text sent to a server?', a: 'No. The comparison runs in the browser.' }
    ],
    related: [{ id: 'remove-duplicate-lines', anchor: 'clean repeated lines' }, { id: 'word-counter', anchor: 'measure either text version' }]
  },

  'json-csv': {
    title: 'JSON to CSV Converter — Convert JSON Arrays to CSV Online',
    description: 'Convert JSON objects or arrays to CSV with nested-object flattening, delimiter controls, copy and download.',
    intro: 'Turn structured JSON from an API or export into a spreadsheet-ready table without sending the payload to a server.',
    sections: [
      { title: 'How JSON fields become CSV columns', paragraphs: ['For an array of objects, Toolmera builds a header from the union of object keys so rows with missing fields still stay aligned.', 'Nested objects can be flattened into dotted column names such as address.city. Arrays remain represented as JSON text inside a cell.'] },
      { title: 'CSV quoting and delimiters', paragraphs: ['Values containing the selected delimiter, quotes or line breaks are wrapped in quotes and embedded quotes are doubled.', 'Choose comma, semicolon or tab depending on the spreadsheet or import workflow that will consume the file.'] }
    ],
    faq: [
      { q: 'Can I convert one JSON object?', a: 'Yes. A single object is treated as a one-row table.' },
      { q: 'Can nested JSON be flattened?', a: 'Yes. Nested objects can become dotted columns such as user.name.' },
      { q: 'Can I download the CSV?', a: 'Yes. The result can be copied or downloaded as a CSV file.' },
      { q: 'Are JSON arrays inside fields expanded?', a: 'No. Array values are serialized into the CSV cell as JSON text.' }
    ],
    related: [{ id: 'json', anchor: 'format and validate JSON first' }, { id: 'base64', anchor: 'decode Base64 API payload text' }]
  },

  'xml-formatter': {
    title: 'XML Formatter — Beautify & Validate XML Online',
    description: 'Validate and pretty-print XML with configurable indentation using the browser XML parser.',
    intro: 'Make compact XML easier to inspect while checking that the document is well formed.',
    sections: [
      { title: 'Formatting starts with XML validation', paragraphs: ['Toolmera parses the input as application/xml before formatting it. Malformed tags, broken nesting and other well-formedness errors are reported instead of silently producing misleading output.', 'After validation, the browser serializes the document and Toolmera adds readable indentation.'] },
      { title: 'Serialization can normalize the document', paragraphs: ['XML serializers can normalize quoting, namespace output and some whitespace details even when the logical document structure is unchanged.', 'Review formatted output carefully before replacing whitespace-sensitive XML, digital signatures or documents where byte-for-byte identity matters.'] }
    ],
    faq: [
      { q: 'Does the tool validate XML?', a: 'It validates XML well-formedness with the browser XML parser.' },
      { q: 'Can I choose indentation?', a: 'Yes. Choose 2 spaces, 4 spaces or tabs.' },
      { q: 'Does it validate against XSD?', a: 'No. The current tool checks XML well-formedness, not an external XSD schema.' },
      { q: 'Is the XML uploaded?', a: 'No. Parsing and formatting happen in the browser.' }
    ],
    related: [{ id: 'json', anchor: 'format JSON data' }, { id: 'url-encoder', anchor: 'encode XML values for URLs' }]
  },

  'date-calculator': {
    title: 'Date Calculator — Add or Subtract Days, Weeks, Months & Years',
    description: 'Calculate a future or past date by adding or subtracting years, months, weeks and days with calendar-aware month handling.',
    intro: 'Start from any calendar date and move forward or backward by a combination of calendar units.',
    sections: [
      { title: 'Months are calendar units, not fixed day counts', paragraphs: ['A month is not always 30 days. Toolmera changes years and months on the calendar, clamps to the last valid day of the target month, and only then applies weeks and days.', 'That matters for dates such as January 31, where moving one month forward cannot preserve the day number in every year.'] },
      { title: 'Calendar math vs. elapsed duration', paragraphs: ['Use Date Calculator when the task is to reach a calendar date after a number of years, months, weeks or days.', 'Use Time Duration Calculator when you already have two date-time values and need the elapsed hours, minutes or seconds between them.'] }
    ],
    faq: [
      { q: 'What happens when the target month has fewer days?', a: 'The date is clamped to the last valid day of the target month before week and day adjustments are applied.' },
      { q: 'Can I subtract dates?', a: 'You can subtract calendar units from a starting date. For the difference between two dates, use Date Difference Calculator.' },
      { q: 'Can I add weeks and days together?', a: 'Yes. Years, months, weeks and days can be combined in one calculation.' },
      { q: 'Does the result show the weekday?', a: 'Yes. The formatted result includes the weekday.' }
    ],
    related: [{ id: 'date-difference', anchor: 'calculate days between two dates' }, { id: 'time-duration', anchor: 'measure elapsed hours and minutes' }]
  },

  'time-duration': {
    title: 'Time Duration Calculator — Hours, Minutes & Seconds Between Times',
    description: 'Calculate elapsed days, hours, minutes and seconds between two local date-time values and see total hours and minutes.',
    intro: 'Measure how much clock time passes between a start and end date-time using browser-local calculation.',
    sections: [
      { title: 'Elapsed time in several useful units', paragraphs: ['Toolmera breaks the interval into whole days, remaining hours, minutes and seconds, then also shows the total duration in hours, minutes and seconds.', 'This is useful for shifts, sessions, production windows, travel segments and other elapsed-time calculations.'] },
      { title: 'Local date-time inputs do not name a time zone', paragraphs: ['The browser interprets datetime-local inputs in the local environment. That is appropriate for same-zone elapsed time but it is not a substitute for named-zone conversion.', 'For events in different locations or daylight-saving-sensitive scheduling, convert the instants with Time Zone Converter first.'] }
    ],
    faq: [
      { q: 'Can the end time be on a later day?', a: 'Yes. The inputs include both date and time.' },
      { q: 'What if the end is before the start?', a: 'The tool reports an error instead of returning a negative duration.' },
      { q: 'Does it show total minutes?', a: 'Yes. It shows total minutes and total seconds in addition to the day/hour/minute breakdown.' },
      { q: 'Can it compare two different time zones?', a: 'Not directly. Use Time Zone Converter when the two clock times belong to different named zones.' }
    ],
    related: [{ id: 'time-zone', anchor: 'convert date-times between zones' }, { id: 'date-difference', anchor: 'compare calendar dates' }]
  },

};

export const categorySeoContent: Record<string, {
  title: string;
  description: string;
  intro: string;
  sections: ToolSeoSection[];
}> = {
  image: {
    title: 'Free Image Tools — Convert, Compress, Crop & Resize Online',
    description: 'Free browser-based image tools for PNG, JPG, WebP and HEIC conversion, dedicated JPG/PNG compression, cropping and resizing.',
    intro: 'Convert, compress, crop and resize images with focused browser tools built around specific file-format and editing tasks.',
    sections: [
      {
        title: 'Which image tool do you need?',
        paragraphs: [
          'Use a format converter when a destination requires JPG, PNG or WebP, including HEIC-to-image workflows. Use dedicated JPG or PNG compression when the output format itself must stay unchanged, and use Crop or Resize when the real requirement is image geometry.',
          'Many workflows combine steps: crop to the right composition, resize to the display dimensions, then compress; or convert to a compatible format before optimizing the result.'
        ]
      },
      {
        title: 'Image tools that solve one task each',
        paragraphs: [
          'Toolmera keeps each image page focused on a real task: format compatibility, output quality, transparency, palette reduction, crop geometry or pixel dimensions.',
          'Current image workflows in this category process locally in the browser. Heavier decoders and encoders are loaded only when the relevant tool is opened.'
        ]
      }
    ]
  },

  pdf: {
    title: 'Free PDF Tools — Merge, Split, Rotate & Convert Online',
    description: 'Free browser-based PDF tools to merge, split, rotate and remove pages, convert images to PDF, or render PDF pages as JPG or PNG.',
    intro: 'Organize PDF pages, create PDFs from images, or render PDF pages back to images with focused browser-based tools.',
    sections: [
      {
        title: 'Which PDF tool do you need?',
        paragraphs: [
          'Use Merge PDF to combine documents, Split PDF to extract one continuous range, Rotate PDF to fix page orientation, and Remove PDF Pages to delete mixed page selections.',
          'Use JPG to PDF or PNG to PDF when images need to become a document. Use PDF to JPG when document pages need to become JPG or PNG images again.'
        ]
      },
      {
        title: 'PDF tools that solve one task each',
        paragraphs: [
          'Each Toolmera PDF utility focuses on one operation with explicit page controls: ordering, range selection, rotation, deletion or page rendering.',
          'The current PDF tools execute in the browser. Structural operations use pdf-lib, while PDF-to-image rendering loads a dedicated client-side renderer only when needed.'
        ]
      }
    ]
  },

  calculators: {
    title: 'Free Online Calculators — Math, Finance, Dates & Health',
    description: 'Free online calculators for loans, ROI, discounts, interest, dates, averages, percentages, CAGR, BMI and compound growth.',
    intro: 'Math, health and everyday calculators built around clear inputs, transparent formulas and useful results.',
    sections: [
      {
        title: 'Which calculator do you need?',
        paragraphs: [
          'Use Loan, ROI, CAGR, Compound Interest and Simple Interest for financial math. Use Percentage, Discount and Average for everyday calculations, and Date Difference or Age for calendar questions.',
          'Use BMI Calculator for an adult screening estimate in metric or imperial units. Each calculator keeps its formula, assumptions or interpretation visible instead of returning an unexplained number.'
        ]
      },
      {
        title: 'Calculators that make the assumptions visible',
        paragraphs: [
          'A useful calculator should make clear what is being calculated, not just return a number. Toolmera exposes the relevant formula, units, category thresholds or modeling assumptions where they matter.',
          'That is especially important for health and finance-related calculations, where a clean mathematical output can still be incomplete without context about what the result does and does not mean.'
        ]
      }
    ]
  },

  converters: {
    title: 'Free Online Converters — Units, Speed, Storage & Color',
    description: 'Free online converters for length, weight, volume, area, temperature, speed, digital storage and web colors.',
    intro: 'Convert physical measurements, digital storage sizes and common web color formats with focused browser-based tools and explicit definitions.',
    sections: [
      {
        title: 'Which converter do you need?',
        paragraphs: [
          'Use Length for distance, Weight for mass, Volume for capacity, Area for surfaces, Temperature for Celsius/Fahrenheit/Kelvin and Speed for km/h, mph, m/s, ft/s or knots.',
          'Use Data Storage when decimal and binary file-size units need to stay distinct, and Color Converter when you need equivalent HEX, RGB or HSL values.'
        ]
      },
      {
        title: 'Focused conversion tools, not a giant unit menu',
        paragraphs: [
          'Toolmera keeps each measurement domain on its own page so the unit list, reference factors and internal links stay specific to the task.',
          'As new converters are added, they will live on their own task-specific pages rather than being mixed into one oversized control.'
        ]
      }
    ]
  },

  text: {
    title: 'Free Text Tools — Count, Compare, Sort & Clean Text Online',
    description: 'Count characters and words, compare text, remove duplicate lines, sort lists, transform case and generate URL slugs.',
    intro: 'Analyze, compare, clean and transform text with focused browser-side utilities for writing, lists and developer workflows.',
    sections: [
      {
        title: 'Which text tool do you need?',
        paragraphs: [
          'Use Word Counter for words, sentences, paragraphs and reading time, and Character Counter when exact text length, whitespace or UTF-8 bytes matter. Use Case Converter for capitalization and developer naming styles.',
          'Use Remove Duplicate Lines and Sort Lines for list cleanup, Text Diff Checker for version comparison, and Slug Generator for compact URL-friendly route segments.'
        ]
      },
      {
        title: 'Know which metrics are exact and which are estimates',
        paragraphs: [
          'Character counts are direct string measurements, while word and sentence segmentation can depend on language and browser support. Reading time is always an estimate based on an assumed reading speed.',
          'Toolmera labels those assumptions instead of presenting every text statistic as an absolute linguistic fact.'
        ]
      }
    ]
  },

  developer: {
    title: 'Developer Tools — JSON, CSV, XML, Base64, URLs & JWT',
    description: 'Format JSON and XML, convert JSON to CSV, encode Base64 and URLs, and inspect JWT data directly in your browser.',
    intro: 'Lightweight developer utilities for structured data, text encodings, URL percent-encoding and local JWT inspection.',
    sections: [
      {
        title: 'Which developer tool do you need?',
        paragraphs: [
          'Use JSON Formatter to pretty-print and validate strict JSON, Base64 Encode / Decode for text encodings, URL Encoder / Decoder for percent-encoding, and JWT Decoder to inspect compact token header and payload JSON.',
          'Each tool stays intentionally narrow. In particular, Base64 and URL encoding are not encryption, and JWT decoding is not signature verification.'
        ]
      },
      {
        title: 'Local processing for developer payloads',
        paragraphs: [
          'The current developer utilities execute their core transformations in the browser. JSON uses native parsing, Base64 uses browser byte/text APIs, URL encoding uses native URI functions and JWT decoding operates on the token locally.',
          'Local execution reduces unnecessary server round trips, but developers should still avoid pasting production secrets into any tool unless the workflow and environment are appropriate.'
        ]
      }
    ]
  },

  generators: {
    title: 'Free Online Generators — QR Codes, UUIDs, Passwords & Random Numbers',
    description: 'Free browser-based generators for static QR codes, UUID v4 identifiers, random passwords and random number sets.',
    intro: 'Generate reusable codes, identifiers, passwords and numeric values with focused browser-based utilities.',
    sections: [
      {
        title: 'Choose the generator for the job',
        paragraphs: [
          'Use QR Code Generator for scannable text or URL matrices, UUID Generator for application identifiers, Password Generator for random credential strings, and Random Number Generator for numeric sampling.',
          'Each tool exposes the controls relevant to its output instead of combining unrelated generation tasks into one page.'
        ]
      },
      {
        title: 'Browser-native randomness where it matters',
        paragraphs: [
          'UUID, password and random-number generation use browser cryptographic APIs rather than Math.random(). QR rendering loads a dedicated client-side QR library only on the QR page.',
          'These tools create outputs locally and do not require an account or persistent Toolmera storage.'
        ]
      }
    ]
  },

  time: {
    title: 'Free Time & Date Tools — Date Math, Duration, Time Zones & Unix',
    description: 'Add or subtract calendar dates, calculate elapsed time, convert Unix timestamps and translate date-times between IANA time zones.',
    intro: 'Calculate calendar dates and durations, work with Unix epoch values, UTC and named time zones without server round trips.',
    sections: [
      {
        title: 'Time zones and Unix time for real workflows',
        paragraphs: [
          'Unix timestamps are common in APIs, logs and databases, while named IANA time zones are essential when a human wall-clock time needs daylight-saving rules. Calendar arithmetic and elapsed duration are separate problems.',
          'Use Date Calculator to move a date by years, months, weeks or days; Time Duration Calculator for elapsed clock time; Unix Timestamp Converter for epoch values; and Time Zone Converter for the same instant across named locations.'
        ]
      }
    ]
  }
};
