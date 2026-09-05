export type ToolSeoSection = {
  title: string;
  paragraphs: string[];
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
      { q: 'Can I convert several PNG files at once?', a: 'Not yet. The current converter processes one image at a time.' },
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
      { q: 'Can I compress multiple images at once?', a: 'Not yet. The current compressor processes one image at a time.' },
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
  }
};

export const categorySeoContent: Record<string, {
  title: string;
  description: string;
  intro: string;
  sections: ToolSeoSection[];
}> = {
  image: {
    title: 'Image Tools — Convert, Compress & Resize Online',
    description: 'Free browser-based image tools for converting PNG, JPG and WebP, reducing file size and resizing to exact dimensions.',
    intro: 'Convert, compress and resize images with focused browser-based tools built around one clear task at a time.',
    sections: [
      {
        title: 'Which image tool do you need?',
        paragraphs: [
          'Use Compress Image when the goal is a smaller file. Use a format converter when a destination requires PNG, JPG or WebP, or when you want WebP for more efficient web delivery. Use Resize Image when the real requirement is a specific pixel size.',
          'Many workflows combine two steps: resize first, then compress; or convert to WebP, then check whether further compression is worthwhile.'
        ]
      },
      {
        title: 'Image tools that solve one task each',
        paragraphs: [
          'Toolmera avoids a bloated all-in-one editor. Each page is designed around the one decision that matters for that job: output quality, transparency, background color, compatibility or pixel dimensions.',
          'Image processing happens in the browser for these tools, so your files do not need to be sent to a Toolmera server just to convert, compress or resize them.'
        ]
      }
    ]
  },

  pdf: {
    title: 'Free PDF Tools — Merge, Split & Convert Online',
    description: 'Free browser-based PDF tools to merge PDFs, extract page ranges, and convert JPG or PNG images into PDF files.',
    intro: 'Merge, split and create PDF files for free with focused tools that run directly in your browser.',
    sections: [
      {
        title: 'Which PDF tool do you need?',
        paragraphs: [
          'Use Merge PDF when several existing PDF files should become one document. If an image needs to join that workflow, convert it first with JPG to PDF or PNG to PDF, then add the resulting PDF to the merge queue.',
          'Use Split PDF when you have one PDF and only need one continuous range of pages. Use JPG to PDF or PNG to PDF when your source material is a set of photos, scans, screenshots or diagrams rather than an existing PDF.'
        ]
      },
      {
        title: 'PDF tools that solve one task each',
        paragraphs: [
          'Each Toolmera PDF utility focuses on one job: file order for merging, a clear page range for splitting, and page order plus image-to-page sizing for JPG and PNG conversion.',
          'These PDF operations run in the browser, so documents and images do not need to be uploaded to a Toolmera server just to be combined, extracted or turned into a PDF.'
        ]
      }
    ]
  },

  calculators: {
    title: 'Free Online Calculators — Age, Percentage, BMI & Interest',
    description: 'Fast online calculators for calendar age, percentages, adult BMI and compound interest with clear formulas and assumptions.',
    intro: 'Math, health and everyday calculators built around clear inputs, transparent formulas and useful results.',
    sections: [
      {
        title: 'Which calculator do you need?',
        paragraphs: [
          'Use Age Calculator for calendar age between two dates, total days and a next-birthday countdown. Use Percentage Calculator for four common percentage questions: part of a total, percent of a number, change and difference.',
          'Use BMI Calculator for an adult screening estimate in metric or imperial units. Use Compound Interest Calculator to model growth with a starting amount, compounding frequency and optional monthly contributions.'
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
  }
};
