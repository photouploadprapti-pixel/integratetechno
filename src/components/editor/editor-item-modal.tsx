'use client'

import { useEffect, useId, type FormEvent, type ReactNode } from 'react'

/**
 * Shared popup shell for editor "Add item" flows.
 * @param open - Whether the modal is visible
 * @param title - Dialog title
 * @param subtitle - Optional section label
 * @param submitLabel - Primary button label
 * @param onClose - Close handler
 * @param onSubmit - Form submit handler
 * @param children - Form fields
 */
export const EditorItemModal = ({
  open,
  title,
  subtitle,
  submitLabel = 'Add item',
  onClose,
  onSubmit,
  children,
}: {
  open: boolean
  title: string
  subtitle?: string
  submitLabel?: string
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
}) => {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  /**
   * Handles dialog form submit.
   * @param event - Form submit event
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-[#0b1b4a]/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 my-0 w-full max-w-lg max-h-[min(100dvh,100%)] overflow-hidden rounded-t-[24px] border border-[#e4e9f4] bg-white shadow-[0_24px_80px_rgba(12,41,171,0.22)] sm:my-4 sm:max-h-[90vh] sm:rounded-[24px]"
      >
        <div className="border-b border-[#eef1f7] bg-[linear-gradient(135deg,#0c29ab_0%,#2c3d94_100%)] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              {subtitle ? (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                  {subtitle}
                </p>
              ) : null}
              <h2 id={titleId} className="mt-1 font-[family-name:var(--font-righteous)] text-xl">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/25"
            >
              Close
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain px-4 py-4 sm:max-h-[calc(90vh-5.5rem)] sm:px-6 sm:py-5"
        >
          <div className="grid gap-4">{children}</div>
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#eef1f7] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#ef2f15] px-6 text-sm font-semibold text-[#ef2f15] transition-colors hover:bg-[#ef2f15]/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0c29ab] px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(12,41,171,0.25)] transition-opacity hover:opacity-90"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
