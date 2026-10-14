import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, ExternalLink, MessageCircle, Send } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input, Textarea } from '../../components/ui/Field'
import { useAuthStore } from '../../store/authStore'
import { useCurrentStudent, useDataStore } from '../../store/dataStore'
import { formatDateBR, formatDateTimeBR, todayISO } from '../../lib/date'
import { cn } from '../../lib/cn'
import type { MentorActivity } from '../../types'

const tabs = [
  { key: 'pendente', label: 'A fazer', empty: 'Nenhuma atividade para resolver agora.' },
  { key: 'entregue', label: 'Em correção', empty: 'Nenhuma entrega aguardando correção do mentor.' },
  { key: 'concluida', label: 'Concluídas', empty: 'Nenhuma atividade aprovada ainda.' },
] as const

export default function StudentActivities() {
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const activities = useDataStore((s) => s.mentorActivities)
  const mentors = useDataStore((s) => s.mentors)
  const submitActivity = useDataStore((s) => s.submitActivity)
  const getMentorById = (id?: string) => mentors.find((m) => m.id === id)
  const [tab, setTab] = useState<MentorActivity['status']>('pendente')
  const [solving, setSolving] = useState<MentorActivity | null>(null)
  const [answer, setAnswer] = useState('')
  const [url, setUrl] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!student) return null

  const today = todayISO()
  const myActivities = activities.filter((a) => a.studentId === student.id)
  const visible = myActivities
    .filter((a) => a.status === tab)
    .sort((a, b) =>
      tab === 'pendente'
        ? (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31')
        : (b.submittedAt ?? b.createdAt).localeCompare(a.submittedAt ?? a.createdAt)
    )

  const openSolve = (activity: MentorActivity) => {
    setSolving(activity)
    setAnswer(activity.submission ?? '')
    setUrl(activity.submissionUrl ?? '')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!solving || !answer.trim()) return
    setSending(true)
    setError(null)
    try {
      await submitActivity(solving.id, answer.trim(), url.trim() || undefined)
      setSolving(null)
      setTab('entregue')
    } catch {
      setError('Não foi possível enviar sua resposta. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <PageHeader title="Atividades" description="Resolva as atividades que seus mentores passaram e acompanhe a correção de cada entrega." />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-700/60">
        {tabs.map((t) => {
          const count = myActivities.filter((a) => a.status === t.key).length
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 pb-3 text-sm font-semibold transition-colors',
                tab === t.key
                  ? 'border-primary text-primary-700 dark:text-primary-300'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              {t.label}
              <span className="rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-500 dark:bg-slate-700/60 dark:text-slate-400">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-4">
        {visible.map((activity) => {
          const mentor = getMentorById(activity.mentorId)
          const overdue = activity.status === 'pendente' && !!activity.dueDate && activity.dueDate < today
          return (
            <Card key={activity.id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{activity.title}</h3>
                    {activity.status === 'pendente' && <Badge status="pendente">A fazer</Badge>}
                    {activity.status === 'entregue' && <Badge status="agendada">Em correção</Badge>}
                    {activity.status === 'concluida' && <Badge status="aprovado">Aprovada</Badge>}
                    {overdue && <Badge status="recusado">Atrasada</Badge>}
                  </div>
                  {activity.description && (
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">{activity.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Avatar name={mentor?.name ?? '?'} size="sm" className="h-5 w-5 text-[9px]" /> Passada por {mentor?.name ?? 'seu mentor'}
                    </span>
                    {activity.dueDate && (
                      <span className={cn('flex items-center gap-1', overdue && 'font-semibold text-red-500')}>
                        <CalendarDays size={12} /> Prazo: {formatDateBR(activity.dueDate)}
                      </span>
                    )}
                    <Link to={`/aluno/duvidas?with=${activity.mentorId}`} className="flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300">
                      <MessageCircle size={12} /> Tirar dúvida
                    </Link>
                  </div>
                </div>

                {activity.status !== 'concluida' && (
                  <Button
                    size="sm"
                    variant={activity.status === 'pendente' ? 'primary' : 'secondary'}
                    icon={<Send size={14} />}
                    onClick={() => openSolve(activity)}
                    className="shrink-0"
                  >
                    {activity.status === 'entregue' ? 'Editar resposta' : activity.submission ? 'Reenviar resposta' : 'Resolver'}
                  </Button>
                )}
              </div>

              {activity.feedback && (
                <div
                  className={cn(
                    'mt-4 rounded-xl px-4 py-3 text-sm',
                    activity.status === 'concluida'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200'
                  )}
                >
                  <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                    {activity.status === 'concluida' ? 'Comentário do mentor' : 'Ajustes pedidos pelo mentor'}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{activity.feedback}</p>
                </div>
              )}

              {activity.submission && (
                <div className="mt-4 rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-700/60">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Sua resposta{activity.submittedAt && ` · enviada em ${formatDateTimeBR(activity.submittedAt)}`}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{activity.submission}</p>
                  {activity.submissionUrl && (
                    <a
                      href={activity.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 break-all text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300"
                    >
                      <ExternalLink size={13} /> {activity.submissionUrl}
                    </a>
                  )}
                </div>
              )}
            </Card>
          )
        })}

        {visible.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title={tabs.find((t) => t.key === tab)!.empty}
            description="Quando um mentor atribuir uma atividade para você, ela aparece aqui. Agende uma mentoria para começar."
            action={
              <Link to="/aluno/mentoria">
                <Button variant="secondary" size="sm">
                  Ir para Mentoria
                </Button>
              </Link>
            }
          />
        )}
      </div>

      <Modal
        open={!!solving}
        onClose={() => setSolving(null)}
        title={solving?.title ?? ''}
        description={solving?.description}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSolving(null)}>
              Cancelar
            </Button>
            <Button type="submit" form="solve-activity" icon={<Send size={15} />} disabled={sending || !answer.trim()}>
              {sending ? 'Enviando...' : 'Enviar para o mentor'}
            </Button>
          </>
        }
      >
        <form id="solve-activity" onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Sua resposta"
            required
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Descreva sua solução, o que você fez e o que aprendeu..."
            className="min-h-[180px]"
          />
          <Input
            label="Link da entrega (opcional)"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/... ou link do Figma, Drive, etc."
            hint="Repositório, protótipo ou documento com o seu trabalho."
          />
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
        </form>
      </Modal>
    </DashboardLayout>
  )
}
