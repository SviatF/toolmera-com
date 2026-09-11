import type { ToolSeoContent } from './seoContent';

export const volumeConverterBenefits = [
  'Convert cups to mL and liters instantly',
  'US customary and UK Imperial units kept separate',
  'Gallons, fluid ounces, tablespoons and teaspoons',
  'Live all-unit comparison for every value',
];

export const volumeConverterSeo: ToolSeoContent = {
  title: 'Free Volume Converter — Cups to mL, Liters, Gallons & Oz',
  description: 'Convert cups to mL, liters, gallons, fluid ounces, tablespoons and teaspoons for free. Supports metric, US customary and UK Imperial volume units.',
  intro: 'Use this free volume converter to convert cups to mL, mL to cups, liters to gallons, fluid ounces and other common liquid-volume units. US customary and UK Imperial measurements are labeled separately so you do not accidentally mix different unit definitions.',
  sections: [
    {
      title: 'Convert cups to mL and mL to cups',
      paragraphs: [
        'Cup-to-milliliter conversion is one of the most common volume calculations in cooking, nutrition labels and recipe scaling. Toolmera lets you enter a value in cups and immediately see the equivalent in milliliters, liters, fluid ounces, tablespoons and other supported units.',
        'The important detail is that a cup is not universal. A US customary cup and an Imperial cup are different sizes, so the converter labels systems clearly instead of treating every cup measurement as interchangeable.'
      ],
      facts: [
        { label: 'Metric units', value: 'mL and liters' },
        { label: 'US customary', value: 'Cups, gallons, fl oz, tbsp, tsp' },
        { label: 'UK Imperial', value: 'Gallons and fluid ounces kept separate' },
        { label: 'Workflow', value: 'Instant two-way conversion' }
      ]
    },
    {
      title: 'Why US and Imperial volume units must stay separate',
      paragraphs: [
        'US customary gallons and UK Imperial gallons are not the same size. The same problem applies to fluid ounces and some cup-based measurements. Mixing systems can create noticeable errors in recipes, laboratory notes, product specifications and everyday calculations.',
        'Toolmera therefore keeps US customary and Imperial units explicitly labeled. If a source only says “gallon” or “fluid ounce,” check the country or measurement standard before choosing the unit.'
      ]
    },
    {
      title: 'Liters, milliliters and metric volume conversion',
      paragraphs: [
        'Metric liquid-volume conversion is straightforward because one liter equals 1,000 milliliters. That makes mL and liters especially convenient for recipes, beverages, medicine packaging, laboratory work and product-volume specifications.',
        'The converter lets you move between metric and customary units without doing the intermediate arithmetic manually. Enter one value, choose the source and target units, and use the all-unit comparison to verify nearby equivalents.'
      ]
    },
    {
      title: 'Cups, tablespoons and teaspoons for recipe conversion',
      paragraphs: [
        'Cooking measurements often move between cups, tablespoons, teaspoons and milliliters. This is useful when scaling recipes, converting an international recipe or matching a kitchen tool that uses a different measurement system.',
        'For best accuracy, use the unit system stated by the recipe. A US recipe and a UK recipe may use familiar unit names with different underlying volumes.'
      ]
    },
    {
      title: 'When a volume converter is useful',
      paragraphs: [
        'Volume converters are useful for cooking, beverage quantities, container sizes, fuel or liquid specifications, laboratory notes and general unit conversion. They are intended for volume, not mass: converting milliliters to grams requires the density of the specific substance.',
        'If you need mass instead, use the Weight Converter. For dimensions such as inches, feet or centimeters, use the Length Converter.'
      ]
    }
  ],
  faq: [
    {
      q: 'How do I convert cups to mL?',
      a: 'Choose the appropriate cup unit, enter the number of cups and select milliliters as the target. Toolmera calculates the result instantly and also shows related volume equivalents.'
    },
    {
      q: 'Is a US cup the same as an Imperial cup?',
      a: 'No. Different measurement systems use different cup definitions. Use the unit label that matches the source of your recipe or measurement.'
    },
    {
      q: 'Can I convert mL to cups?',
      a: 'Yes. The converter works in both directions, so you can convert milliliters to cups as well as cups to milliliters.'
    },
    {
      q: 'Are US gallons and UK gallons the same?',
      a: 'No. A UK Imperial gallon is larger than a US customary gallon. Toolmera keeps them as separate units to prevent accidental mixing.'
    },
    {
      q: 'Can I convert fluid ounces to mL?',
      a: 'Yes. Select the correct US or Imperial fluid-ounce unit and convert it directly to milliliters.'
    },
    {
      q: 'Can this converter change mL into grams?',
      a: 'Not directly, because milliliters measure volume while grams measure mass. A correct conversion requires the density of the substance.'
    }
  ],
  related: [
    { id: 'weight', anchor: 'convert weight and mass units' },
    { id: 'length', anchor: 'convert metric and Imperial length units' },
    { id: 'temperature', anchor: 'convert Celsius and Fahrenheit' },
    { id: 'area', anchor: 'convert area and land measurements' }
  ]
};
