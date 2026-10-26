import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canStudentAccessCourse, getVisibleCoursesForStudent, getVisibleJobsForStudent, getVisibleMentorsForStudent } from '../src/lib/access.ts'
import { flattenLessons, getCourseProgress } from '../src/lib/progress.ts'
import type { Course, Job, Mentor, Student } from '../src/types/index.ts'

const base = { summary: '', category: 'Dados', totalHours: 10, instructor: 'X', coverUrl: '', enrolledCount: 0, rating: 0 }
function course(id: string, extra: Partial<Course> = {}): Course {
  return { ...base, id, title: id, modules: [], status: 'publicado', programIds: [], ...extra }
}
function student(extra: Partial<Student> = {}): Student {
  return { id: 's1', type: 'student', name: 'Aluno', email: 'a@aluno.example.com', enrolledCourseIds: [], completedCourseIds: [], certificateIds: [], studyHours: 0, ...extra }
}
function mentor(id: string, extra: Partial<Mentor> = {}): Mentor {
  return { id, type: 'mentor', name: id, email: '', bio: '', skills: [], pricePerSession: 0, rating: 0, reviewsCount: 0, programIds: [], availability: [], ...extra }
}

const courses = [
  course('publico'),
  course('rascunho-publico', { status: 'rascunho' }),
  course('empresa-p1', { companyId: 'e1', programIds: ['p1'] }),
  course('empresa-p2', { companyId: 'e1', programIds: ['p2'] }),
  course('empresa-p1-rascunho', { companyId: 'e1', programIds: ['p1'], status: 'rascunho' }),
]

test('aluno sem treinamento só vê o catálogo público publicado', () => {
  const visible = getVisibleCoursesForStudent(courses, student()).map((c) => c.id)
  assert.deepEqual(visible, ['publico'])
  assert.equal(canStudentAccessCourse(courses[2], student()), false)
})

test('aluno em treinamento vê também os cursos publicados do próprio treinamento', () => {
  const s = student({ companyId: 'e1', programId: 'p1' })
  const visible = getVisibleCoursesForStudent(courses, s).map((c) => c.id)
  assert.deepEqual(visible, ['publico', 'empresa-p1'])
  assert.equal(canStudentAccessCourse(courses[3], s), false)
})

test('vagas nunca são públicas e seguem o treinamento do aluno', () => {
  const job = (id: string, programIds: string[]): Job => ({
    id, companyId: 'e1', title: id, description: '', requirements: [], department: '', type: 'Efetivo', mode: 'Remoto', location: '', programIds, status: 'aberta', applicationsCount: 0, createdAt: '2026-10-01',
  })
  const jobs = [job('j1', ['p1']), job('j2', ['p2'])]
  assert.deepEqual(getVisibleJobsForStudent(jobs, student()), [])
  assert.deepEqual(getVisibleJobsForStudent(jobs, student({ companyId: 'e1', programId: 'p1' })).map((j) => j.id), ['j1'])
})

test('mentores de empresa só aparecem para alunos do treinamento vinculado', () => {
  const mentors = [mentor('publico'), mentor('empresa', { companyId: 'e1', programIds: ['p1'] })]
  assert.deepEqual(getVisibleMentorsForStudent(mentors, student()).map((m) => m.id), ['publico'])
  assert.deepEqual(getVisibleMentorsForStudent(mentors, student({ companyId: 'e1', programId: 'p1' })).map((m) => m.id), ['publico', 'empresa'])
  assert.deepEqual(getVisibleMentorsForStudent(mentors, student({ companyId: 'e1', programId: 'p2' })).map((m) => m.id), ['publico'])
})

const withLessons = course('c1', {
  modules: [
    { id: 'm1', title: 'Módulo 1', duration: '1h', lessons: ['1.1', '1.2'] },
    { id: 'm2', title: 'Módulo 2', duration: '1h', lessons: ['2.1'] },
  ],
})

test('progresso do curso conta só as aulas do aluno e aponta a próxima pendente', () => {
  const s = student({ enrolledCourseIds: ['c1'] })
  const progress = getCourseProgress(withLessons, s, [
    { studentId: 's1', courseId: 'c1', moduleIndex: 0, lessonIndex: 0 },
    { studentId: 's1', courseId: 'c1', moduleIndex: 1, lessonIndex: 0 },
    { studentId: 'outro', courseId: 'c1', moduleIndex: 0, lessonIndex: 1 },
    { studentId: 's1', courseId: 'outro-curso', moduleIndex: 0, lessonIndex: 1 },
  ])
  assert.equal(progress.total, 3)
  assert.equal(progress.done, 2)
  assert.equal(progress.percent, 67)
  assert.deepEqual(progress.nextLesson, { moduleIndex: 0, lessonIndex: 1 })
  assert.equal(progress.isLessonDone({ moduleIndex: 0, lessonIndex: 1 }), false)
})

test('matrícula concluída vale 100% mesmo sem registro por aula', () => {
  const s = student({ enrolledCourseIds: ['c1'], completedCourseIds: ['c1'] })
  const progress = getCourseProgress(withLessons, s, [])
  assert.equal(progress.percent, 100)
  assert.equal(progress.nextLesson, null)
})

test('flattenLessons mantém a ordem módulo → aula', () => {
  assert.deepEqual(
    flattenLessons(withLessons).map((l) => `${l.moduleIndex}-${l.lessonIndex}:${l.title}`),
    ['0-0:1.1', '0-1:1.2', '1-0:2.1']
  )
})
