import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const fieldBase =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400'

function Wrapper({ label, hint, error, required, children }: { label?: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-cta">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function Input({ label, hint, error, className, required, ...props }: InputProps) {
  return (
    <Wrapper label={label} hint={hint} error={error} required={required}>
      <input className={cn(fieldBase, error && 'border-red-300 focus:ring-red-100 focus:border-red-400', className)} required={required} {...props} />
    </Wrapper>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({ label, hint, error, className, required, ...props }: TextareaProps) {
  return (
    <Wrapper label={label} hint={hint} error={error} required={required}>
      <textarea className={cn(fieldBase, 'min-h-[100px] resize-y', error && 'border-red-300', className)} required={required} {...props} />
    </Wrapper>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
}

export function Select({ label, hint, error, className, required, children, ...props }: SelectProps) {
  return (
    <Wrapper label={label} hint={hint} error={error} required={required}>
      <select className={cn(fieldBase, 'appearance-none bg-no-repeat', error && 'border-red-300', className)} required={required} {...props}>
        {children}
      </select>
    </Wrapper>
  )
}
