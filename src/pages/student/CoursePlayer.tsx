import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Circle, MessageCircle, PlayCircle } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { useAuthStore } from '../../store/authStore'
import { useCurrentStudent, useDataStore } from '../../store/dataStore'
import { canStudentAccessCourse } from '../../lib/access'
import { flattenLessons, getCourseProgress } from '../../lib/progress'
import { cn } from '../../lib/cn'

/** Parâmetro ?aula=<módulo>-<aula> (índices a partir de 0). */
function parseLessonParam(value: string | null) {
  const match = value?.match(/^(\d+)-(\d+)$/)
  return match ? { moduleIndex: Number(match[1]), lessonIndex: Number(match[2]) } : null
}

export default function CoursePlayer() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const course = useDataStore((s) => s.courses.find((c) => c.id === courseId))
  const lessonProgress = useDataStore((s) => s.lessonProgress)
  const certificates = useDataStore((s) => s.certificates)
  const completeLesson = useDataStore((s) => s.completeLesson)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)

  if (!student) return null

  if (!course) {
    return (
      <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
        <EmptyState title="Curso não encontrado" description="O curso que você tentou acessar não existe ou foi removido." />
      </DashboardLayout>
    )
  }

  if (!canStudentAccessCourse(course, student)) return <Navigate to={`/aluno/cursos/${course.id}`} replace />

  const backToCourse = (
    <Link to={`/aluno/cursos/${course.id}`}>
      <Button variant="secondary" size="sm">
        Voltar para o curso
      </Button>
    </Link>
  )

  if (!student.enrolledCourseIds.includes(course.id)) {
    return (
      <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
        <EmptyState title="Você ainda não está matriculado(a)" description="Matricule-se no curso para começar a assistir às aulas." action={backToCourse} />
      </DashboardLayout>
    )
  }

  const lessons = flattenLessons(course)
  if (lessons.length === 0) {
    return (
      <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
        <EmptyState title="Este curso ainda não tem aulas" description="O instrutor ainda não publicou o conteúdo. Volte em breve." action={backToCourse} />
      </DashboardLayout>
    )
  }

  const progress = getCourseProgress(course, student, lessonProgress)
  const requested = parseLessonParam(searchParams.get('aula'))
  const fallback = progress.nextLesson ?? lessons[0]
  const currentPos = Math.max(
    0,
    lessons.findIndex((l) =>
      requested
        ? l.moduleIndex === requested.moduleIndex && l.lessonIndex === requested.lessonIndex
        : l.moduleIndex === fallback.moduleIndex && l.lessonIndex === fallback.lessonIndex
    )
  )
  const current = lessons[currentPos]
  const prev = lessons[currentPos - 1]
  const next = lessons[currentPos + 1]
  const currentDone = progress.isLessonDone(current)
  const certificate = certificates.find((c) => c.studentId === student.id && c.courseId === course.id)

  const goTo = (lesson: { moduleIndex: number; lessonIndex: number }) => {
    setError(null)
    setSearchParams({ aula: `${lesson.moduleIndex}-${lesson.lessonIndex}` })
  }

  const handleComplete = async () => {
    setSaving(true)
    setError(null)
    try {
      const { courseCompleted } = await completeLesson(course.id, current.moduleIndex, current.lessonIndex)
      if (courseCompleted) setFinished(true)
      else if (next) goTo(next)
    } catch {
      setError('Não foi possível salvar seu progresso. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link to="/aluno/cursos" className="hover:text-primary-600">
          Explorar Cursos
        </Link>
        <span>/</span>
        <Link to={`/aluno/cursos/${course.id}`} className="truncate hover:text-primary-600">
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300">Aulas</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="flex aspect-video flex-col items-center justify-center bg-gradient-to-br from-primary-800 to-primary-600 px-6 text-center text-white">
              <PlayCircle size={56} strokeWidth={1.5} className="opacity-90" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-primary-100">
                Módulo {current.moduleIndex + 1} · {current.moduleTitle}
              </p>
              <p className="mt-1 text-lg font-bold sm:text-xl">{current.title}</p>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-primary-500">
                  Aula {currentPos + 1} de {lessons.length}
                </p>
                {currentDone && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <CheckCircle2 size={12} /> Aula concluída
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-2xl">{current.title}</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Estude o material desta aula com {course.instructor} e marque como concluída para avançar. Ao concluir todas as aulas, seu certificado é
                emitido automaticamente.
              </p>

              {error && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60">
                <Button variant="ghost" icon={<ArrowLeft size={16} />} disabled={!prev} onClick={() => prev && goTo(prev)}>
                  Aula anterior
                </Button>
                {currentDone ? (
                  next ? (
                    <Button iconRight={<ArrowRight size={16} />} onClick={() => goTo(next)}>
                      Próxima aula
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => navigate(`/aluno/cursos/${course.id}`)}>
                      Voltar para o curso
                    </Button>
                  )
                ) : (
                  <Button iconRight={next ? <ArrowRight size={16} /> : <Award size={16} />} disabled={saving} onClick={handleComplete}>
                    {saving ? 'Salvando...' : next ? 'Concluir e avançar' : 'Concluir curso'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Seu progresso</p>
            <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700/60">
              <div className="h-2.5 rounded-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {progress.done} de {progress.total} aulas · {progress.percent}%
            </p>
          </Card>

          <Card padding="none" className="overflow-hidden">
            {course.modules.map((mod, moduleIndex) => (
              <div key={mod.id} className="border-b border-slate-100 last:border-0 dark:border-slate-700/60">
                <p className="bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
                  {moduleIndex + 1}. {mod.title}
                </p>
                <ul className="py-1">
                  {mod.lessons.map((title, lessonIndex) => {
                    const isCurrent = current.moduleIndex === moduleIndex && current.lessonIndex === lessonIndex
                    const done = progress.isLessonDone({ moduleIndex, lessonIndex })
                    return (
                      <li key={`${moduleIndex}-${lessonIndex}`}>
                        <button
                          onClick={() => goTo({ moduleIndex, lessonIndex })}
                          className={cn(
                            'flex w-full items-start gap-2.5 px-5 py-2.5 text-left text-sm transition-colors',
                            isCurrent
                              ? 'bg-primary-50 font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                              : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/40'
                          )}
                        >
                          {done ? (
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                          ) : isCurrent ? (
                            <PlayCircle size={16} className="mt-0.5 shrink-0 text-primary-500" />
                          ) : (
                            <Circle size={16} className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600" />
                          )}
                          <span>{title}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </Card>

          <Link to="/aluno/duvidas" className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300">
            <MessageCircle size={15} /> Ficou com dúvida? Fale com um mentor
          </Link>
        </div>
      </div>

      <Modal
        open={finished}
        onClose={() => setFinished(false)}
        title="Curso concluído!"
        footer={
          <>
            <Button variant="ghost" onClick={() => navigate(`/aluno/cursos/${course.id}`)}>
              Voltar para o curso
            </Button>
            {certificate && (
              <Button icon={<Award size={16} />} onClick={() => navigate(`/aluno/certificados/${certificate.id}`)}>
                Ver certificado
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col items-center py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Award size={28} />
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Parabéns! Você concluiu <strong>{course.title}</strong>. Seu certificado já está disponível no seu perfil.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
