import { create } from 'zustand'
import type { AccountType, LoggedUser } from '../types'
import { companies } from '../mocks/companies'
import { students } from '../mocks/students'
import { mentors } from '../mocks/mentors'

interface AuthState {
  user: LoggedUser | null
  accountType: AccountType | null
  /** Faz login "mockado": tenta casar por e-mail (aluno/mentor) ou CNPJ (empresa); senão usa a conta demo padrão do tipo. */
  login: (type: AccountType, identifier: string) => LoggedUser
  loginAs: (user: LoggedUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accountType: null,
  login: (type, identifier) => {
    let user: LoggedUser
    const cleaned = identifier.trim().toLowerCase()
    if (type === 'student') {
      user = students.find((s) => s.email.toLowerCase() === cleaned) ?? students[0]
    } else if (type === 'mentor') {
      user = mentors.find((m) => m.email.toLowerCase() === cleaned) ?? mentors[0]
    } else {
      user = companies.find((c) => c.cnpj.replace(/\D/g, '') === cleaned.replace(/\D/g, '')) ?? companies[0]
    }
    set({ user, accountType: type })
    return user
  },
  loginAs: (user) => set({ user, accountType: user.type }),
  logout: () => set({ user: null, accountType: null }),
}))
