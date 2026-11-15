import type { LegalContent, NotFoundContent } from '@/types/content'
import { contact, place, site } from './site'

/*
 * The legal page (/legal): terms of use, privacy and credits, in plain words.
 * What it says about the site must stay true of the site: if it starts to
 * collect anything (analytics, a form, a cookie), the privacy part changes in
 * the same commit.
 */
const domain = 'alwxn.com'
const email = contact.email

export const legal = {
  title: 'Terms & privacy',
  description: `Terms of use, privacy and credits for ${domain}, the portfolio of ${site.name}.`,
  updatedLabel: 'Last updated',
  updated: '14 November 2026',
  intro: `${domain} is the personal portfolio of ${site.name}, a software developer based in Ernakulam, Kerala, India. This page sets out the terms for using it, what it does and doesn’t do with your data, and who made the things it’s built with.`,
  contentsLabel: 'On this page',
  partsLabel: 'Parts of this page',
  place: `${place}, India`,
  summary: {
    label: 'In short',
    points: [
      'Everything here is mine; please ask before you reuse it.',
      'The site collects nothing about you: no cookies, analytics or tracking.',
      'Think something here is yours? Email me and I’ll deal with it.',
    ],
  },
  toTop: 'Back to top',
  parts: [
    {
      id: 'terms',
      title: 'Terms of use',
      sections: [
        {
          id: 'using',
          heading: 'Using this site',
          body: [
            `By using ${domain} you agree to these terms. If you don’t agree, please don’t use the site.`,
          ],
        },
        {
          id: 'ownership',
          heading: 'What’s mine',
          body: [
            `Unless a credit below says otherwise, everything on this site is © ${site.year} ${site.name}, with all rights reserved. That covers its design, code, text, images, project write-ups and the AW mark.`,
            'You’re welcome to:',
            [
              'view the site and share links to it;',
              'quote short passages, with a credit and a link back.',
            ],
            'Please don’t do any of the following without my written permission:',
            [
              'copy or republish the site, its design or its content, or present it as your own;',
              'reuse its code, images or text in another site or product;',
              'use its content to train or fine-tune machine-learning models;',
              'frame the site, or suggest that I endorse you or your work.',
            ],
          ],
        },
        {
          id: 'source',
          heading: 'Source code',
          body: [
            'The site’s source code is public on GitHub, for reference. Being public doesn’t make it open source: unless a repository carries a licence that says otherwise, all rights are reserved. The Cairn component library is published separately, under the licence in its own package.',
          ],
        },
        {
          id: 'trademarks',
          heading: 'Other people’s names and logos',
          body: [
            'The names and logos of the tools I work with are trademarks of their owners. That includes React, Next.js, TypeScript, JavaScript, Node.js, Express, MongoDB, Tailwind CSS, GSAP and Figma. They appear here only to say which tools I use. They don’t mean that any of their owners sponsors or endorses me or this site, and I’m not affiliated with them.',
          ],
        },
        {
          id: 'links',
          heading: 'Links to other sites',
          body: [
            'Some links lead to sites I don’t run, such as LinkedIn, GitHub and Cairn’s documentation. I’m not responsible for their content or their terms.',
          ],
        },
        {
          id: 'warranty',
          heading: 'No warranty',
          body: [
            'The site is provided as it is, for information. I try to keep it accurate and working, but I don’t promise that it is complete, current or free of errors. As far as the law allows, I’m not liable for any loss that comes from using it.',
          ],
        },
        {
          id: 'report',
          heading: 'If something here is yours',
          body: [
            `If you believe something on this site uses your work, or infringes your rights, without permission, email ${email}. Include a link to the material, what you believe it infringes, and how to reach you. I’ll look into it promptly, and remove or change anything that shouldn’t be here.`,
          ],
        },
        {
          id: 'changes',
          heading: 'Changes, and the law that applies',
          body: [
            'I may update these terms; the date at the top of this page shows the latest change. These terms are governed by the laws of India, and the courts at Ernakulam, Kerala, have jurisdiction.',
          ],
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy',
      sections: [
        {
          id: 'collect',
          heading: 'What this site collects',
          body: [
            'Nothing personal. There are no accounts, forms, cookies, analytics, advertising or tracking.',
          ],
        },
        {
          id: 'storage',
          heading: 'What stays in your browser',
          body: [
            'The site remembers three small things in your own browser, so it behaves the way you left it:',
            [
              'your light or dark mode choice;',
              'that you closed the notice offering the compact site;',
              'that you’ve already seen the intro, for the rest of the visit.',
            ],
            'None of it is sent to me or anyone else. You can clear it at any time in your browser’s settings.',
          ],
        },
        {
          id: 'hosting',
          heading: 'Hosting',
          body: [
            'The site is served by Amazon Web Services (S3 and CloudFront). Like any web host, AWS may process technical details of each request to deliver the site and keep it secure, such as your IP address, your browser and the time. I don’t use them to identify or follow visitors.',
            'Every typeface and image is served from this site itself, so nothing is fetched from Google Fonts or any other third party while you browse.',
          ],
        },
        {
          id: 'email',
          heading: 'When you write to me',
          body: [
            'If you email me, I use your address and message only to reply, and I don’t share them with anyone.',
          ],
        },
        {
          id: 'questions',
          heading: 'Questions',
          body: [`For anything about your privacy on this site, email ${email}.`],
        },
      ],
    },
    {
      id: 'credits',
      title: 'Credits',
      sections: [
        {
          id: 'typefaces',
          heading: 'Typefaces',
          body: [
            [
              'Bricolage Grotesque, © 2022 The Bricolage Grotesque Project Authors, SIL Open Font License 1.1.',
              'Azeret Mono, © 2021 The Azeret Project Authors, SIL Open Font License 1.1.',
              'Archivo, © 2020 The Archivo Project Authors, SIL Open Font License 1.1.',
              'Caveat, © 2014 The Caveat Project Authors, SIL Open Font License 1.1.',
              'Kristi, © 2010 Birgit Pulk, SIL Open Font License 1.1.',
              'Deutsch Gothic, © 1994 J. Fordyce, used unaltered under its free-distribution terms.',
            ],
            'The Deutsch Gothic notice, as its author asks it to travel with the font: “The Deutsch Gothic font is a display font based upon an old German gothic alphabet. The font contains the upper and lower case alphabets, numbers and punctuation. This font was created using Fontographer for Windows. It is (c) 1994 by J. Fordyce but may be freely distributed provided it is not altered, no fee is charged for it, and this text file is included with it.”',
          ],
        },
        {
          id: 'photograph',
          heading: 'Photograph',
          body: [
            'The sunset at the top of the compact site is by Szymon Shields, on Unsplash, used under the Unsplash License.',
          ],
        },
        {
          id: 'inspiration',
          heading: 'Inspiration',
          body: [
            'The visual system was inspired by good-fella.com, and the footer by neuemontreal.com.',
          ],
        },
      ],
    },
  ],
  footerLink: { label: 'Terms & privacy', href: '/legal' },
  home: { label: 'Back to home', href: '/' },
} satisfies LegalContent

export const notFound = {
  title: 'Page not found',
  heading: 'This page isn’t in the deck.',
  body: 'The link you followed points to a page that doesn’t exist, or one that has moved.',
  cards: ['4', '0', '4'],
  home: { label: 'Back to home', href: '/' },
  compact: { label: 'Compact version', href: '/compact' },
} satisfies NotFoundContent
