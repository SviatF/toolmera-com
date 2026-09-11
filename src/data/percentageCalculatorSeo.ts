import type { ToolSeoContent } from './seoContent';

export const percentageCalculatorBenefits = [
  'Calculate percentage gain, increase and decrease',
  'Find what percent one number is of another',
  'Calculate a percentage of any number',
  'Compare two values with percentage difference',
];

export const percentageCalculatorSeo: ToolSeoContent = {
  title: 'Free Percentage Calculator — Gain, Increase, Decrease & Change',
  description: 'Calculate percentage gain, increase, decrease, change and difference for free. Find what percent one number is of another or calculate any percentage of a value.',
  intro: 'Use this free percentage calculator for percentage gain, increase, decrease, change, percentage difference and everyday percent-of-number calculations. Choose the calculation mode, enter your values and get the result with the formula shown.',
  sections: [
    {
      title: 'Percentage gain calculator: measure growth from an old value to a new value',
      paragraphs: [
        'Percentage gain measures how much a value increased relative to its starting point. It is commonly used for prices, investment values, website metrics, sales, conversion rates and other before-and-after comparisons.',
        'The standard calculation is (new value − old value) ÷ old value × 100. For example, moving from 80 to 100 is a gain of 20 on a starting value of 80, which equals a 25% increase.'
      ],
      facts: [
        { label: 'Gain formula', value: '(new − old) ÷ old × 100' },
        { label: 'Positive result', value: 'Percentage increase' },
        { label: 'Negative result', value: 'Percentage decrease' },
        { label: 'Starting value', value: 'Used as the denominator' }
      ]
    },
    {
      title: 'Percentage increase and percentage decrease calculator',
      paragraphs: [
        'Percentage increase and decrease use the same percentage-change formula. If the new value is above the original value, the result is positive. If the new value is below it, the result is negative and represents a percentage decrease.',
        'Always compare the change with the original value, not the new value. That denominator is what makes percentage change directional: increasing from 50 to 100 is a 100% increase, while decreasing from 100 to 50 is a 50% decrease.'
      ]
    },
    {
      title: 'What percent is one number of another?',
      paragraphs: [
        'To find what percentage one number is of another, divide the part by the total and multiply by 100. If 42 out of 60 items meet a condition, 42 ÷ 60 × 100 gives 70%.',
        'This mode is useful for conversion rates, test scores, completion rates, budget shares, survey results and any situation where a part needs to be expressed as a percentage of a whole.'
      ]
    },
    {
      title: 'How to calculate a percentage of a number',
      paragraphs: [
        'To calculate X percent of a number, convert the percentage to a decimal and multiply it by the value. For example, 15% of 240 is 0.15 × 240 = 36.',
        'This is useful for discounts, taxes, commissions, tips, markups and quick proportional calculations. If you are specifically calculating a sale price after a discount, the Discount Calculator can also show the final amount and savings directly.'
      ]
    },
    {
      title: 'Percentage change vs percentage difference',
      paragraphs: [
        'Percentage change compares a new value with an original starting value, so direction matters. Percentage difference is used when neither value is naturally the starting point and measures the gap relative to the average of the two values.',
        'Use percentage change for growth or decline over time. Use percentage difference when comparing two measurements, estimates or results where both values have equal status.'
      ]
    }
  ],
  faq: [
    {
      q: 'How do I calculate percentage gain?',
      a: 'Subtract the original value from the new value, divide the result by the original value, then multiply by 100. Toolmera can calculate this directly in percentage-change mode.'
    },
    {
      q: 'Is percentage gain the same as percentage increase?',
      a: 'In most everyday calculations, yes. Both describe a positive change relative to the original value using the same formula.'
    },
    {
      q: 'How do I calculate percentage decrease?',
      a: 'Subtract the new value from the original value, divide by the original value and multiply by 100. In a signed percentage-change calculation, the same change appears as a negative percentage.'
    },
    {
      q: 'How do I find what percent one number is of another?',
      a: 'Divide the first number by the second number and multiply by 100. For example, 25 is 20% of 125.'
    },
    {
      q: 'What is the difference between percentage change and percentage difference?',
      a: 'Percentage change uses the original value as the reference and is directional. Percentage difference compares two values relative to their average when neither value is the natural baseline.'
    },
    {
      q: 'Can I calculate a percentage of a number with this tool?',
      a: 'Yes. Choose the percent-of-number mode, enter the percentage and the number, and the calculator returns the result.'
    }
  ],
  related: [
    { id: 'roi', anchor: 'calculate return on investment' },
    { id: 'discount', anchor: 'calculate discounts and sale prices' },
    { id: 'average', anchor: 'calculate averages and summary statistics' },
    { id: 'simple-interest', anchor: 'calculate simple interest' }
  ],
  sources: [
    { label: 'NIST — SI Guide, quantities and numerical values', href: 'https://www.nist.gov/pml/special-publication-811' }
  ]
};
