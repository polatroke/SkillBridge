import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 px-6 py-14 text-center dark:border-primary-500/30 dark:bg-primary-500/5">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-500 shadow-soft dark:bg-slate-700 dark:text-primary-300">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
