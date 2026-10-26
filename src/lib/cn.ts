import { twMerge } from 'tailwind-merge'

export type ClassValue = string | number | null | undefined | false | Record<string, boolean | undefined>

/**
 * Junta classes e resolve conflitos do Tailwind: a última vence (`cn('bg-primary', 'bg-white')` → `bg-white`).
 * Sem o merge, a classe que "ganha" é a que vem depois no CSS gerado, não a passada por último — era
 * por isso que overrides via `className` (ex: botão branco do CTA, botão de excluir) sumiam.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  for (const v of values) {
    if (!v) continue
    if (typeof v === 'string' || typeof v === 'number') {
      out.push(String(v))
    } else {
      for (const key in v) {
        if (v[key]) out.push(key)
      }
    }
  }
  return twMerge(out.join(' '))
}
