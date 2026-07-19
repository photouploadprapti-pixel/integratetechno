'use client'

import { useState } from 'react'

import { EditorItemModal } from '@/components/editor/editor-item-modal'
import { ImageField } from '@/components/editor/image-field'
import { TextField } from '@/components/editor/text-field'
import { saveSiteContent } from '@/lib/cms/client'
import type { LandingContent } from '@/types/cms'

type LandingEditorPanelProps = {
  initialContent: LandingContent
}

type AddModalKind = 'link' | 'slide' | 'service' | 'client' | null

/**
 * Creates a unique id for new CMS list items.
 */
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

/**
 * Full landing-page CMS editor with text, images, and list management.
 * Add buttons open create popups for their corresponding section.
 * @param initialContent - Current landing CMS document
 */
export const LandingEditorPanel = ({ initialContent }: LandingEditorPanelProps) => {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [addModal, setAddModal] = useState<AddModalKind>(null)

  const [linkForm, setLinkForm] = useState({ label: '', href: '/#home' })
  const [slideForm, setSlideForm] = useState({
    label: '',
    image: '/assets/carousel/slide-1.png',
  })
  const [serviceForm, setServiceForm] = useState({
    name: '',
    company: '',
    image: '/assets/products/tablet-compressor.png',
  })
  const [clientForm, setClientForm] = useState({
    name: '',
    image: '/assets/clients/client-01.png',
  })

  /**
   * Updates a top-level landing content field.
   * @param key - Field name
   * @param value - New value
   */
  const updateField = <K extends keyof LandingContent>(key: K, value: LandingContent[K]) => {
    setContent((current) => ({ ...current, [key]: value }))
  }

  /**
   * Opens an add popup with empty defaults for that section.
   * @param kind - Section to add into
   */
  const openAddModal = (kind: Exclude<AddModalKind, null>) => {
    if (kind === 'link') setLinkForm({ label: '', href: '/#home' })
    if (kind === 'slide') {
      setSlideForm({ label: '', image: '/assets/carousel/slide-1.png' })
    }
    if (kind === 'service') {
      setServiceForm({
        name: '',
        company: '',
        image: '/assets/products/tablet-compressor.png',
      })
    }
    if (kind === 'client') {
      setClientForm({ name: '', image: '/assets/clients/client-01.png' })
    }
    setAddModal(kind)
  }

  /**
   * Closes the active add popup.
   */
  const closeAddModal = () => setAddModal(null)

  /**
   * Commits the active add-popup form into the matching content list.
   */
  const handleAddSubmit = () => {
    if (addModal === 'link') {
      if (!linkForm.label.trim() || !linkForm.href.trim()) return
      updateField('navLinks', [
        ...content.navLinks,
        { label: linkForm.label.trim(), href: linkForm.href.trim() },
      ])
    }
    if (addModal === 'slide') {
      if (!slideForm.label.trim() || !slideForm.image.trim()) return
      updateField('heroSlides', [
        ...content.heroSlides,
        {
          id: createId(),
          label: slideForm.label.trim(),
          image: slideForm.image.trim(),
        },
      ])
    }
    if (addModal === 'service') {
      if (!serviceForm.name.trim() || !serviceForm.company.trim()) return
      updateField('services', [
        ...content.services,
        {
          id: createId(),
          name: serviceForm.name.trim(),
          company: serviceForm.company.trim(),
          image: serviceForm.image.trim() || '/assets/products/tablet-compressor.png',
        },
      ])
    }
    if (addModal === 'client') {
      if (!clientForm.name.trim()) return
      updateField('clients', [
        ...content.clients,
        {
          id: createId(),
          name: clientForm.name.trim(),
          image: clientForm.image.trim() || '/assets/clients/client-01.png',
        },
      ])
    }
    closeAddModal()
  }

  /**
   * Persists the landing CMS document.
   */
  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await saveSiteContent('landing', content)
      setMessage('Landing page saved. Refresh the site to see changes.')
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
            Landing Page
          </h1>
          <p className="text-sm text-[#525252]">
            Edit texts, images, slideshow, services, clients, and contact details.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex min-h-11 items-center justify-center rounded-[14px] bg-[#0c29ab] px-6 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save landing page'}
        </button>
      </div>

      {message ? (
        <p className="rounded-[12px] border border-[#e6e6e6] bg-white px-4 py-3 text-sm text-[#1a1a1a]">
          {message}
        </p>
      ) : null}

      <section className="rounded-[16px] border border-[#e6e6e6] bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#0c29ab]">Brand</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Brand name"
            value={content.brandName}
            onChange={(value) => updateField('brandName', value)}
          />
          <TextField
            label="Call Us label"
            value={content.callUsLabel}
            onChange={(value) => updateField('callUsLabel', value)}
          />
          <ImageField
            label="Logo"
            value={content.logoUrl}
            folder="brand"
            onChange={(value) => updateField('logoUrl', value)}
          />
          <ImageField
            label="Wordmark"
            value={content.wordmarkUrl}
            folder="brand"
            onChange={(value) => updateField('wordmarkUrl', value)}
          />
        </div>
      </section>

      <section className="rounded-[16px] border border-[#e6e6e6] bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0c29ab]">Navigation</h2>
          <button
            type="button"
            className="text-sm font-medium text-[#0c29ab]"
            onClick={() => openAddModal('link')}
          >
            + Add link
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {content.navLinks.map((link, index) => (
            <div
              key={`${link.label}-${index}`}
              className="grid gap-3 rounded-[12px] border border-[#f0f0f0] p-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <TextField
                label="Label"
                value={link.label}
                onChange={(value) => {
                  const next = [...content.navLinks]
                  next[index] = { ...link, label: value }
                  updateField('navLinks', next)
                }}
              />
              <TextField
                label="Href"
                value={link.href}
                onChange={(value) => {
                  const next = [...content.navLinks]
                  next[index] = { ...link, href: value }
                  updateField('navLinks', next)
                }}
              />
              <button
                type="button"
                className="self-end text-sm text-[#ef2f15]"
                onClick={() =>
                  updateField(
                    'navLinks',
                    content.navLinks.filter((_, i) => i !== index),
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[16px] border border-[#e6e6e6] bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0c29ab]">Hero slideshow</h2>
          <button
            type="button"
            className="text-sm font-medium text-[#0c29ab]"
            onClick={() => openAddModal('slide')}
          >
            + Add slide
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {content.heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="grid gap-3 rounded-[12px] border border-[#f0f0f0] p-3"
            >
              <TextField
                label="Caption"
                value={slide.label}
                onChange={(value) => {
                  const next = [...content.heroSlides]
                  next[index] = { ...slide, label: value }
                  updateField('heroSlides', next)
                }}
              />
              <ImageField
                label="Slide image"
                value={slide.image}
                folder="carousel"
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
        <h2 className="mb-4 text-lg font-semibold text-[#0c29ab]">CTA + About</h2>
        <div className="grid gap-4">
          <TextField
            label="CTA headline"
            value={content.ctaHeadline}
            onChange={(value) => updateField('ctaHeadline', value)}
          />
          <TextField
            label="CTA button label"
            value={content.ctaButtonLabel}
            onChange={(value) => updateField('ctaButtonLabel', value)}
          />
          <TextField
            label="About title"
            value={content.aboutTitle}
            onChange={(value) => updateField('aboutTitle', value)}
          />
          <TextField
            label="About copy"
            multiline
            rows={8}
            value={content.aboutCopy}
            onChange={(value) => updateField('aboutCopy', value)}
          />
          <ImageField
            label="CEO photo"
            value={content.ceoImage}
            folder="about"
            onChange={(value) => updateField('ceoImage', value)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="CEO name"
              value={content.ceoName}
              onChange={(value) => updateField('ceoName', value)}
            />
            <TextField
              label="CEO title"
              value={content.ceoTitle}
              onChange={(value) => updateField('ceoTitle', value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-[#e6e6e6] bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0c29ab]">Services</h2>
          <button
            type="button"
            className="text-sm font-medium text-[#0c29ab]"
            onClick={() => openAddModal('service')}
          >
            + Add service
          </button>
        </div>
        <TextField
          label="Services section title"
          value={content.servicesTitle}
          onChange={(value) => updateField('servicesTitle', value)}
        />
        <div className="mt-4 flex flex-col gap-4">
          {content.services.map((service, index) => (
            <div
              key={service.id}
              className="grid gap-3 rounded-[12px] border border-[#f0f0f0] p-3"
            >
              <TextField
                label="Name"
                value={service.name}
                onChange={(value) => {
                  const next = [...content.services]
                  next[index] = { ...service, name: value }
                  updateField('services', next)
                }}
              />
              <TextField
                label="Company"
                value={service.company}
                onChange={(value) => {
                  const next = [...content.services]
                  next[index] = { ...service, company: value }
                  updateField('services', next)
                }}
              />
              <ImageField
                label="Product image"
                value={service.image}
                folder="products"
                onChange={(value) => {
                  const next = [...content.services]
                  next[index] = { ...service, image: value }
                  updateField('services', next)
                }}
              />
              <button
                type="button"
                className="justify-self-start text-sm text-[#ef2f15]"
                onClick={() =>
                  updateField(
                    'services',
                    content.services.filter((_, i) => i !== index),
                  )
                }
              >
                Remove service
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField
            label="Brochure button label"
            value={content.brochureButtonLabel}
            onChange={(value) => updateField('brochureButtonLabel', value)}
          />
          <TextField
            label="Brochure URL"
            value={content.brochureUrl}
            onChange={(value) => updateField('brochureUrl', value)}
          />
          <TextField
            label="Brochure modal title"
            value={content.brochureModalTitle}
            onChange={(value) => updateField('brochureModalTitle', value)}
          />
          <TextField
            label="Brochure modal hint"
            value={content.brochureModalHint}
            onChange={(value) => updateField('brochureModalHint', value)}
          />
        </div>
      </section>

      <section className="rounded-[16px] border border-[#e6e6e6] bg-white p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0c29ab]">Clients</h2>
          <button
            type="button"
            className="text-sm font-medium text-[#0c29ab]"
            onClick={() => openAddModal('client')}
          >
            + Add client
          </button>
        </div>
        <TextField
          label="Clients section title"
          value={content.clientsTitle}
          onChange={(value) => updateField('clientsTitle', value)}
        />
        <div className="mt-4 flex flex-col gap-4">
          {content.clients.map((client, index) => (
            <div
              key={client.id}
              className="grid gap-3 rounded-[12px] border border-[#f0f0f0] p-3"
            >
              <TextField
                label="Client name"
                value={client.name}
                onChange={(value) => {
                  const next = [...content.clients]
                  next[index] = { ...client, name: value }
                  updateField('clients', next)
                }}
              />
              <ImageField
                label="Logo"
                value={client.image}
                folder="clients"
                onChange={(value) => {
                  const next = [...content.clients]
                  next[index] = { ...client, image: value }
                  updateField('clients', next)
                }}
              />
              <button
                type="button"
                className="justify-self-start text-sm text-[#ef2f15]"
                onClick={() =>
                  updateField(
                    'clients',
                    content.clients.filter((_, i) => i !== index),
                  )
                }
              >
                Remove client
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[16px] border border-[#e6e6e6] bg-white p-4 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#0c29ab]">Contact + Footer</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Contact title"
            value={content.contactTitle}
            onChange={(value) => updateField('contactTitle', value)}
          />
          <TextField
            label="Contact email"
            value={content.contactEmail}
            onChange={(value) => updateField('contactEmail', value)}
          />
          <TextField
            label="Phone number"
            value={content.phoneNumber}
            onChange={(value) => updateField('phoneNumber', value)}
          />
          <TextField
            label="Office address (one line per row)"
            multiline
            rows={4}
            value={content.officeAddress.join('\n')}
            onChange={(value) =>
              updateField(
                'officeAddress',
                value.split('\n').map((line) => line.trimEnd()),
              )
            }
          />
        </div>
      </section>

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="inline-flex min-h-11 items-center justify-center self-start rounded-[14px] bg-[#0c29ab] px-6 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save landing page'}
      </button>

      <EditorItemModal
        open={addModal === 'link'}
        subtitle="Navigation"
        title="Add navigation link"
        submitLabel="Add link"
        onClose={closeAddModal}
        onSubmit={handleAddSubmit}
      >
        <TextField
          label="Label"
          value={linkForm.label}
          onChange={(value) => setLinkForm((current) => ({ ...current, label: value }))}
        />
        <TextField
          label="Href"
          value={linkForm.href}
          onChange={(value) => setLinkForm((current) => ({ ...current, href: value }))}
        />
      </EditorItemModal>

      <EditorItemModal
        open={addModal === 'slide'}
        subtitle="Hero slideshow"
        title="Add hero slide"
        submitLabel="Add slide"
        onClose={closeAddModal}
        onSubmit={handleAddSubmit}
      >
        <TextField
          label="Caption"
          value={slideForm.label}
          onChange={(value) => setSlideForm((current) => ({ ...current, label: value }))}
        />
        <ImageField
          label="Slide image"
          value={slideForm.image}
          folder="carousel"
          onChange={(value) => setSlideForm((current) => ({ ...current, image: value }))}
        />
      </EditorItemModal>

      <EditorItemModal
        open={addModal === 'service'}
        subtitle="Services"
        title="Add service"
        submitLabel="Add service"
        onClose={closeAddModal}
        onSubmit={handleAddSubmit}
      >
        <TextField
          label="Name"
          value={serviceForm.name}
          onChange={(value) => setServiceForm((current) => ({ ...current, name: value }))}
        />
        <TextField
          label="Company"
          value={serviceForm.company}
          onChange={(value) => setServiceForm((current) => ({ ...current, company: value }))}
        />
        <ImageField
          label="Product image"
          value={serviceForm.image}
          folder="products"
          onChange={(value) => setServiceForm((current) => ({ ...current, image: value }))}
        />
      </EditorItemModal>

      <EditorItemModal
        open={addModal === 'client'}
        subtitle="Clients"
        title="Add client"
        submitLabel="Add client"
        onClose={closeAddModal}
        onSubmit={handleAddSubmit}
      >
        <TextField
          label="Client name"
          value={clientForm.name}
          onChange={(value) => setClientForm((current) => ({ ...current, name: value }))}
        />
        <ImageField
          label="Logo"
          value={clientForm.image}
          folder="clients"
          onChange={(value) => setClientForm((current) => ({ ...current, image: value }))}
        />
      </EditorItemModal>
    </div>
  )
}
