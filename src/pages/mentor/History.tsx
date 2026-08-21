import { Star } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MentorSidebar } from '../../components/layout/MentorSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { useCurrentMentor, useDataStore } from '../../store/dataStore'
import { formatDateBR } from '../../lib/date'

export default function MentorHistory() {
  const authUser = useAuthStore((s) => s.user)
  const mentor = useCurrentMentor(authUser?.id)
  const sessions = useDataStore((s) => s.mentorSessions)
  const students = useDataStore((s) => s.students)
  const getStudentById = (id?: string) => students.find((s) => s.id === id)

  if (!mentor) return null

  const history = sessions
    .filter((s) => s.mentorId === mentor.id && s.status === 'concluida')
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <DashboardLayout sidebar={<MentorSidebar />} profileTitle="Painel do Mentor">
      <PageHeader title="Histórico de Mentorias" description="Sessões já realizadas e avaliações recebidas dos seus mentorados." />

      <div className="space-y-4">
        {history.map((session) => {
          const student = getStudentById(session.studentId)
          return (
            <Card key={session.id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-3">
                  <Avatar name={student?.name ?? '?'} />
                  <div>
                    <p className="font-bold text-slate-800">{student?.name}</p>
                    <p className="text-sm text-slate-500">{session.topic}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDateBR(session.date)} · {session.start}–{session.end}</p>
                  </div>
                </div>
                <Badge status="concluido">Concluída</Badge>
              </div>

              {session.review && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-1 text-cta">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} fill={i < (session.rating ?? 0) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">“{session.review}”</p>
                </div>
              )}
            </Card>
          )
        })}

        {history.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            Nenhuma mentoria concluída até o momento.
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
