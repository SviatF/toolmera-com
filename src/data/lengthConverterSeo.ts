import type { ToolSeoContent } from './seoContent';

export const lengthConverterBenefits = [
  'Convert metric and Imperial length units instantly',
  'Meters, kilometers, centimeters and millimeters',
  'Feet, inches, yards and miles',
  'Two-way metric to Imperial conversion',
];

export const lengthConverterSeo: ToolSeoContent = {
  title: 'Free Length Converter — Metric & Imperial Units Online',
  description: 'Convert metric and Imperial length units for free. Convert meters, kilometers, centimeters and millimeters to feet, inches, yards and miles in either direction.',
  intro: 'Use this free length converter to switch between metric and Imperial measurements instantly. Convert meters to feet, centimeters to inches, kilometers to miles, feet to meters and other common length units without doing the formulas manually.',
  sections: [
    {
      title: 'Imperial to metric length converter',
      paragraphs: [
        'Use the converter when you need to translate Imperial measurements such as feet, inches, yards or miles into metric units such as meters, centimeters or kilometers. Enter a value, choose the source unit and select the metric unit you need.',
        'This is useful for dimensions, travel distances, construction notes, product specifications, fitness data and international documents where the original measurement system does not match the one you normally use.'
      ],
      facts: [
        { label: 'Metric units', value: 'mm, cm, m, km' },
        { label: 'Imperial units', value: 'in, ft, yd, mi' },
        { label: 'Direction', value: 'Metric ↔ Imperial' },
        { label: 'Workflow', value: 'Instant conversion' }
      ]
    },
    {
      title: 'Metric to Imperial length conversion',
      paragraphs: [
        'The same tool works in reverse when you need to convert metric measurements to Imperial units. Common examples include meters to feet, centimeters to inches and kilometers to miles.',
        'Keeping both systems in one converter makes it easier to compare dimensions and distances without opening separate calculators for each pair of units.'
      ]
    },
    {
      title: 'Convert inches to centimeters and centimeters to inches',
      paragraphs: [
        'Inches and centimeters are commonly mixed in screen sizes, furniture dimensions, clothing measurements, hardware specifications and product listings. A direct two-way conversion helps when the source and destination use different standards.',
        'One inch is exactly 2.54 centimeters. Toolmera applies the conversion automatically so you can enter either unit and view the corresponding value immediately.'
      ]
    },
    {
      title: 'Convert feet to meters and meters to feet',
      paragraphs: [
        'Feet and meters are frequently used for room dimensions, building heights, sports measurements and elevation. The converter handles both directions so you can quickly compare measurements from US customary and metric sources.',
        'For mixed feet-and-inches measurements, convert the full value to inches first or use a decimal-foot value before converting to meters for the cleanest result.'
      ]
    },
    {
      title: 'Kilometers to miles and miles to kilometers',
      paragraphs: [
        'Kilometers and miles are most often used for road distance, running, cycling and travel. Converting between them is useful when a map, vehicle, race or fitness app uses a different measurement system from the one you expect.',
        'For speed rather than distance, use the Speed Converter. For square measurements such as square meters, acres or square feet, use the Area Converter instead of a length conversion.'
      ]
    }
  ],
  faq: [
    {
      q: 'How do I convert Imperial length to metric?',
      a: 'Enter the value, choose an Imperial source unit such as inches, feet, yards or miles, then choose a metric target unit such as centimeters, meters or kilometers.'
    },
    {
      q: 'Can I convert metric length to Imperial units?',
      a: 'Yes. The converter works in both directions, including meters to feet, centimeters to inches and kilometers to miles.'
    },
    {
      q: 'How many centimeters are in one inch?',
      a: 'One inch equals exactly 2.54 centimeters.'
    },
    {
      q: 'Can I convert feet to meters?',
      a: 'Yes. Select feet as the source unit and meters as the target unit to get the converted value instantly.'
    },
    {
      q: 'Can I convert miles to kilometers?',
      a: 'Yes. Miles and kilometers are both supported, so you can convert in either direction.'
    },
    {
      q: 'Does this convert area or volume too?',
      a: 'No. This page is for one-dimensional length. Use the Area Converter for square units and the Volume Converter for liquid or cubic-volume measurements.'
    }
  ],
  related: [
    { id: 'area', anchor: 'convert area and land measurements' },
    { id: 'volume', anchor: 'convert liquid and volume units' },
    { id: 'weight', anchor: 'convert weight and mass units' },
    { id: 'speed', anchor: 'convert speed and pace-related units' }
  ]
};
