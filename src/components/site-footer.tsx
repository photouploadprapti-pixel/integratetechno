import Image from 'next/image'

import type { LandingContent } from '@/types/cms'

type SiteFooterProps = {
  content: Pick<
    LandingContent,
    | 'logoUrl'
    | 'brandName'
    | 'phoneNumber'
    | 'officeAddress'
    | 'callUsLabel'
    | 'officeMapUrl'
    | 'officeMapEmbedUrl'
  >
}

/**
 * Site footer with logo left, office Google Map center, and Call Us / address right.
 * @param content - CMS-driven footer fields
 */
export const SiteFooter = ({ content }: SiteFooterProps) => {
  return (
    <footer className="w-full border-t border-[#e6e6e6] bg-[#f7f7f7] px-4 py-10 md:px-6 md:py-12 lg:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-3 md:items-start md:gap-6">
        <div className="flex shrink-0 flex-col items-center gap-3 text-center md:items-start md:text-left">
          <Image
            src={content.logoUrl}
            alt={content.brandName}
            width={80}
            height={80}
            className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
          />
          <p className="font-[family-name:var(--font-righteous)] text-base text-[#1a1a1a] sm:text-lg">
            {content.brandName}
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <p className="text-sm font-medium text-[#0c29ab]">Office Location</p>
          <div className="w-full max-w-md overflow-hidden rounded-[14px] border border-[#e0e0e0] bg-white shadow-sm">
            <iframe
              title={`${content.brandName} office location`}
              src={content.officeMapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-44 w-full border-0 md:h-48"
            />
          </div>
          <a
            href={content.officeMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#0c29ab] underline-offset-2 transition-opacity hover:opacity-80 hover:underline"
          >
            Open in Google Maps
          </a>
        </div>

        <div className="flex flex-col items-center gap-2 text-center md:items-end md:text-right">
          <a
            href={`tel:${content.phoneNumber}`}
            className="mb-2 inline-flex min-h-11 items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0c29ab] text-white"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1l-2.2 2.9z" />
              </svg>
            </span>
            <span className="font-medium text-[#0c29ab]">{content.callUsLabel}</span>
          </a>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#1a1a1a]">
            {content.officeAddress.join('\n')}
          </p>
        </div>
      </div>
    </footer>
  )
}
