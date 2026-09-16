import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { cn } from '../../lib/cn'

interface CourseCoverProps {
  coverUrl?: string | null
  title: string
  className?: string
  iconSize?: number
}

/**
 * `<img>` de capa de curso com fallback visual. Cursos sem `coverUrl` (ou com
 * uma URL que falha ao carregar) caem num placeholder em vez do ícone de
 * imagem quebrada do navegador.
 */
export function CourseCover({ coverUrl, title, className, iconSize = 28 }: CourseCoverProps) {
  const [broken, setBroken] = useState(false)

  if (!coverUrl || broken) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-primary-100 to-cta-100 text-primary-400 dark:from-primary-500/20 dark:to-cta-500/20 dark:text-primary-300',
          className
        )}
        title={title}
      >
        <BookOpen size={iconSize} strokeWidth={1.75} />
      </div>
    )
  }

  return <img src={coverUrl} alt={title} onError={() => setBroken(true)} className={cn('object-cover', className)} />
}
