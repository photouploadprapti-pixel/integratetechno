'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import { uploadCmsImage } from '@/lib/cms/client'
import { cn } from '@/lib/utils'

type ImageFieldProps = {
  label: string
  value: string
  folder?: string
  onChange: (url: string) => void
}

/**
 * Text + file upload control for CMS image URLs.
 * @param label - Field label
 * @param value - Current image URL
 * @param folder - Storage folder prefix
 * @param onChange - Called with the new URL
 */
export const ImageField = ({ label, value, folder, onChange }: ImageFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Uploads the selected file and updates the image URL.
   * @param event - File input change event
   */
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const url = await uploadCmsImage(file, folder)
      onChange(url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#1a1a1a]">{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative h-24 w-32 overflow-hidden rounded-lg border border-[#e6e6e6] bg-[#f7f7f7]">
          {value ? (
            <Image src={value} alt="" fill className="object-contain p-1" sizes="128px" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-[#888]">
              No image
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/assets/... or https://..."
            className="min-h-11 w-full rounded-[10px] border-2 border-[#e6e6e6] px-3 text-sm outline-none focus:border-[#0c29ab]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'inline-flex min-h-10 items-center justify-center rounded-[12px] bg-[#0c29ab] px-4 text-sm font-medium text-white',
                uploading && 'opacity-60',
              )}
            >
              {uploading ? 'Uploading…' : 'Upload image'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>
          {error ? <p className="text-sm text-[#ef2f15]">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
