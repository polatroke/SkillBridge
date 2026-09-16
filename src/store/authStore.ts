import { create } from 'zustand'
import type { LoggedUser } from '../types'
import { supabase } from '../lib/supabaseClient'
import { resolveSessionUser, signIn as signInRequest, signOut as signOutRequest } from '../lib/supabase/auth'
import { useDataStore, subscribeRealtime, unsubscribeRealtime } from './dataStore'

interface AuthState {
  user: LoggedUser | null
  accountType: LoggedUser['type'] | null
  /** true enquanto a sessão ainda está sendo restaurada (evita redirect-flash pro /login no F5). */
  loading: boolean
  login: (email: string, password: string) => Promise<LoggedUser | null>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accountType: null,
  loading: true,

  login: async (email, password) => {
    const user = await signInRequest(email, password)
    set({ user, accountType: user?.type ?? null })
    if (user) {
      void useDataStore.getState().fetchAll()
      subscribeRealtime()
    }
    return user
  },

  logout: async () => {
    await signOutRequest()
    set({ user: null, accountType: null })
    useDataStore.getState().clear()
    unsubscribeRealtime()
  },

  refresh: async () => {
    const { data } = await supabase.auth.getSession()
    const authUser = data.session?.user
    const user = authUser ? await resolveSessionUser(authUser) : null
    set({ user, accountType: user?.type ?? null, loading: false })
    if (user) {
      void useDataStore.getState().fetchAll()
      subscribeRealtime()
    }
  },
}))

// Restaura a sessão assim que o módulo carrega...
void useAuthStore.getState().refresh()

// ...e mantém o estado sincronizado com login/logout/expiração em qualquer aba.
supabase.auth.onAuthStateChange((_event, session) => {
  const authUser = session?.user
  if (!authUser) {
    useAuthStore.setState({ user: null, accountType: null, loading: false })
    useDataStore.getState().clear()
    unsubscribeRealtime()
    return
  }
  resolveSessionUser(authUser).then((user) => {
    useAuthStore.setState({ user, accountType: user?.type ?? null, loading: false })
    if (user) {
      void useDataStore.getState().fetchAll()
      subscribeRealtime()
    }
  })
})
