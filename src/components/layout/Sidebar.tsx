import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { GraduationCap } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface SidebarItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  /** Contagem exibida como bolha ao lado do label (ex: mensagens não lidas). Omitido/0 não mostra nada. */
  badge?: number
}

export function Sidebar({ items, footer }: { items: SidebarItem[]; footer?: React.ReactNode }) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-6 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
          <GraduationCap size={20} />
        </div>
        <span className="text-lg font-extrabold text-slate-900 dark:text-slate-50">SkillBridge</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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
