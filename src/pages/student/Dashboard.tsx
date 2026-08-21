import { Link } from 'react-router-dom'
import { BookOpen, CalendarClock, Clock, GraduationCap, Star, Award } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { useAuthStore } from '../../store/authStore'
import { useDataStore, useCurrentStudent } from '../../store/dataStore'
import { isStudentInProgram } from '../../lib/access'

export default function StudentDashboard() {
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const mentorSessions = useDataStore((s) => s.mentorSessions)
  const activityItems = useDataStore((s) => s.activityItems)
  const courses = useDataStore((s) => s.courses)
  const mentors = useDataStore((s) => s.mentors)
  const getCourseById = (id?: string) => courses.find((c) => c.id === id)
  const getMentorById = (id?: string) => mentors.find((m) => m.id === id)

  if (!student) return null

  const inProgram = isStudentInProgram(student)
  const inProgressCount = student.enrolledCourseIds.filter((id) => !student.completedCourseIds.includes(id)).length
  const nextSession = mentorSessions
    .filter((s) => s.studentId === student.id && s.status === 'agendada')
    .sort((a, b) => a.date.localeCompare(b.date))[0]
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
          <Link to="/aluno/cursos">
            <Button icon={<BookOpen size={16} />}>Explorar cursos</Button>
          </Link>
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
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-primary-50/60 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <Avatar name={getMentorById(nextSession.mentorId)?.name ?? '?'} size="lg" />
                <div>
                  <p className="font-bold text-slate-800">{getMentorById(nextSession.mentorId)?.name}</p>
                  <p className="text-sm text-slate-500">{nextSession.topic}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-primary-600">
                    <CalendarClock size={13} /> {nextSession.date} · {nextSession.start} – {nextSession.end}
                  </p>
                </div>
              </div>
              <Link to="/aluno/mentoria">
                <Button variant="secondary" size="sm">
                  Ver detalhes
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm text-slate-500">Você não tem mentorias agendadas no momento.</p>
              <Link to="/aluno/mentoria" className="mt-3 inline-block">
                <Button size="sm">Agendar mentoria</Button>
              </Link>
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
                return (
                  <Link
                    key={id}
                    to={`/aluno/cursos/${id}`}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 transition-colors hover:border-primary-200"
                  >
                    <img src={course.coverUrl} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{course.title}</p>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-primary" style={{ width: '45%' }} />
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

        <Card>
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
          </CardHeader>
          <ul className="space-y-4">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  {a.type === 'curso' && <BookOpen size={15} />}
                  {a.type === 'mentoria' && <GraduationCap size={15} />}
                  {a.type === 'certificado' && <Star size={15} />}
                </div>
                <div>
                  <p className="text-sm text-slate-700">{a.description}</p>
                  <p className="text-xs text-slate-400">{a.date}</p>
                </div>
              </li>
            ))}
            {recentActivity.length === 0 && <p className="text-sm text-slate-400">Sem atividades recentes.</p>}
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  )
}
