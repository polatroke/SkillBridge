import type { Course, Program, Student } from '../types'
import { todayISO } from './date'

/** Áreas dos cursos (filtro do catálogo e select do cadastro de curso). */
export const CATEGORIES = ['Tecnologia', 'Dados', 'Liderança', 'Vendas', 'Marketing', 'Produto'] as const

/** Setores oferecidos no cadastro e nas configurações da empresa. */
export const SECTORS = ['Tecnologia', 'Varejo', 'Indústria', 'Serviços Financeiros', 'Saúde', 'Educação', 'Outro'] as const

export type ProgramPhase = 'em_breve' | 'ativo' | 'encerrado'

/** Situação do treinamento pelas datas (YYYY-MM-DD comparam corretamente como texto). */
export function programPhase(program: Pick<Program, 'startDate' | 'endDate'>, today = todayISO()): ProgramPhase {
  if (today < program.startDate) return 'em_breve'
  if (today > program.endDate) return 'encerrado'
  return 'ativo'
}

/**
 * Aulas digitadas no cadastro do curso (uma por linha). O texto só vira lista ao salvar: converter a
 * cada tecla descartava a linha vazia recém-criada e o Enter não funcionava.
 */
export function parseLessons(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

/** O que muda ao trocar o conjunto `current` por `next` (só a diferença é gravada no banco). */
export function diffIds(current: string[], next: string[]): { toAdd: string[]; toRemove: string[] } {
  return { toAdd: next.filter((id) => !current.includes(id)), toRemove: current.filter((id) => !next.includes(id)) }
}

/** Total de aulas do curso (soma das aulas de todos os módulos). */
export function lessonCount(course: Pick<Course, 'modules'>): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
}

/**
 * Progresso médio (0–100) dos alunos de um treinamento: para cada aluno, a fração dos cursos do
 * treinamento que ele concluiu; depois a média entre os alunos. Antes o painel mostrava como
 * "progresso" a porcentagem de alunos que concluíram qualquer curso (inclusive fora do treinamento).
 */
export function programProgress(program: Pick<Program, 'id' | 'courseIds'>, students: Student[]): number {
  const members = students.filter((s) => s.programId === program.id)
  if (members.length === 0 || program.courseIds.length === 0) return 0
  const total = members.reduce((sum, s) => {
    const done = program.courseIds.filter((id) => s.completedCourseIds.includes(id)).length
    return sum + done / program.courseIds.length
  }, 0)
  return Math.round((total / members.length) * 100)
}

/** Média de várias notas (1–5) com uma casa decimal, ou null quando não há nenhuma nota. */
export function averageRating(ratings: (number | null | undefined)[]): number | null {
  const valid = ratings.filter((r): r is number => typeof r === 'number' && r > 0)
  if (valid.length === 0) return null
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10
}
