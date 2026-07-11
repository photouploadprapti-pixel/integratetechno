import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind class names with conflict resolution.
 * @param inputs - Class values to merge
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
