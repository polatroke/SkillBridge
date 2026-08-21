import { cn } from '../../lib/cn'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
}

const palette = ['bg-primary-100 text-primary-700', 'bg-cta-100 text-cta-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700']

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const colorIndex = name.length % palette.length
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold shrink-0',
        sizeClasses[size],
        palette[colorIndex],
        className
      )}
    >
      {initials(name)}
    </div>
  )
}
