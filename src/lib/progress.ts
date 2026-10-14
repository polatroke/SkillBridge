import type { Course, LessonProgress, Student } from '../types'

export interface LessonRef {
  moduleIndex: number
  lessonIndex: number
}

export interface CourseProgress {
  done: number
  total: number
  /** 0–100, arredondado. */
  percent: number
  isLessonDone: (ref: LessonRef) => boolean
  /** Primeira aula ainda não concluída (null quando o curso está completo ou não tem aulas). */
  nextLesson: LessonRef | null
}

/**
 * Progresso do aluno num curso. Matrícula já marcada como concluída conta como
 * 100% mesmo sem registros por aula (ex: alunos que concluíram antes do
 * acompanhamento por aula existir).
 */
export function getCourseProgress(course: Course, student: Student, lessonProgress: LessonProgress[]): CourseProgress {
  const completed = student.completedCourseIds.includes(course.id)
  const doneKeys = new Set(
    lessonProgress.filter((p) => p.studentId === student.id && p.courseId === course.id).map((p) => `${p.moduleIndex}:${p.lessonIndex}`)
  )
  const isLessonDone = ({ moduleIndex, lessonIndex }: LessonRef) => completed || doneKeys.has(`${moduleIndex}:${lessonIndex}`)

  let total = 0
  let done = 0
  let nextLesson: LessonRef | null = null
  course.modules.forEach((mod, moduleIndex) => {
    mod.lessons.forEach((_, lessonIndex) => {
      total++
      if (isLessonDone({ moduleIndex, lessonIndex })) done++
      else if (!nextLesson) nextLesson = { moduleIndex, lessonIndex }
    })
  })

  return { done, total, percent: total ? Math.round((done / total) * 100) : 0, isLessonDone, nextLesson }
}

/** Lista linear de todas as aulas do curso, na ordem — usada para navegar anterior/próxima. */
export function flattenLessons(course: Course): (LessonRef & { title: string; moduleTitle: string })[] {
  return course.modules.flatMap((mod, moduleIndex) =>
    mod.lessons.map((title, lessonIndex) => ({ moduleIndex, lessonIndex, title, moduleTitle: mod.title }))
  )
}
