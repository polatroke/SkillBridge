import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Topbar } from './Topbar'
import { Footer } from './Footer'
import { MobileNavContext } from './mobileNav'

interface DashboardLayoutProps {
  sidebar: ReactNode
  profileTitle: string
  children: ReactNode
}

/**
 * Layout wrapper único para os painéis autenticados (Aluno / Mentor / Empresa).
 * No desktop a sidebar fica fixa na lateral; abaixo de `lg` vira um menu deslizante aberto pelo
 * botão do topo (antes ela ocupava 256px fixos e o painel ficava inutilizável no celular).
 * A área principal sempre termina em Footer — requisito obrigatório em todas as telas.
 */
export function DashboardLayout({ sidebar, profileTitle, children }: DashboardLayoutProps) {
  // Cada página monta o próprio layout, então trocar de tela já recomeça com o menu fechado.
  const [navOpen, setNavOpen] = useState(false)

  // Esc fecha o menu e a página de fundo não rola enquanto ele está aberto.
  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setNavOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [navOpen])

  return (
    <MobileNavContext.Provider value={{ open: navOpen, setOpen: setNavOpen }}>
      <div className="flex min-h-screen bg-surface">
        {navOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" aria-hidden="true" onClick={() => setNavOpen(false)} />}
        {sidebar}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar profileTitle={profileTitle} />
          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </MobileNavContext.Provider>
  )
}
