import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { AccountType } from '../types'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute({ accountType, children }: { accountType: AccountType; children: ReactNode }) {
  const loading = useAuthStore((s) => s.loading)
  const currentType = useAuthStore((s) => s.accountType)

  // Enquanto a sessão ainda está sendo restaurada (F5, primeira carga), não redireciona —
  // senão todo refresh manda o usuário logado de volta pro /login por uma fração de segundo.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (currentType !== accountType) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
