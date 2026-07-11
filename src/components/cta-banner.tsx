import Link from 'next/link'

/**
 * Mid-page CTA block matching Bubble "Want to know more?" + Contact Us.
 */
export const CtaBanner = () => {
  return (
    <section className="bg-white px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <h2 className="font-[family-name:var(--font-reggae)] text-2xl text-[#2c3d94] sm:text-3xl md:text-4xl">
          Want to know more?
        </h2>
        <Link
          href="#contact"
          className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-[20px] bg-[#0c29ab] px-8 text-base font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
        >
          Contact Us
        </Link>
      </div>
    </section>
  )
}
