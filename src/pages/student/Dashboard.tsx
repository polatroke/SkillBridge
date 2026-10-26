import { Link } from 'react-router-dom'
import { BookOpen, CalendarClock, ClipboardList, Clock, GraduationCap, Star, Award } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { ButtonLink } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { CourseCover } from '../../components/ui/CourseCover'
import { useAuthStore } from '../../store/authStore'
import { useDataStore, useCurrentStudent } from '../../store/dataStore'
import { isStudentInProgram } from '../../lib/access'
import { getCourseProgress } from '../../lib/progress'
import { formatDateBR, todayISO } from '../../lib/date'

export default function StudentDashboard() {
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const mentorSessions = useDataStore((s) => s.mentorSessions)
  const activityItems = useDataStore((s) => s.activityItems)
  const courses = useDataStore((s) => s.courses)
  const mentors = useDataStore((s) => s.mentors)
  const lessonProgress = useDataStore((s) => s.lessonProgress)
  const mentorActivities = useDataStore((s) => s.mentorActivities)
  const getCourseById = (id?: string) => courses.find((c) => c.id === id)
  const getMentorById = (id?: string) => mentors.find((m) => m.id === id)

  if (!student) return null

  const inProgram = isStudentInProgram(student)
  const inProgressCount = student.enrolledCourseIds.filter((id) => !student.completedCourseIds.includes(id)).length
  const today = todayISO()
  const nextSession = mentorSessions
    .filter((s) => s.studentId === student.id && s.status === 'agendada' && s.date >= today)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0]
  const pendingActivities = mentorActivities
    .filter((a) => a.studentId === student.id && a.status === 'pendente')
    .sort((a, b) => (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31'))
  const recentActivity = activityItems
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <PageHeader
        title={`Olá, ${student.name.split(' ')[0]}! 👋`}
        description={inProgram ? 'Continue sua jornada na sua trilha corporativa.' : 'Continue evoluindo no catálogo geral da SkillBridge.'}
        actions={
          <ButtonLink to="/aluno/cursos" icon={<BookOpen size={16} />}>Explorar cursos</ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Cursos em andamento" value={inProgressCount} tone="primary" />
        <StatCard icon={Clock} label="Horas estudadas" value={`${student.studyHours}h`} tone="cta" />
        <StatCard icon={GraduationCap} label="Mentorias realizadas" value={mentorSessions.filter((s) => s.studentId === student.id && s.status === 'concluida').length} tone="emerald" />
        <StatCard icon={Award} label="Certificados" value={student.certificateIds.length} tone="amber" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próxima mentoria</CardTitle>
          </CardHeader>
          {nextSession ? (
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-primary-50/60 dark:bg-primary-500/10 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <Avatar name={getMentorById(nextSession.mentorId)?.name ?? '?'} size="lg" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{getMentorById(nextSession.mentorId)?.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{nextSession.topic}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-primary-600">
                    <CalendarClock size={13} /> {formatDateBR(nextSession.date)} · {nextSession.start} – {nextSession.end}
                  </p>
                </div>
              </div>
              <ButtonLink to="/aluno/mentoria?aba=sessoes" variant="secondary" size="sm">
                  Ver detalhes
                </ButtonLink>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Você não tem mentorias agendadas no momento.</p>
              <ButtonLink to="/aluno/mentoria" className="mt-3" size="sm">Agendar mentoria</ButtonLink>
            </div>
          )}

          <CardHeader className="mt-8">
            <CardTitle>Cursos em andamento</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {student.enrolledCourseIds
              .filter((id) => !student.completedCourseIds.includes(id))
              .map((id) => {
                const course = getCourseById(id)
                if (!course) return null
                const progress = getCourseProgress(course, student, lessonProgress)
                return (
                  <Link
                    key={id}
                    to={`/aluno/cursos/${id}/aulas`}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-700/60 p-3 transition-colors hover:border-primary-200"
                  >
                    <CourseCover coverUrl={course.coverUrl} title={course.title} className="h-14 w-20 shrink-0 rounded-lg" iconSize={18} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{course.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-700/60">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${progress.percent}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">{progress.percent}%</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            {student.enrolledCourseIds.filter((id) => !student.completedCourseIds.includes(id)).length === 0 && (
              <p className="text-sm text-slate-400">Nenhum curso em andamento no momento.</p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Atividades para fazer</CardTitle>
              <Link to="/aluno/atividades" className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300">
                Ver todas
              </Link>
            </CardHeader>
            <ul className="space-y-3">
              {pendingActivities.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <Link to="/aluno/atividades" className="flex gap-3 rounded-xl p-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cta-50 text-cta-600 dark:bg-cta-500/10">
                      <ClipboardList size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.dueDate ? `Prazo: ${formatDateBR(a.dueDate)}` : 'Sem prazo'}</p>
                    </div>
                  </Link>
                </li>
              ))}
              {pendingActivities.length === 0 && <p className="text-sm text-slate-400">Nenhuma atividade pendente. 🎉</p>}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade recente</CardTitle>
            </CardHeader>
            <ul className="space-y-4">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600">
                    {a.type === 'curso' && <BookOpen size={15} />}
                    {a.type === 'mentoria' && <GraduationCap size={15} />}
                    {a.type === 'certificado' && <Star size={15} />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{a.description}</p>
                    <p className="text-xs text-slate-400">{formatDateBR(a.date)}</p>
                  </div>
                </li>
              ))}
              {recentActivity.length === 0 && <p className="text-sm text-slate-400">Sem atividades recentes.</p>}
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
