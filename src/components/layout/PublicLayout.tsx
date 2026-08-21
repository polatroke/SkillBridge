import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Footer } from './Footer'
import { Button } from '../ui/Button'

/** Layout para telas públicas/institucionais (Landing, Login, Cadastro). Sempre fecha com Footer. */
export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-primary-100/70 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <GraduationCap size={20} />
            </div>
            <span className="text-lg font-extrabold text-slate-900">SkillBridge</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#cursos" className="text-sm font-semibold text-slate-600 hover:text-primary-700">
              Cursos
            </a>
            <a href="#mentoria" className="text-sm font-semibold text-slate-600 hover:text-primary-700">
              Mentoria
            </a>
            <a href="#empresas" className="text-sm font-semibold text-slate-600 hover:text-primary-700">
              Para empresas
            </a>
            <a href="#depoimentos" className="text-sm font-semibold text-slate-600 hover:text-primary-700">
              Depoimentos
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button variant="cta" size="sm">
                Criar conta grátis
              </Button>
            </Link>
          </div>

          <button className="p-2 text-slate-600 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Abrir menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="space-y-1 border-t border-primary-100/70 px-6 py-4 md:hidden">
            <a href="#cursos" className="block py-2 text-sm font-semibold text-slate-600">
              Cursos
            </a>
            <a href="#mentoria" className="block py-2 text-sm font-semibold text-slate-600">
              Mentoria
            </a>
            <a href="#empresas" className="block py-2 text-sm font-semibold text-slate-600">
              Para empresas
            </a>
            <div className="mt-3 flex gap-3">
              <Link to="/login" className="flex-1">
                <Button variant="secondary" size="sm" fullWidth>
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastro" className="flex-1">
                <Button variant="cta" size="sm" fullWidth>
                  Criar conta
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
