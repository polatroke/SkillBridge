import { Link } from 'react-router-dom'
import { CalendarClock, Clock, Star, Users } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MentorSidebar } from '../../components/layout/MentorSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useCurrentMentor, useDataStore } from '../../store/dataStore'
import { formatDateBR } from '../../lib/date'

export default function MentorDashboard() {
  const authUser = useAuthStore((s) => s.user)
  const mentor = useCurrentMentor(authUser?.id)
  const sessions = useDataStore((s) => s.mentorSessions)
  const students = useDataStore((s) => s.students)
  const getStudentById = (id?: string) => students.find((s) => s.id === id)

  if (!mentor) return null

  const mySessions = sessions.filter((s) => s.mentorId === mentor.id)
  const upcoming = mySessions.filter((s) => s.status === 'agendada').sort((a, b) => a.date.localeCompare(b.date))
  const completed = mySessions.filter((s) => s.status === 'concluida')
  const uniqueStudents = new Set(mySessions.map((s) => s.studentId)).size
  const avgRating = completed.filter((s) => s.rating).length
    ? (completed.reduce((sum, s) => sum + (s.rating ?? 0), 0) / completed.filter((s) => s.rating).length).toFixed(1)
    : '—'

  return (
    <DashboardLayout sidebar={<MentorSidebar />} profileTitle="Painel do Mentor">
      <PageHeader
        title="Sua agenda"
        description="Acompanhe seus próximos compromissos e o histórico de mentorias."
        actions={
          <Link to="/mentor/horarios">
            <Button icon={<CalendarClock size={16} />}>Definir horários</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarClock} label="Sessões agendadas" value={upcoming.length} tone="primary" />
        <StatCard icon={Clock} label="Sessões concluídas" value={completed.length} tone="cta" />
        <StatCard icon={Users} label="Alunos atendidos" value={uniqueStudents} tone="emerald" />
        <StatCard icon={Star} label="Avaliação média" value={avgRating} tone="amber" />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Próximos compromissos</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {upcoming.map((session) => {
            const student = getStudentById(session.studentId)
            return (
              <div key={session.id} className="flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Avatar name={student?.name ?? '?'} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{student?.name}</p>
                    <p className="text-xs text-slate-500">{session.topic}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700">
                  <CalendarClock size={13} /> {formatDateBR(session.date)} · {session.start}–{session.end}
                </span>
              </div>
            )
          })}
          {upcoming.length === 0 && <p className="text-sm text-slate-400">Nenhum compromisso agendado no momento.</p>}
        </div>
      </Card>
    </DashboardLayout>
  )
}
