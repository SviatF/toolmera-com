import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/InfoPage';

export const metadata:Metadata={
  title:'Free Online Tools — About Toolmera',
  description:'Learn why Toolmera exists, how its browser-first tools are built and how accuracy and privacy are handled.',
  alternates:{canonical:'https://toolmera.com/about/'},
  openGraph:{title:'Free Online Tools — About Toolmera',description:'Learn how Toolmera builds focused browser-first utilities.',url:'https://toolmera.com/about/',siteName:'Toolmera',type:'website'},
  twitter:{card:'summary',title:'Free Online Tools — About Toolmera',description:'Learn how Toolmera builds focused browser-first utilities.'}
};

export default function Page(){
  return <InfoPage eyebrow="ABOUT" title="Small tools. Better work." intro="Toolmera is an independent web utility platform built around one principle: a simple task should not require a bloated product.">
    <h2>Why Toolmera exists</h2>
    <p>Every Toolmera page is designed around a specific job: convert a file, calculate a value, transform text, generate an identifier or solve another focused task. We prioritize a working tool first and supporting explanation second.</p>
    <h2>How the tools are built</h2>
    <p>The platform is static-first and browser-first. File processing runs locally whenever the implementation supports it, while calculators and converters expose their assumptions and formulas where those details matter.</p>
    <h2>Accuracy and review</h2>
    <p>We test representative inputs, edge cases and worked examples. Finance, tax and health pages use authoritative reference material where appropriate and clearly separate mathematical estimates from professional advice or provider-specific terms.</p>
    <p><Link className="inlineArrowLink" href="/methodology/">Read the Toolmera methodology →</Link></p>
    <h2>Privacy and analytics</h2>
    <p>Local file processing means a browser can complete many file tasks without sending the file to a Toolmera processing server. Site analytics can still measure page and tool interactions; our privacy documentation explains what is collected and how the site is operated.</p>
    <h2>Corrections and feedback</h2>
    <p>If you find a calculation, conversion, source or explanation that appears wrong, send the tool URL and the inputs needed to reproduce the issue through our contact page.</p>
  </InfoPage>;
}
