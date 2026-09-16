import { useMemo, useState } from 'react'
import { Building2, CalendarCheck2, CheckCircle2, ClipboardList, Search, Star } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { useAuthStore } from '../../store/authStore'
import { useDataStore, useCurrentStudent } from '../../store/dataStore'
import { getVisibleMentorsForStudent } from '../../lib/access'
import { formatDateBR, nextDateForWeekday } from '../../lib/date'
import { cn } from '../../lib/cn'
import type { Mentor } from '../../types'

const tabs = [
  { key: 'buscar', label: 'Buscar mentores', icon: Search },
  { key: 'atividades', label: 'Minhas atividades', icon: ClipboardList },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function Mentorship() {
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const mentors = useDataStore((s) => s.mentors)
  const companies = useDataStore((s) => s.companies)
  const activities = useDataStore((s) => s.mentorActivities)
  const updateActivityStatus = useDataStore((s) => s.updateActivityStatus)
  const getCompanyById = (id?: string) => companies.find((c) => c.id === id)
  const getMentorById = (id?: string) => mentors.find((m) => m.id === id)
  const bookSession = useDataStore((s) => s.bookSession)
  const [tab, setTab] = useState<TabKey>('buscar')
  const [search, setSearch] = useState('')
  const [scheduling, setScheduling] = useState<Mentor | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const visibleMentors = useMemo(() => getVisibleMentorsForStudent(mentors, student), [mentors, student])
  const filtered = visibleMentors.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  )

  const openScheduling = (mentor: Mentor) => {
    setScheduling(mentor)
    setSelectedSlot(null)
    setTopic('')
    setConfirmed(false)
  }

  const handleConfirm = () => {
    if (!scheduling || !selectedSlot || !student) return
    bookSession(scheduling.id, student.id, selectedSlot, topic || `Mentoria com ${scheduling.name}`)
    setConfirmed(true)
  }

  if (!student) return null

  const myActivities = activities.filter((a) => a.studentId === student.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <PageHeader
        title="Mentoria"
        description="Agende sessões 1:1 e acompanhe as atividades que seus mentores passaram. Para tirar dúvidas por chat, veja a página Dúvidas."
      />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-700/60">
        {tabs.map((t) => (
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
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'buscar' && (
        <>
          <div className="relative mb-6 max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou especialidade..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((mentor) => {
              const company = getCompanyById(mentor.companyId)
              const availableSlots = mentor.availability.filter((a) => !a.booked)
              return (
                <Card key={mentor.id} hoverable className="flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={mentor.name} size="lg" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{mentor.name}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <Star size={12} className="text-cta" fill="currentColor" /> {mentor.rating || '—'} ({mentor.reviewsCount})
                        </p>
                      </div>
                    </div>
                  </div>

                  {company && (
                    <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-cta-50 px-2.5 py-1 text-xs font-bold text-cta-700">
                      <Building2 size={12} /> Mentor(a) da {company.name}
                    </span>
                  )}

                  <p className="mt-3 line-clamp-3 flex-1 text-sm text-slate-500 dark:text-slate-400">{mentor.bio}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {mentor.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1 text-xs font-semibold text-primary-600">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-4">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{mentor.pricePerSession > 0 ? `R$ ${mentor.pricePerSession}/sessão` : 'Incluso no treinamento'}</span>
                    <Button size="sm" disabled={availableSlots.length === 0} onClick={() => openScheduling(mentor)}>
                      {availableSlots.length === 0 ? 'Sem horários' : 'Agendar'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-400">
              Nenhum mentor encontrado.
            </div>
          )}

          <Modal
            open={!!scheduling}
            onClose={() => setScheduling(null)}
            title={confirmed ? 'Mentoria agendada!' : `Agendar mentoria com ${scheduling?.name}`}
            description={confirmed ? undefined : 'Escolha um horário disponível e conte brevemente o que deseja discutir.'}
            footer={
              !confirmed ? (
                <>
                  <Button variant="ghost" onClick={() => setScheduling(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirm} disabled={!selectedSlot}>
                    Confirmar agendamento
                  </Button>
                </>
              ) : (
                <Button onClick={() => setScheduling(null)}>Fechar</Button>
              )
            }
          >
            {confirmed ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={28} />
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  Sua mentoria com <strong>{scheduling?.name}</strong> foi confirmada. Você pode acompanhar os detalhes no seu Dashboard.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Horários disponíveis</p>
                  <div className="grid grid-cols-2 gap-2">
                    {scheduling?.availability
                      .filter((a) => !a.booked)
                      .map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                            selectedSlot === slot.id ? 'border-primary bg-primary-50 dark:bg-primary-500/10 text-primary-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-200'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 font-semibold">
                            <CalendarCheck2 size={13} /> {slot.weekday}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-400">
                            {formatDateBR(nextDateForWeekday(slot.weekday))} · {slot.start}–{slot.end}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">O que você quer discutir?</span>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: revisão de portfólio, plano de carreira, dúvidas técnicas..."
                    className="min-h-[80px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
                  />
                </label>
              </div>
            )}
          </Modal>
        </>
      )}

      {tab === 'atividades' && (
        <div className="space-y-3">
          {myActivities.map((activity) => {
            const mentor = getMentorById(activity.mentorId)
            return (
              <Card key={activity.id} className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Avatar name={mentor?.name ?? '?'} />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{activity.title}</p>
                    {activity.description && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{activity.description}</p>}
                    <p className="mt-1 text-xs text-slate-400">
                      Passada por {mentor?.name ?? 'seu mentor'}
                      {activity.dueDate && ` · Prazo: ${formatDateBR(activity.dueDate)}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge status={activity.status === 'concluida' ? 'concluido' : 'pendente'} />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateActivityStatus(activity.id, activity.status === 'concluida' ? 'pendente' : 'concluida')}
                  >
                    {activity.status === 'concluida' ? 'Reabrir' : 'Marcar como concluída'}
                  </Button>
                </div>
              </Card>
            )
          })}

          {myActivities.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="Nenhuma atividade por aqui"
              description="Quando um mentor atribuir uma atividade para você, ela aparece nesta lista."
            />
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
