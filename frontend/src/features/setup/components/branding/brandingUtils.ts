import type { FontFamily, BorderRadiusStyle } from '@/features/setup/state/setupTypes'

export function getFontCss(font: FontFamily): string {
  const map: Record<FontFamily, string> = {
    'playfair': "'Playfair Display', serif",
    'sora': "'Sora', sans-serif",
    'inter': "'Inter', sans-serif",
    'dm-sans': "'DM Sans', sans-serif",
  }
  return map[font] ?? "'Inter', sans-serif"
}

export function getBorderRadius(style: BorderRadiusStyle): string {
  const map: Record<BorderRadiusStyle, string> = {
    minimal: '4px',
    soft: '10px',
    rounded: '16px',
  }
  return map[style]
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
