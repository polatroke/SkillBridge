import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { cn } from '../../lib/cn'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone?: 'primary' | 'cta' | 'emerald' | 'amber'
}

const toneClasses = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300',
  cta: 'bg-cta-50 text-cta-600 dark:bg-cta-500/15 dark:text-cta-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'primary' }: StatCardProps) {
  return (
    <Card padding="md" className="flex items-start gap-4">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', toneClasses[tone])}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold text-slate-900 dark:text-slate-50">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
    </Card>
  )
}
