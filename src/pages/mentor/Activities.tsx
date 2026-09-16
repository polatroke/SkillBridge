import { useState } from 'react'
import { CalendarDays, Plus, Trash2 } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MentorSidebar } from '../../components/layout/MentorSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useAuthStore } from '../../store/authStore'
import { useCurrentMentor, useDataStore } from '../../store/dataStore'
import { formatDateBR } from '../../lib/date'

interface Draft {
  title: string
  description: string
  dueDate: string
}

const emptyDraft: Draft = { title: '', description: '', dueDate: '' }

export default function MentorActivities() {
  const authUser = useAuthStore((s) => s.user)
  const mentor = useCurrentMentor(authUser?.id)
  const sessions = useDataStore((s) => s.mentorSessions)
  const students = useDataStore((s) => s.students)
  const activities = useDataStore((s) => s.mentorActivities)
  const assignActivity = useDataStore((s) => s.assignActivity)
  const updateActivityStatus = useDataStore((s) => s.updateActivityStatus)
  const deleteActivity = useDataStore((s) => s.deleteActivity)
  const getStudentById = (id?: string) => students.find((s) => s.id === id)

  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (!mentor) return null

  const studentIds = Array.from(new Set(sessions.filter((s) => s.mentorId === mentor.id).map((s) => s.studentId)))
  const mentorActivities = activities.filter((a) => a.mentorId === mentor.id)

  const setDraft = (studentId: string, patch: Partial<Draft>) =>
    setDrafts((d) => ({ ...d, [studentId]: { ...(d[studentId] ?? emptyDraft), ...patch } }))

  const handleAssign = async (studentId: string, e: React.FormEvent) => {
    e.preventDefault()
    const draft = drafts[studentId] ?? emptyDraft
    if (!draft.title.trim()) return
    await assignActivity(studentId, draft.title.trim(), draft.description.trim() || undefined, draft.dueDate || undefined)
    setDrafts((d) => ({ ...d, [studentId]: emptyDraft }))
  }

  return (
    <DashboardLayout sidebar={<MentorSidebar />} profileTitle="Painel do Mentor">
      <PageHeader title="Atividades" description="Atribua tarefas aos seus mentorados e acompanhe o que já foi concluído." />

      <div className="space-y-5">
        {studentIds.map((studentId) => {
          const student = getStudentById(studentId)
          const draft = drafts[studentId] ?? emptyDraft
          const studentActivities = mentorActivities
            .filter((a) => a.studentId === studentId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

          return (
            <Card key={studentId}>
              <div className="flex items-center gap-3">
                <Avatar name={student?.name ?? '?'} size="lg" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{student?.name}</p>
                  <p className="text-xs text-slate-400">{student?.email}</p>
                </div>
              </div>

              <form onSubmit={(e) => handleAssign(studentId, e)} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end dark:border-slate-700/60">
                <div className="flex-1">
                  <Input
                    label="Nova atividade"
                    placeholder="Ex: Montar um wireframe de baixa fidelidade"
                    value={draft.title}
                    onChange={(e) => setDraft(studentId, { title: e.target.value })}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Input label="Prazo" type="date" value={draft.dueDate} onChange={(e) => setDraft(studentId, { dueDate: e.target.value })} />
                </div>
                <Button type="submit" icon={<Plus size={15} />} disabled={!draft.title.trim()}>
                  Atribuir
                </Button>
              </form>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft(studentId, { description: e.target.value })}
                placeholder="Detalhes da atividade (opcional)"
                className="mt-2 min-h-[60px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
              />

              <div className="mt-4 space-y-2.5">
                {studentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 p-3.5 sm:flex-row sm:items-center dark:border-slate-700/60"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{activity.title}</p>
                      {activity.description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{activity.description}</p>}
                      {activity.dueDate && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <CalendarDays size={12} /> Prazo: {formatDateBR(activity.dueDate)}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge status={activity.status === 'concluida' ? 'concluido' : 'pendente'} />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateActivityStatus(activity.id, activity.status === 'concluida' ? 'pendente' : 'concluida')}
                      >
                        {activity.status === 'concluida' ? 'Reabrir' : 'Concluir'}
                      </Button>
                      <button onClick={() => setDeleteId(activity.id)} className="text-slate-300 hover:text-red-500" aria-label="Excluir atividade">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                {studentActivities.length === 0 && <p className="text-sm text-slate-400">Nenhuma atividade atribuída ainda.</p>}
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteActivity(deleteId)}
        title="Excluir atividade"
        description="O aluno não vai mais ver essa atividade."
        confirmLabel="Excluir"
        danger
      />
    </DashboardLayout>
  )
}
