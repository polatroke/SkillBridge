import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type BadgeStatus =
  | 'pendente'
  | 'aprovado'
  | 'ativo'
  | 'recusado'
  | 'concluido'
  | 'rascunho'
  | 'publicado'
  | 'aberta'
  | 'encerrada'
  | 'agendada'
  | 'cancelada'
  | 'neutral'

const statusClasses: Record<BadgeStatus, string> = {
  pendente: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  aprovado: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  ativo: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  recusado: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
  concluido: 'bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-500/15 dark:text-primary-300 dark:ring-primary-500/30',
  rascunho: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:ring-slate-600',
  publicado: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  aberta: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  encerrada: 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-700/60 dark:text-slate-400 dark:ring-slate-600',
  agendada: 'bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-500/15 dark:text-primary-300 dark:ring-primary-500/30',
  cancelada: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:ring-slate-600',
}

const labels: Partial<Record<BadgeStatus, string>> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  ativo: 'Ativo',
  recusado: 'Recusado',
  concluido: 'Concluído',
  rascunho: 'Rascunho',
  publicado: 'Publicado',
  aberta: 'Aberta',
  encerrada: 'Encerrada',
  agendada: 'Agendada',
  cancelada: 'Cancelada',
}

interface BadgeProps {
  status?: BadgeStatus
  children?: ReactNode
  className?: string
}

export function Badge({ status = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        statusClasses[status],
        className
      )}
    >
      {children ?? labels[status] ?? status}
    </span>
  )
}
