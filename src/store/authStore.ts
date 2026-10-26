import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { AccountType, LoggedUser } from '../types'
import { supabase } from '../lib/supabaseClient'
import { resolveSessionUser, signIn as signInRequest, signOut as signOutRequest } from '../lib/supabase/auth'
import { useDataStore, subscribeRealtime, unsubscribeRealtime } from './dataStore'

interface AuthState {
  user: LoggedUser | null
  accountType: LoggedUser['type'] | null
  /** true enquanto a sessão ainda está sendo restaurada (evita redirect-flash pro /login no F5). */
  loading: boolean
  /** Lança erro (com mensagem pronta pra tela) se as credenciais ou o tipo de conta não baterem. */
  login: (email: string, password: string, expectedType: AccountType) => Promise<LoggedUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

/** Incrementado a cada evento de sessão — resoluções assíncronas de um evento antigo são descartadas
 * (senão um SIGNED_IN lento podia republicar o usuário depois do signOut). */
let authSeq = 0
/** Enquanto login() confere o tipo da conta, só ele publica o usuário — o listener não. */
let loginInFlight = false
/** Id (auth.users) da sessão já publicada: renovação de token da mesma conta não recarrega tudo. */
let publishedAuthId: string | null = null

function publish(authUser: User | null, user: LoggedUser | null) {
  publishedAuthId = user && authUser ? authUser.id : null
  useAuthStore.setState({ user, accountType: user?.type ?? null, loading: false })
  if (user) {
    void useDataStore.getState().fetchAll()
    subscribeRealtime()
  } else {
    useDataStore.getState().clear()
    unsubscribeRealtime()
  }
}

/** Resolve o usuário do app sem deixar a falha (rede, RLS) virar "unhandled rejection" com loading eterno. */
async function safeResolve(authUser: User): Promise<LoggedUser | null> {
  try {
    return await resolveSessionUser(authUser)
  } catch (err) {
    console.error('Não foi possível carregar a conta', err)
    return null
  }
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  accountType: null,
  loading: true,

  login: async (email, password, expectedType) => {
    loginInFlight = true
    try {
      const { authUser, user } = await signInRequest(email, password, expectedType)
      authSeq++
      publish(authUser, user)
      return user
    } finally {
      loginInFlight = false
    }
  },

  logout: async () => {
    authSeq++
    publish(null, null)
    await signOutRequest()
  },

  /** Relê a sessão atual (usado depois do cadastro, quando o signUp já abre sessão). */
  refresh: async () => {
    const seq = ++authSeq
    const { data } = await supabase.auth.getSession()
    const authUser = data.session?.user ?? null
    const user = authUser ? await safeResolve(authUser) : null
    if (seq === authSeq) publish(authUser, user)
  },
}))

// O cliente emite INITIAL_SESSION ao assinar (restaura a sessão no F5) e depois mantém o estado
// sincronizado com login/logout/expiração em qualquer aba. Antes havia também um refresh() no
// carregamento do módulo, que resolvia a mesma sessão duas vezes e fora da ordem dos eventos.
const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  const seq = ++authSeq
  const authUser = session?.user ?? null
  if (!authUser) {
    publish(null, null)
    return
  }
  if (loginInFlight) return
  // A renovação do token (a cada hora) dispara o evento de novo: mesma conta, nada a recarregar.
  if ((event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && publishedAuthId === authUser.id) return
  void safeResolve(authUser).then((user) => {
    if (seq === authSeq) publish(authUser, user)
  })
})

// Hot reload (só em dev): o módulo é recriado, mas o cliente Supabase não. Sem isso, cada edição
// deixava um ouvinte antigo vivo, que continuava reagindo aos eventos de sessão com o estado velho.
import.meta.hot?.dispose(() => authListener.subscription.unsubscribe())
