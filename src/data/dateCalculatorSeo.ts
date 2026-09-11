import type { ToolSeoContent } from './seoContent';

export const dateCalculatorBenefits = [
  'Add or subtract days, weeks, months and years',
  'Calculate future and past calendar dates',
  'End-of-month calendar handling',
  'See the resulting weekday instantly',
];

export const dateCalculatorSeo: ToolSeoContent = {
  title: 'Free Date Calculator — Add or Subtract Days, Weeks & Months',
  description: 'Add or subtract days, weeks, months and years from any date for free. Calculate a future or past calendar date and see the resulting weekday instantly.',
  intro: 'Use this free date calculator to add or subtract days, weeks, months or years from a calendar date. It is useful for searches such as add weeks to date, add days to a date, subtract calendar days and calculate a future or past date.',
  sections: [
    {
      title: 'Date calculator: add days, weeks, months or years',
      paragraphs: [
        'Enter a starting date, choose whether you want to add or subtract time, then adjust years, months, weeks and days independently. Toolmera calculates the resulting calendar date and shows the weekday so you can use the result immediately.',
        'This is useful for deadlines, renewal dates, project schedules, travel planning, billing periods and any workflow where you need to move a calendar date forward or backward without counting days manually.'
      ],
      facts: [
        { label: 'Operations', value: 'Add or subtract' },
        { label: 'Date units', value: 'Years, months, weeks and days' },
        { label: 'Output', value: 'Calendar date and weekday' },
        { label: 'Direction', value: 'Future or past date' }
      ]
    },
    {
      title: 'Add weeks to a date without manual counting',
      paragraphs: [
        'A week always represents seven days, so adding weeks is straightforward mathematically but easy to miscount on a calendar. The calculator lets you enter the number of weeks directly and returns the resulting date without requiring you to convert the value first.',
        'You can also combine weeks with other units. For example, a schedule can move forward by one month, two weeks and three days in a single calculation instead of running several separate date calculations.'
      ]
    },
    {
      title: 'Add calendar months to a date',
      paragraphs: [
        'Calendar months do not all have the same number of days. February is shorter than January, while other months contain 30 or 31 days. Because of that, adding one month is not always equivalent to adding a fixed number of days.',
        'Toolmera treats months as calendar units and handles end-of-month cases rather than assuming every month has the same length. This makes the result more useful for recurring schedules, due dates and month-based planning.'
      ]
    },
    {
      title: 'Subtract days from a date to find a past date',
      paragraphs: [
        'The same calculator works in reverse. Switch to subtraction when you need to find a date a certain number of days, weeks, months or years before a known date.',
        'This can help with notice periods, historical lookbacks, eligibility windows, preparation deadlines and any task where the reference date is known but the earlier date is not.'
      ]
    },
    {
      title: 'Date arithmetic vs. date difference',
      paragraphs: [
        'Date arithmetic answers questions such as “what date is 6 weeks from today?” or “what date was 90 days before this date?” A date difference calculator answers a different question: how much time exists between two already known dates.',
        'Use this Date Calculator when you know the starting date and the amount of time to add or subtract. Use Toolmera’s Date Difference Calculator when you already know both dates and want the distance between them.'
      ]
    }
  ],
  faq: [
    {
      q: 'How do I add days to a date?',
      a: 'Choose a starting date, select add, enter the number of days and Toolmera returns the resulting calendar date and weekday.'
    },
    {
      q: 'Can I add weeks to a date?',
      a: 'Yes. Enter the number of weeks directly. You can also combine weeks with years, months and additional days in the same calculation.'
    },
    {
      q: 'Can I subtract days, weeks or months from a date?',
      a: 'Yes. Switch the calculator to subtraction and enter the calendar units you want to move backward.'
    },
    {
      q: 'How does the calculator handle different month lengths?',
      a: 'Months are treated as calendar units rather than a fixed number of days. The calculation includes end-of-month handling for dates that do not map cleanly into a shorter month.'
    },
    {
      q: 'Can I add months and days at the same time?',
      a: 'Yes. Years, months, weeks and days can be combined in one calculation.'
    },
    {
      q: 'What is the difference between this tool and a date difference calculator?',
      a: 'This tool moves one known date forward or backward by a chosen amount of time. A date difference calculator measures the time between two known dates.'
    }
  ],
  related: [
    { id: 'date-difference', anchor: 'calculate the difference between two dates' },
    { id: 'time-duration', anchor: 'calculate elapsed time between date-times' },
    { id: 'unix-timestamp', anchor: 'convert a date to Unix timestamp' },
    { id: 'time-zone', anchor: 'convert a date-time between time zones' }
  ]
};
