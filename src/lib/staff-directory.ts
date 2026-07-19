/** Staff profile used for welcome text and PDF signer autofill. */
export interface StaffProfile {
  name: string
  designation: string
}

/**
 * Known staff directory keyed by lowercase email.
 * Used for header display names and SIS PDF Name/Designation autofill.
 */
export const STAFF_DIRECTORY: Record<string, StaffProfile> = {
  'sales@integratebd.com': {
    name: 'Md. Mashiur Rahman Khan',
    designation: 'Senior Manager',
  },
  'accounts@integratebd.com': {
    name: 'Kartick Chandra Podder',
    designation: 'Head of Business Development',
  },
  'sales1@integratebd.com': {
    name: 'Kingshuk Dhar',
    designation: 'Senior Manager',
  },
  'service2@integratebd.com': {
    name: 'Md. Tanvir Hossen',
    designation: 'Assistant Manager',
  },
  'service1@integratebd.com': {
    name: 'Shohag Biswas',
    designation: 'Assistant Manager',
  },
  'service4@integratebd.com': {
    name: 'GM Al-Amin',
    designation: 'Junior Executive',
  },
  'service@integratebd.com': {
    name: 'Md. Homyun Kobir',
    designation: 'Assistant General Manager',
  },
  'bijoy@integratebd.com': {
    name: 'Bijoy Prosad',
    designation: 'CEO',
  },
}

/**
 * Looks up a staff profile by email (case-insensitive).
 * @param email - User email address
 */
export const getStaffProfileByEmail = (email: string | null | undefined): StaffProfile | null => {
  if (!email) return null
  return STAFF_DIRECTORY[email.trim().toLowerCase()] || null
}

/**
 * Resolves a display name from email via the staff directory.
 * @param email - User email address
 */
export const getStaffNameByEmail = (email: string | null | undefined) => {
  const profile = getStaffProfileByEmail(email)
  return profile?.name || null
}
