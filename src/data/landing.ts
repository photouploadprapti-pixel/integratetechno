import type { ClientItem, NavLink, ServiceItem } from '@/types/landing'

/** Primary navigation links matching the Bubble site. */
export const navLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Our Services', href: '#services' },
  { label: 'Our Clients', href: '#clients' },
  { label: 'Contact Us', href: '#contact' },
  { label: 'Chemical Division', href: '#services' },
  { label: 'Login', href: '/login' },
]

/** About section body copy from the Bubble landing page. */
export const aboutCopy =
  'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.'

/** Hero slideshow images from Bubble carosol_images (Created Date order). */
export const heroSlides = [
  {
    id: 1,
    image: '/assets/carousel/slide-1.png',
    label: 'Trade solutions you can trust',
  },
  {
    id: 2,
    image: '/assets/carousel/slide-2.png',
    label: 'Chemical division excellence',
  },
  {
    id: 3,
    image: '/assets/carousel/slide-3.png',
    label: 'Partners across industries',
  },
]

/**
 * Products from Bubble Our Services repeating group.
 * Images mapped from attached removebg product photos.
 */
export const services: ServiceItem[] = [
  {
    id: '1',
    name: 'TABLET COMPRESSOR',
    company: 'PARLE',
    image: '/assets/products/tablet-compressor.png',
  },
  {
    id: '2',
    name: 'ROLLER COMPACTOR DRY GRANULATION SYSTEM',
    company: 'PARLE',
    image: '/assets/products/roller-compactor.png',
  },
  {
    id: '3',
    name: 'AUTOMATIC CAPSULE FILLING SOLUTION',
    company: 'PARLE',
    image: '/assets/products/capsule-filler.png',
  },
  {
    id: '4',
    name: 'DE DUSTING TUNNEL / BOOTH',
    company: 'VISHWAKARMA ENGINEERING',
    image: '/assets/products/dedusting-tunnel.png',
  },
  {
    id: '5',
    name: 'AIR-MIST SHOWER',
    company: 'VISHWAKARMA ENGINEERING',
    image: '/assets/products/air-mist-shower.png',
  },
  {
    id: '6',
    name: 'REVERSE LAMINAR AIR FLOW',
    company: 'VISHWAKARMA ENGINEERING',
    image: '/assets/products/reverse-laminar.png',
  },
]

/** Client logos from Bubble clients_images (Created Date order). */
export const clients: ClientItem[] = [
  { id: '1', name: 'Square Pharmaceuticals', image: '/assets/clients/client-01.png' },
  { id: '2', name: 'Beximco Pharma', image: '/assets/clients/beximco.png' },
  {
    id: '3',
    name: 'Healthcare Pharmaceuticals',
    image: '/assets/clients/healthcare.png',
  },
  { id: '4', name: 'ACME Laboratories', image: '/assets/clients/acme.jpg' },
  { id: '5', name: 'Ziska Pharmaceuticals', image: '/assets/clients/ziska.png' },
  {
    id: '6',
    name: 'Popular Pharmaceuticals',
    image: '/assets/clients/popular.jpg',
  },
  { id: '7', name: 'Incepta', image: '/assets/clients/incepta.png' },
  { id: '8', name: 'ACI', image: '/assets/clients/aci.png' },
  { id: '9', name: 'Renata', image: '/assets/clients/client-09.jpg' },
  { id: '10', name: 'Eskayef (SK+F)', image: '/assets/clients/eskayef.webp' },
]

/** Brochure folder linked from the Bubble Download Brochure button. */
export const brochureUrl =
  'https://drive.google.com/drive/folders/1zu18cRtL0psiKPSvxMYjjQQojKl443wC?usp=sharing'

/** Contact email used by the Bubble contact workflow. */
export const contactEmail = 'bijoy@integratebd.com'

/** Phone number for the footer Call Us link. */
export const phoneNumber = '+8801755615339'

/** Office address from the Bubble footer. */
export const officeAddress = [
  'House #01, Sonargaon Janapath Road,',
  'Sector #13, Uttara,',
  'Dhaka-1230',
]
