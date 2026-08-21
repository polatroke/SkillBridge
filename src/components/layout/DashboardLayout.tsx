import type { ReactNode } from 'react'
import { Topbar } from './Topbar'
import { Footer } from './Footer'

interface DashboardLayoutProps {
  sidebar: ReactNode
  profileTitle: string
  children: ReactNode
}

/**
 * Layout wrapper único para os painéis autenticados (Aluno / Mentor / Empresa).
 * Sidebar fica fixa na lateral; a área principal cresce com o conteúdo e
 * sempre termina em Footer — requisito obrigatório em todas as telas.
 */
export function DashboardLayout({ sidebar, profileTitle, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-surface">
      {sidebar}
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar profileTitle={profileTitle} />
        <main className="flex-1 px-6 py-8 sm:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
