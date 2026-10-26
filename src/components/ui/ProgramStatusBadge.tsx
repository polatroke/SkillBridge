import { Badge } from './Badge'
import { programPhase } from '../../lib/catalog'
import type { Program } from '../../types'

/** Situação do treinamento pelas datas: "Em breve", "Ativo" ou "Encerrado". */
export function ProgramStatusBadge({ program, className }: { program: Pick<Program, 'startDate' | 'endDate'>; className?: string }) {
  const phase = programPhase(program)
  if (phase === 'em_breve')
    return (
      <Badge status="pendente" className={className}>
        Em breve
      </Badge>
    )
  if (phase === 'encerrado')
    return (
      <Badge status="encerrada" className={className}>
        Encerrado
      </Badge>
    )
  return <Badge status="ativo" className={className} />
}
