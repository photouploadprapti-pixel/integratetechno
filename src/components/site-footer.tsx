import Image from 'next/image'

import { officeAddress, phoneNumber } from '@/data/landing'

/**
 * Site footer with logo left and Call Us / address right.
 */
export const SiteFooter = () => {
  return (
    <footer className="w-full border-t border-[#e6e6e6] bg-[#f7f7f7] px-4 py-10 md:px-6 md:py-12 lg:px-10">
      <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex shrink-0 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <Image
            src="/assets/logo.png"
            alt="Integrate Techno Trade"
            width={80}
            height={80}
            className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
          />
          <p className="font-[family-name:var(--font-righteous)] text-base text-[#1a1a1a] sm:text-lg">
            Integrate Techno Trade
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 text-center sm:items-end sm:text-right">
          <a
            href={`tel:${phoneNumber}`}
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
            <span className="font-medium text-[#0c29ab]">Call Us</span>
          </a>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#1a1a1a]">
            {officeAddress.join('\n')}
          </p>
        </div>
      </div>
    </footer>
  )
}
