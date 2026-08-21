import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { AccountType } from '../types'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute({ accountType, children }: { accountType: AccountType; children: ReactNode }) {
  const currentType = useAuthStore((s) => s.accountType)

  if (currentType !== accountType) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
