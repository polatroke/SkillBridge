export type ClassValue = string | number | null | undefined | false | Record<string, boolean | undefined>

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
  return out.join(' ')
}
