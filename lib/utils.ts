import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDomain(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function getMicrolinkScreenshot(url: string): string {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
}

export function getMicrolinkMeta(url: string): string {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true`
}
