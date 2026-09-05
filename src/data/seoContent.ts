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
  }
};
