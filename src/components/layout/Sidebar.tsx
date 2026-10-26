import { NavLink } from 'react-router-dom'
import { X, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import logo from '../../assets/logo.svg'
import { useMobileNav } from './mobileNav'

export interface SidebarItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  /** Contagem exibida como bolha ao lado do label (ex: mensagens não lidas). Omitido/0 não mostra nada. */
  badge?: number
}

export function Sidebar({ items, footer }: { items: SidebarItem[]; footer?: React.ReactNode }) {
  const { open, setOpen } = useMobileNav()
  return (
    <aside
      id="painel-menu"
      className={cn(
        // Celular/tablet: gaveta fixa que entra pela esquerda. Desktop: coluna fixa que acompanha a rolagem
        // (antes era só h-screen sem sticky e sumia ao rolar páginas longas).
        'fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-slate-100 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900',
        'lg:sticky lg:top-0 lg:z-auto lg:translate-x-0',
        open ? 'translate-x-0 shadow-card' : '-translate-x-full'
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-6 dark:border-slate-800">
        <img src={logo} alt="" className="h-9 w-auto" />
        <span className="flex-1 text-lg font-extrabold text-slate-900 dark:text-slate-50">SkillBridge</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden dark:hover:bg-slate-800"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Menu do painel">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-slate-500 hover:bg-primary-50 hover:text-primary-700 dark:text-slate-400 dark:hover:bg-primary-500/10 dark:hover:text-primary-300'
              )
            }
          >
            <item.icon size={18} strokeWidth={2} />
            <span className="flex-1">{item.label}</span>
            {!!item.badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cta px-1.5 text-[10px] font-bold text-white">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {footer && <div className="shrink-0 border-t border-slate-100 p-4 dark:border-slate-800">{footer}</div>}
    </aside>
  )
}
