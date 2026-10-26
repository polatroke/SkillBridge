import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import type { AccountType } from '../types'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import { homePathFor } from '../lib/routes'
import { Button } from './ui/Button'

function FullScreen({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-900">{children}</div>
}

function Spinner() {
  return (
    <FullScreen>
      <div role="status" aria-label="Carregando" className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
    </FullScreen>
  )
}

export function ProtectedRoute({ accountType, children }: { accountType: AccountType; children: ReactNode }) {
  const location = useLocation()
  const loading = useAuthStore((s) => s.loading)
  const currentType = useAuthStore((s) => s.accountType)
  const dataLoaded = useDataStore((s) => s.dataLoaded)
  const loadError = useDataStore((s) => s.loadError)
  const fetchAll = useDataStore((s) => s.fetchAll)

  // Enquanto a sessão ainda está sendo restaurada (F5, primeira carga), não redireciona —
  // senão todo refresh manda o usuário logado de volta pro /login por uma fração de segundo.
  if (loading) return <Spinner />

  // Sem sessão: vai pro login lembrando a página pedida, para voltar a ela depois de entrar.
  if (!currentType) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />

  // Logado com outro tipo de conta (ex: mentor abrindo /aluno): leva para o próprio painel.
  if (currentType !== accountType) return <Navigate to={homePathFor(currentType)} replace />

  // As telas leem tudo do dataStore: sem esperar a primeira carga elas renderizavam vazias
  // (ou nada, nos `return null`) e, se a carga falhasse, ficavam assim para sempre.
  if (loadError && !dataLoaded) {
    return (
      <FullScreen>
        <div className="max-w-sm text-center">
          <AlertTriangle className="mx-auto text-amber-500" size={36} />
          <p className="mt-4 font-bold text-slate-800 dark:text-slate-100">Não foi possível carregar o painel</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{loadError}</p>
          <Button className="mt-5" onClick={() => void fetchAll()}>
            Tentar novamente
          </Button>
        </div>
      </FullScreen>
    )
  }
  if (!dataLoaded) return <Spinner />

  return <>{children}</>
}
