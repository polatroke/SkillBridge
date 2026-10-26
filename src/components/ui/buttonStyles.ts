import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'cta' | 'secondary' | 'ghost' | 'danger' | 'destructive' | 'inverse'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-600 focus-visible:ring-primary-300 shadow-soft',
  cta: 'bg-cta text-white hover:bg-cta-600 focus-visible:ring-cta-200 shadow-soft',
  secondary:
    'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 focus-visible:ring-primary-200 dark:bg-slate-800 dark:text-primary-300 dark:border-primary-500/30 dark:hover:bg-primary-500/10',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200 dark:text-slate-300 dark:hover:bg-slate-700/60',
  danger:
    'bg-white text-red-600 border border-red-200 hover:bg-red-50 focus-visible:ring-red-200 dark:bg-slate-800 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/10',
  /** Ação irreversível confirmada (ex: botão "Remover" de um ConfirmDialog). */
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200 shadow-soft dark:focus-visible:ring-red-500/40',
  /** Sobre fundo colorido (ex: faixa laranja de CTA): branco nos dois temas. */
  inverse: 'bg-white text-cta-600 hover:bg-cta-50 focus-visible:ring-white/60 shadow-soft',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
}

/** Classes do botão — compartilhadas por <Button> e <ButtonLink> (link com cara de botão). */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}) {
  return cn(
    'inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className
  )
}
