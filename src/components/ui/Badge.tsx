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
  pendente: 'bg-amber-50 text-amber-700 ring-amber-200',
  aprovado: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ativo: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  recusado: 'bg-red-50 text-red-700 ring-red-200',
  concluido: 'bg-primary-50 text-primary-700 ring-primary-200',
  rascunho: 'bg-slate-100 text-slate-600 ring-slate-200',
  publicado: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  aberta: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  encerrada: 'bg-slate-100 text-slate-500 ring-slate-200',
  agendada: 'bg-primary-50 text-primary-700 ring-primary-200',
  cancelada: 'bg-red-50 text-red-700 ring-red-200',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
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
