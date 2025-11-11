import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date object to YYYY-MM-DD string without timezone issues
 */
export function formatDateISO(date: Date): string {
  return date.toLocaleDateString('sv-SE');
}
