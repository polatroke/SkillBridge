import { useState } from 'react'
import { Save } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MentorSidebar } from '../../components/layout/MentorSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useCurrentMentor, useDataStore } from '../../store/dataStore'
import { formatDateBR } from '../../lib/date'

export default function MyStudents() {
  const authUser = useAuthStore((s) => s.user)
  const mentor = useCurrentMentor(authUser?.id)
  const sessions = useDataStore((s) => s.mentorSessions)
  const students = useDataStore((s) => s.students)
  const getStudentById = (id?: string) => students.find((s) => s.id === id)
  const completeSessionFeedback = useDataStore((s) => s.completeSessionFeedback)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  if (!mentor) return null

  const mySessions = sessions.filter((s) => s.mentorId === mentor.id)
  const studentIds = Array.from(new Set(mySessions.map((s) => s.studentId)))

  return (
    <DashboardLayout sidebar={<MentorSidebar />} profileTitle="Painel do Mentor">
      <PageHeader title="Meus Alunos" description="Acompanhe seus mentorados e registre anotações e feedback de cada um." />

      <div className="space-y-5">
        {studentIds.map((studentId) => {
          const student = getStudentById(studentId)
          const studentSessions = mySessions.filter((s) => s.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date))
          const lastSession = studentSessions[0]
          const draftValue = drafts[lastSession.id] ?? lastSession.notes ?? ''

          return (
            <Card key={studentId}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-3">
                  <Avatar name={student?.name ?? '?'} size="lg" />
                  <div>
                    <p className="font-bold text-slate-800">{student?.name}</p>
                    <p className="text-xs text-slate-400">{student?.email}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {studentSessions.map((s) => (
                        <Badge key={s.id} status={s.status === 'concluida' ? 'concluido' : 'agendada'}>
                          {formatDateBR(s.date)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-1.5 text-sm font-semibold text-slate-700">Anotações / feedback</p>
                <textarea
                  value={draftValue}
                  onChange={(e) => setDrafts((d) => ({ ...d, [lastSession.id]: e.target.value }))}
                  placeholder="Registre observações sobre o desenvolvimento deste aluno..."
                  className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
                />
                <Button
                  size="sm"
                  icon={<Save size={13} />}
                  className="mt-2"
                  onClick={() => completeSessionFeedback(lastSession.id, draftValue)}
                >
                  Salvar anotação
                </Button>
              </div>
            </Card>
          )
        })}

        {studentIds.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            Você ainda não tem alunos mentorados. Assim que uma sessão for agendada, o aluno aparece aqui.
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
