'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { contactEmail } from '@/data/landing'
import type { ContactFormValues } from '@/types/landing'

const initialValues: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  body: '',
}

/**
 * Contact form matching Bubble fields: Name, Email, Subject, Body.
 */
export const ContactSection = () => {
  const [values, setValues] = useState<ContactFormValues>(initialValues)
  const [sent, setSent] = useState(false)

  /**
   * Opens the user's mail client with the form contents (Bubble emailed bijoy@).
   * @param event - Submit event from the contact form
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const mailto = new URL(`mailto:${contactEmail}`)
    mailto.searchParams.set('subject', values.subject || 'Website inquiry')
    mailto.searchParams.set(
      'body',
      `${values.body}\n\nFrom:\n${values.name}\n${values.email}`,
    )
    window.location.href = mailto.toString()
    setSent(true)
  }

  return (
    <section id="contact" className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-xl rounded-[20px] border border-[#e6e6e6] p-4 sm:p-6 md:p-8">
        <h2 className="mb-6 text-center font-[family-name:var(--font-righteous)] text-xl text-[#1a1a1a] sm:text-2xl">
          Contact Us
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-light text-[#1a1a1a]">
            Name:
            <input
              required
              type="text"
              placeholder="Enter Your Name.."
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              className="min-h-12 rounded-[10px] border-2 border-[#e6e6e6] px-3 text-base outline-none transition-colors focus:border-[#0c29ab]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-light text-[#1a1a1a]">
            Email:
            <input
              required
              type="email"
              placeholder="Enter Your Email.."
              value={values.email}
              onChange={(event) => setValues({ ...values, email: event.target.value })}
              className="min-h-12 rounded-[10px] border-2 border-[#e6e6e6] px-3 text-base outline-none transition-colors focus:border-[#0c29ab]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-light text-[#1a1a1a]">
            Subject:
            <input
              required
              type="text"
              placeholder="Enter Subject..."
              value={values.subject}
              onChange={(event) => setValues({ ...values, subject: event.target.value })}
              className="min-h-12 rounded-[10px] border-2 border-[#e6e6e6] px-3 text-base outline-none transition-colors focus:border-[#0c29ab]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-light text-[#1a1a1a]">
            Body:
            <textarea
              required
              rows={5}
              placeholder="Write your message..."
              value={values.body}
              onChange={(event) => setValues({ ...values, body: event.target.value })}
              className="rounded-[10px] border-2 border-[#e6e6e6] px-3 py-3 text-base outline-none transition-colors focus:border-[#0c29ab]"
            />
          </label>

          <button
            type="submit"
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-[20px] bg-[#0c29ab] px-8 text-base font-medium text-white transition-opacity hover:opacity-90 sm:w-auto sm:self-start"
          >
            {sent ? 'Mail Sent!' : 'Send'}
          </button>
        </form>
      </div>
    </section>
  )
}
