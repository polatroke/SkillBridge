import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Footer } from './Footer'
import { ButtonLink } from '../ui/Button'
import { ThemeToggle } from '../ui/ThemeToggle'
import logo from '../../assets/logo.svg'

/** Layout para telas públicas/institucionais (Landing, Login, Cadastro). Sempre fecha com Footer. */
export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-primary-100/70 bg-surface/90 backdrop-blur dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="" className="h-9 w-auto" />
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-50">SkillBridge</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/#cursos" className="text-sm font-semibold text-slate-600 hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-300">
              Cursos
            </Link>
            <Link to="/#mentoria" className="text-sm font-semibold text-slate-600 hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-300">
              Mentoria
            </Link>
            <Link to="/#empresas" className="text-sm font-semibold text-slate-600 hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-300">
              Para empresas
            </Link>
            <Link to="/#depoimentos" className="text-sm font-semibold text-slate-600 hover:text-primary-700 dark:text-slate-300 dark:hover:text-primary-300">
              Depoimentos
            </Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <ButtonLink to="/login" variant="ghost" size="sm">
                Entrar
              </ButtonLink>
            <ButtonLink to="/cadastro" variant="cta" size="sm">
                Criar conta grátis
              </ButtonLink>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button className="p-2 text-slate-600 dark:text-slate-300" onClick={() => setOpen((v) => !v)} aria-label="Abrir menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="space-y-1 border-t border-primary-100/70 px-6 py-4 md:hidden dark:border-slate-800">
            <Link to="/#cursos" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Cursos
            </Link>
            <Link to="/#mentoria" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Mentoria
            </Link>
            <Link to="/#empresas" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Para empresas
            </Link>
            <Link to="/#depoimentos" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Depoimentos
            </Link>
            <div className="mt-3 flex gap-3">
              <ButtonLink to="/login" className="flex-1" variant="secondary" size="sm" fullWidth>
                  Entrar
                </ButtonLink>
              <ButtonLink to="/cadastro" className="flex-1" variant="cta" size="sm" fullWidth>
                  Criar conta
                </ButtonLink>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
