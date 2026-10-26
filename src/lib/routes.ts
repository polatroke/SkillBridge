import type { AccountType } from '../types'

/** Painel inicial de cada tipo de conta. */
export const HOME_PATHS: Record<AccountType, string> = {
  student: '/aluno',
  mentor: '/mentor',
  company: '/empresa',
}

export function homePathFor(type: AccountType): string {
  return HOME_PATHS[type]
}

/** Tipo de conta dono de uma rota do painel (ex: "/aluno/cursos/123" → student). */
export function accountTypeForPath(path?: string | null): AccountType | undefined {
  if (!path) return undefined
  return (Object.keys(HOME_PATHS) as AccountType[]).find((t) => path === HOME_PATHS[t] || path.startsWith(`${HOME_PATHS[t]}/`) || path.startsWith(`${HOME_PATHS[t]}?`))
}
