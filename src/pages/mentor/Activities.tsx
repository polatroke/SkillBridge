import { useState } from 'react'
import { CalendarDays, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MentorSidebar } from '../../components/layout/MentorSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Field'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { useAuthStore } from '../../store/authStore'
import { useCurrentMentor, useDataStore } from '../../store/dataStore'
import { formatDateBR, formatDateTimeBR } from '../../lib/date'
import type { MentorActivity } from '../../types'

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
  const reviewActivity = useDataStore((s) => s.reviewActivity)
  const getStudentById = (id?: string) => students.find((s) => s.id === id)

  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [reviewing, setReviewing] = useState<MentorActivity | null>(null)
  const [feedback, setFeedback] = useState('')
  const [savingReview, setSavingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

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

  const openReview = (activity: MentorActivity) => {
    setReviewing(activity)
    setFeedback(activity.feedback ?? '')
    setReviewError(null)
  }

  const handleReview = async (status: 'pendente' | 'concluida') => {
    if (!reviewing) return
    setSavingReview(true)
    setReviewError(null)
    try {
      await reviewActivity(reviewing.id, status, feedback)
      setReviewing(null)
    } catch {
      setReviewError('Não foi possível salvar a revisão. Tente novamente.')
    } finally {
      setSavingReview(false)
    }
  }

  return (
    <DashboardLayout sidebar={<MentorSidebar />} profileTitle="Painel do Mentor">
      <PageHeader title="Atividades" description="Atribua tarefas aos seus mentorados, corrija as entregas e acompanhe o que já foi concluído." />

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
                      {activity.submission && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Resposta:</span> {activity.submission}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {activity.status === 'entregue' ? (
                        <Badge status="agendada">Entregue</Badge>
                      ) : (
                        <Badge status={activity.status === 'concluida' ? 'concluido' : 'pendente'} />
                      )}
                      {activity.status === 'entregue' ? (
                        <Button size="sm" onClick={() => openReview(activity)}>
                          Corrigir
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateActivityStatus(activity.id, activity.status === 'concluida' ? 'pendente' : 'concluida')}
                        >
                          {activity.status === 'concluida' ? 'Reabrir' : 'Concluir'}
                        </Button>
                      )}
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

      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title={`Corrigir: ${reviewing?.title ?? ''}`}
        description={reviewing ? `Entrega de ${getStudentById(reviewing.studentId)?.name ?? 'aluno'}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewing(null)}>
              Cancelar
            </Button>
            <Button variant="secondary" disabled={savingReview || !feedback.trim()} onClick={() => handleReview('pendente')}>
              Pedir ajustes
            </Button>
            <Button disabled={savingReview} onClick={() => handleReview('concluida')}>
              Aprovar
            </Button>
          </>
        }
      >
        {reviewing && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-700/60">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Resposta do aluno{reviewing.submittedAt && ` · ${formatDateTimeBR(reviewing.submittedAt)}`}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{reviewing.submission}</p>
              {reviewing.submissionUrl && (
                <a
                  href={reviewing.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 break-all text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300"
                >
                  <ExternalLink size={13} /> {reviewing.submissionUrl}
                </a>
              )}
            </div>
            <Textarea
              label="Comentário para o aluno"
              hint="Obrigatório para pedir ajustes; opcional ao aprovar."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="O que ficou bom e o que pode melhorar..."
            />
            {reviewError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{reviewError}</p>
            )}
          </div>
        )}
      </Modal>

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
