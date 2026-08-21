import type { Availability } from '../types'

/** "Hoje" fixo do protótipo, para manter os dados mockados determinísticos. */
export const TODAY = new Date('2026-08-20T12:00:00')

const weekdayIndex: Record<Availability['weekday'], number> = {
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
}

/** Retorna a próxima data (YYYY-MM-DD) a partir de hoje que cai no dia da semana informado. */
export function nextDateForWeekday(weekday: Availability['weekday']): string {
  const target = weekdayIndex[weekday]
  const date = new Date(TODAY)
  const diff = (target - date.getDay() + 7) % 7 || 7
  date.setDate(date.getDate() + diff)
  return date.toISOString().slice(0, 10)
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
