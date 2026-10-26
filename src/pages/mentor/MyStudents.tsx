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
import { friendlyError } from '../../lib/errors'

export default function MyStudents() {
  const authUser = useAuthStore((s) => s.user)
  const mentor = useCurrentMentor(authUser?.id)
  const sessions = useDataStore((s) => s.mentorSessions)
  const students = useDataStore((s) => s.students)
  const getStudentById = (id?: string) => students.find((s) => s.id === id)
  const completeSessionFeedback = useDataStore((s) => s.completeSessionFeedback)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  /** Situação do último "Salvar anotação" de cada sessão. */
  const [noteStatus, setNoteStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({})
  const [noteError, setNoteError] = useState<Record<string, string>>({})

  const saveNote = async (sessionId: string, notes: string) => {
    setNoteStatus((s) => ({ ...s, [sessionId]: 'saving' }))
    try {
      await completeSessionFeedback(sessionId, notes.trim())
      setNoteStatus((s) => ({ ...s, [sessionId]: 'saved' }))
    } catch (err) {
      setNoteError((m) => ({ ...m, [sessionId]: friendlyError(err, 'Não foi possível salvar. Tente novamente.') }))
      setNoteStatus((s) => ({ ...s, [sessionId]: 'error' }))
    }
  }

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
          // As anotações são por sessão: ao surgir uma sessão nova, as anteriores continuam visíveis aqui
          // (antes o campo voltava vazio e parecia que o registro tinha sido perdido).
          const earlierNotes = studentSessions.slice(1).filter((s) => s.notes)

          return (
            <Card key={studentId}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-3">
                  <Avatar name={student?.name ?? '?'} size="lg" />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{student?.name}</p>
                    <p className="text-xs text-slate-400">{student?.email}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {studentSessions.map((s) => (
                        <Badge key={s.id} status={s.status === 'concluida' ? 'concluido' : s.status === 'cancelada' ? 'cancelada' : 'agendada'}>
                          {formatDateBR(s.date)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 dark:border-slate-700/60 pt-4">
                <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Anotações da sessão de {formatDateBR(lastSession.date)}
                  {lastSession.status === 'cancelada' && <span className="font-normal text-slate-400"> (cancelada)</span>}
                </p>
                <textarea
                  value={draftValue}
                  onChange={(e) => {
                    setDrafts((d) => ({ ...d, [lastSession.id]: e.target.value }))
                    setNoteStatus((s) => {
                      const next = { ...s }
                      delete next[lastSession.id]
                      return next
                    })
                  }}
                  placeholder="Registre observações sobre o desenvolvimento deste aluno..."
                  aria-label={`Anotações sobre ${student?.name ?? 'o aluno'}`}
                  className="min-h-[80px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
                />
                <div className="mt-2 flex items-center gap-3">
                  <Button
                    size="sm"
                    icon={<Save size={13} />}
                    disabled={noteStatus[lastSession.id] === 'saving'}
                    onClick={() => saveNote(lastSession.id, draftValue)}
                  >
                    {noteStatus[lastSession.id] === 'saving' ? 'Salvando...' : 'Salvar anotação'}
                  </Button>
                  {noteStatus[lastSession.id] === 'saved' && <span className="text-sm font-semibold text-emerald-600">Anotação salva!</span>}
                  {noteStatus[lastSession.id] === 'error' && (
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">{noteError[lastSession.id]}</span>
                  )}
                </div>
                {earlierNotes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Anotações anteriores</p>
                    {earlierNotes.map((s) => (
                      <div key={s.id} className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm dark:bg-slate-800/60">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {formatDateBR(s.date)} · {s.topic}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{s.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )
        })}

        {studentIds.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-400">
            Você ainda não tem alunos mentorados. Assim que uma sessão for agendada, o aluno aparece aqui.
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
