/** Navigation link used in header and footer. */
export interface NavLink {
  label: string
  href: string
}

/** Service / product card shown in the services grid. */
export interface ServiceItem {
  id: string
  name: string
  company: string
  image: string
}

/** Client logo entry for the clients carousel. */
export interface ClientItem {
  id: string
  name: string
  image: string
}

/** Payload for the contact form. */
export interface ContactFormValues {
  name: string
  email: string
  subject: string
  body: string
}
