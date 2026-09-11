import type { ToolSeoContent } from './seoContent';

export const removeDuplicateLinesBenefits = [
  'Free online dedupe tool for line-based text',
  'Preserve the first occurrence of each unique line',
  'Case and whitespace matching controls',
  'Optional blank-line cleanup and sorting',
];

export const removeDuplicateLinesSeo: ToolSeoContent = {
  title: 'Free Dedupe Tool — Remove Duplicate Lines Online',
  description: 'Remove duplicate lines online for free. Dedupe lists, URLs, keywords and IDs with case, whitespace, blank-line and sorting controls directly in your browser.',
  intro: 'Use this free online dedupe tool to remove duplicate lines from lists, URLs, keywords, IDs, logs and exports. Control case sensitivity, whitespace handling, blank lines and sorting while keeping the first surviving occurrence.',
  sections: [
    {
      title: 'Dedupe online: remove repeated lines from any list',
      paragraphs: [
        'Duplicate lines are common in keyword exports, URL lists, IDs, email-safe text exports, logs and copied spreadsheet data. Toolmera compares the text line by line and removes repeated values so the output contains one surviving occurrence of each unique line.',
        'The tool is designed for line-based cleanup rather than paragraph rewriting. Paste the list exactly as you have it, choose the matching rules you need, and copy the deduplicated result when the output looks correct.'
      ],
      facts: [
        { label: 'Input', value: 'Line-based text or lists' },
        { label: 'Duplicate handling', value: 'Keep first surviving occurrence' },
        { label: 'Matching controls', value: 'Case and whitespace options' },
        { label: 'Output cleanup', value: 'Blank-line and sorting options' }
      ]
    },
    {
      title: 'Case-sensitive vs case-insensitive duplicate removal',
      paragraphs: [
        'Case sensitivity changes what counts as a duplicate. In a case-sensitive comparison, Example and example are different lines. In a case-insensitive comparison, they can be treated as the same value.',
        'Choose the mode based on the data you are cleaning. Case-insensitive matching is useful for many keyword and URL-label lists, while case-sensitive matching is safer when capitalization carries meaning in IDs, codes or technical data.'
      ]
    },
    {
      title: 'Trim whitespace before deduping a list',
      paragraphs: [
        'Leading and trailing spaces can make two visually identical lines behave like different values. Trimming whitespace before comparison helps catch duplicates created by copied cells, formatted exports or inconsistent manual entry.',
        'If spaces are meaningful in your data, leave trimming disabled. The goal is to define duplicate matching in a way that fits the source rather than applying aggressive cleanup automatically.'
      ]
    },
    {
      title: 'Remove duplicate URLs, keywords and IDs',
      paragraphs: [
        'A dedupe tool is especially useful before uploading keyword lists, reviewing crawled URLs, preparing identifiers for another system or cleaning exported records. Removing repeated lines first makes counts, comparisons and downstream processing easier to trust.',
        'For URLs, remember that text deduplication only compares the strings you provide. Two different URL strings can still resolve to the same page, so use the Redirect Checker or Website Analyzer when you need to investigate URL behavior rather than exact-text duplicates.'
      ]
    },
    {
      title: 'Dedupe first, then sort or compare the cleaned output',
      paragraphs: [
        'Keeping the original order is useful when sequence matters, while sorting can make a cleaned list easier to scan. Toolmera lets you control that workflow instead of forcing every deduplicated result into alphabetical order.',
        'After removing duplicates, use Sort Lines for a dedicated ordering workflow or Text Diff when you need to compare the cleaned list with another version. Character Counter can help when the destination has text-length limits.'
      ]
    }
  ],
  faq: [
    {
      q: 'How do I remove duplicate lines online?',
      a: 'Paste your line-based text, choose the matching options you need, and Toolmera removes repeated lines while keeping the first surviving occurrence.'
    },
    {
      q: 'Is this an online dedupe tool?',
      a: 'Yes. It is built for deduplicating line-based text such as URLs, keywords, IDs, logs and exported lists directly in the browser.'
    },
    {
      q: 'Can I ignore uppercase and lowercase when removing duplicates?',
      a: 'Yes. Use case-insensitive matching when values such as Example and example should count as the same line.'
    },
    {
      q: 'Can whitespace create fake duplicates?',
      a: 'Yes. Leading or trailing spaces can make visually similar lines different strings. Enable trimming when you want those spaces ignored for matching.'
    },
    {
      q: 'Does the tool preserve the original order?',
      a: 'The dedupe workflow keeps the first surviving occurrence and can preserve input order unless you choose a sorting option.'
    },
    {
      q: 'Can I dedupe a list of URLs?',
      a: 'Yes. The tool can remove exact duplicate URL lines. It does not determine whether different URL strings redirect to or canonicalize to the same destination.'
    }
  ],
  related: [
    { id: 'sort-lines', anchor: 'sort the cleaned list' },
    { id: 'text-diff', anchor: 'compare two versions of a list' },
    { id: 'character-counter', anchor: 'measure the cleaned text length' },
    { id: 'case-converter', anchor: 'normalize text case before another workflow' }
  ]
};
