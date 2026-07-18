'use client'

import { useState } from 'react'

import { ImageField } from '@/components/editor/image-field'
import { TextField } from '@/components/editor/text-field'
import { saveSiteContent } from '@/lib/cms/client'
import type { ChemicalContent } from '@/types/cms'

type ChemicalEditorPanelProps = {
  initialContent: ChemicalContent
}

/**
 * Creates a unique id for new CMS list items.
 */
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

/**
 * Chemical Division CMS editor for hero slides and brand partners.
 * @param initialContent - Current chemical CMS document
 */
export const ChemicalEditorPanel = ({ initialContent }: ChemicalEditorPanelProps) => {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  /**
   * Updates a top-level chemical content field.
   * @param key - Field name
   * @param value - New value
   */
  const updateField = <K extends keyof ChemicalContent>(
    key: K,
    value: ChemicalContent[K],
  ) => {
    setContent((current) => ({ ...current, [key]: value }))
  }

  /**
   * Persists the chemical CMS document.
   */
  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await saveSiteContent('chemical', content)
      setMessage('Chemical page saved. Refresh the site to see changes.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-righteous)] text-2xl text-[#1a1a1a]">
            Chemical Division
          </h1>
          <p className="text-sm text-[#525252]">
            Edit hero slideshow, titles, and brand partner content.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex min-h-11 items-center justify-center rounded-[14px] bg-[#0c29ab] px-6 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save chemical page'}
        </button>
      </div>

      {message ? (
        <p className="rounded-[12px] border border-[#e6e6e6] bg-white px-4 py-3 text-sm text-[#1a1a1a]">
          {message}
        </p>
      ) : null}

      <section className="rounded-[16px] border border-[#e6e6e6] bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#0c29ab]">Hero</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Hero title"
            value={content.heroTitle}
            onChange={(value) => updateField('heroTitle', value)}
          />
          <TextField
            label="Brands CTA label"
            value={content.brandsCtaLabel}
            onChange={(value) => updateField('brandsCtaLabel', value)}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-medium text-[#1a1a1a]">Hero slides</h3>
          <button
            type="button"
            className="text-sm font-medium text-[#0c29ab]"
            onClick={() =>
              updateField('heroSlides', [
                ...content.heroSlides,
                { id: createId(), image: '/assets/chemical/hero-1.jpg' },
              ])
            }
          >
            + Add slide
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-4">
          {content.heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="grid gap-3 rounded-[12px] border border-[#f0f0f0] p-3"
            >
              <ImageField
                label={`Slide ${index + 1}`}
                value={slide.image}
                folder="chemical"
                onChange={(value) => {
                  const next = [...content.heroSlides]
                  next[index] = { ...slide, image: value }
                  updateField('heroSlides', next)
                }}
              />
              <button
                type="button"
                className="justify-self-start text-sm text-[#ef2f15]"
                onClick={() =>
                  updateField(
                    'heroSlides',
                    content.heroSlides.filter((_, i) => i !== index),
                  )
                }
              >
                Remove slide
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[16px] border border-[#e6e6e6] bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0c29ab]">Brands</h2>
          <button
            type="button"
            className="text-sm font-medium text-[#0c29ab]"
            onClick={() =>
              updateField('brands', [
                ...content.brands,
                {
                  id: createId(),
                  name: 'New brand',
                  logo: '/assets/chemical/gattefosse.png',
                  description: 'Brand description…',
                  highlight: 'Highlighted product range…',
                },
              ])
            }
          >
            + Add brand
          </button>
        </div>
        <TextField
          label="Brands section title"
          value={content.brandsSectionTitle}
          onChange={(value) => updateField('brandsSectionTitle', value)}
        />
        <div className="mt-4 flex flex-col gap-4">
          {content.brands.map((brand, index) => (
            <div
              key={brand.id}
              className="grid gap-3 rounded-[12px] border border-[#f0f0f0] p-3"
            >
              <TextField
                label="Brand name"
                value={brand.name}
                onChange={(value) => {
                  const next = [...content.brands]
                  next[index] = { ...brand, name: value }
                  updateField('brands', next)
                }}
              />
              <ImageField
                label="Brand logo"
                value={brand.logo}
                folder="chemical"
                onChange={(value) => {
                  const next = [...content.brands]
                  next[index] = { ...brand, logo: value }
                  updateField('brands', next)
                }}
              />
              <TextField
                label="Description"
                multiline
                rows={4}
                value={brand.description}
                onChange={(value) => {
                  const next = [...content.brands]
                  next[index] = { ...brand, description: value }
                  updateField('brands', next)
                }}
              />
              <TextField
                label="Highlight text"
                multiline
                rows={3}
                value={brand.highlight}
                onChange={(value) => {
                  const next = [...content.brands]
                  next[index] = { ...brand, highlight: value }
                  updateField('brands', next)
                }}
              />
              <button
                type="button"
                className="justify-self-start text-sm text-[#ef2f15]"
                onClick={() =>
                  updateField(
                    'brands',
                    content.brands.filter((_, i) => i !== index),
                  )
                }
              >
                Remove brand
              </button>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="inline-flex min-h-11 items-center justify-center self-start rounded-[14px] bg-[#0c29ab] px-6 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save chemical page'}
      </button>
    </div>
  )
}
