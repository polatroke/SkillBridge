// ---------------------------------------------------------------------------
// Regras de negócio de acesso (CRÍTICO)
//
// Um aluno só enxerga cursos/mentores/vagas de uma empresa se estiver
// vinculado a um "programa" (treinamento) ativo daquela empresa. Fora disso,
// só vê o catálogo público geral da SkillBridge. Vagas nunca são públicas.
// ---------------------------------------------------------------------------
import type { Course, Job, Mentor, Student } from '../types'

/** Um aluno está "em treinamento" quando possui companyId + programId definidos. */
export function isStudentInProgram(student: Student | null | undefined): boolean {
  return !!student?.companyId && !!student?.programId
}

/** Cursos públicos: sem empresa vinculada e publicados. */
export function getPublicCourses(courses: Course[]): Course[] {
  return courses.filter((c) => !c.companyId && c.status === 'publicado')
}

/** Cursos de empresa visíveis para o aluno: mesma empresa + mesmo treinamento + publicado. */
export function getCompanyCoursesForStudent(courses: Course[], student: Student | null | undefined): Course[] {
  if (!isStudentInProgram(student)) return []
  return courses.filter(
    (c) => c.companyId === student!.companyId && c.programIds.includes(student!.programId!) && c.status === 'publicado'
  )
}

/** Todos os cursos que o aluno pode ver: público + (condicional) empresa. */
export function getVisibleCoursesForStudent(courses: Course[], student: Student | null | undefined): Course[] {
  return [...getPublicCourses(courses), ...getCompanyCoursesForStudent(courses, student)]
}

/** Mentores públicos: sem empresa vinculada. */
export function getPublicMentors(mentors: Mentor[]): Mentor[] {
  return mentors.filter((m) => !m.companyId)
}

/** Mentores de empresa visíveis para o aluno: mesma empresa + vinculado ao treinamento do aluno. */
export function getCompanyMentorsForStudent(mentors: Mentor[], student: Student | null | undefined): Mentor[] {
  if (!isStudentInProgram(student)) return []
  return mentors.filter((m) => m.companyId === student!.companyId && m.programIds.includes(student!.programId!))
}

export function getVisibleMentorsForStudent(mentors: Mentor[], student: Student | null | undefined): Mentor[] {
  return [...getPublicMentors(mentors), ...getCompanyMentorsForStudent(mentors, student)]
}

/**
 * Vagas nunca são públicas. Só aparecem para o aluno se ele estiver em um
 * treinamento cujo id conste em job.programIds.
 */
export function getVisibleJobsForStudent(jobs: Job[], student: Student | null | undefined): Job[] {
  if (!isStudentInProgram(student)) return []
  return jobs.filter((j) => j.programIds.includes(student!.programId!))
}

export function courseOriginLabel(course: Course, companyName?: string): string | null {
  if (!course.companyId) return null
  return `Curso da ${companyName ?? 'empresa'}`
}
