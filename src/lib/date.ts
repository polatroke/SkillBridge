import type { Availability } from '../types'

const weekdayIndex: Record<Availability['weekday'], number> = {
  Segunda: 1,
  Terça: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sábado: 6,
}

/** Data local (YYYY-MM-DD). Não usa toISOString() para não pular de dia por causa do fuso (UTC). */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** Retorna a próxima data (YYYY-MM-DD) a partir de hoje que cai no dia da semana informado. */
export function nextDateForWeekday(weekday: Availability['weekday'], from: Date = new Date()): string {
  const target = weekdayIndex[weekday]
  const date = new Date(from)
  const diff = (target - date.getDay() + 7) % 7 || 7
  date.setDate(date.getDate() + diff)
  return toISODate(date)
}

/**
 * Horários semanais em ordem de calendário (próxima data, depois hora de início). A ordem do banco
 * não segue o calendário: uma "Segunda" do mês seguinte aparecia antes de uma "Quinta" desta semana.
 */
export function sortByNextOccurrence<T extends Pick<Availability, 'weekday' | 'start'>>(slots: T[], from: Date = new Date()): T[] {
  return slots
    .map((slot) => ({ slot, key: `${nextDateForWeekday(slot.weekday, from)} ${slot.start}` }))
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ slot }) => slot)
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** Formata um timestamp ISO completo (ex: mensagem de chat) como "dd/mm, HH:MM". */
export function formatDateTimeBR(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
