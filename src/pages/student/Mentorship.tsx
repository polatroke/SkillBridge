import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, CalendarCheck2, CalendarClock, CheckCircle2, MessageCircle, Search, Star } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Textarea } from '../../components/ui/Field'
import { useAuthStore } from '../../store/authStore'
import { useDataStore, useCurrentStudent } from '../../store/dataStore'
import { getVisibleMentorsForStudent } from '../../lib/access'
import { formatDateBR, nextDateForWeekday, todayISO } from '../../lib/date'
import { cn } from '../../lib/cn'
import { friendlyError } from '../../lib/errors'
import type { Mentor, MentorSession } from '../../types'

/** Preço exibido no card: mentor de empresa é parte do treinamento; mentor geral sem valor é gratuito. */
function priceLabel(mentor: Mentor) {
  if (mentor.pricePerSession > 0) return `R$ ${mentor.pricePerSession.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/sessão`
  return mentor.companyId ? 'Incluso no treinamento' : 'Gratuito'
}

const tabs = [
  { key: 'buscar', label: 'Buscar mentores', icon: Search },
  { key: 'sessoes', label: 'Minhas sessões', icon: CalendarClock },
] as const

type TabKey = (typeof tabs)[number]['key']

export default function Mentorship() {
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const mentors = useDataStore((s) => s.mentors)
  const companies = useDataStore((s) => s.companies)
  const sessions = useDataStore((s) => s.mentorSessions)
  const getCompanyById = (id?: string) => companies.find((c) => c.id === id)
  const getMentorById = (id?: string) => mentors.find((m) => m.id === id)
  const bookSession = useDataStore((s) => s.bookSession)
  const cancelSession = useDataStore((s) => s.cancelSession)
  const addSessionReview = useDataStore((s) => s.addSessionReview)
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<TabKey>(searchParams.get('aba') === 'sessoes' ? 'sessoes' : 'buscar')
  const [search, setSearch] = useState('')
  const [scheduling, setScheduling] = useState<Mentor | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [booking, setBooking] = useState(false)
  const [bookError, setBookError] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [reviewing, setReviewing] = useState<MentorSession | null>(null)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [savingReview, setSavingReview] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const visibleMentors = useMemo(() => getVisibleMentorsForStudent(mentors, student), [mentors, student])
  const term = search.trim().toLowerCase()
  const filtered = visibleMentors.filter((m) => m.name.toLowerCase().includes(term) || m.skills.some((s) => s.toLowerCase().includes(term)))

  const openScheduling = (mentor: Mentor) => {
    setScheduling(mentor)
    setSelectedSlot(null)
    setTopic('')
    setConfirmed(false)
    setBookError(null)
  }

  const handleConfirm = async () => {
    if (!scheduling || !selectedSlot || !student) return
    setBooking(true)
    setBookError(null)
    try {
      await bookSession(scheduling.id, student.id, selectedSlot, topic.trim() || `Mentoria com ${scheduling.name}`)
      setConfirmed(true)
    } catch (err) {
      setSelectedSlot(null)
      setBookError(friendlyError(err, 'Não foi possível agendar: o horário pode ter acabado de ser reservado. Escolha outro e tente novamente.'))
    } finally {
      setBooking(false)
    }
  }

  const handleCancel = async (sessionId: string) => {
    setSessionError(null)
    try {
      await cancelSession(sessionId)
    } catch (err) {
      setSessionError(friendlyError(err, 'Não foi possível cancelar a mentoria. Tente novamente.'))
    }
  }

  const openReview = (session: MentorSession) => {
    setReviewing(session)
    setRating(0)
    setReview('')
    setSessionError(null)
  }

  const handleReview = async () => {
    if (!reviewing || rating === 0) return
    setSavingReview(true)
    setSessionError(null)
    try {
      await addSessionReview(reviewing.id, rating, review.trim())
      setReviewing(null)
    } catch (err) {
      setSessionError(friendlyError(err, 'Não foi possível enviar sua avaliação. Tente novamente.'))
    } finally {
      setSavingReview(false)
    }
  }

  if (!student) return null

  const today = todayISO()
  const mySessions = sessions.filter((s) => s.studentId === student.id)
  const upcoming = mySessions
    .filter((s) => s.status === 'agendada' && s.date >= today)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
  // Já passou da data (ou foi concluída) e ainda não tem nota: o aluno avalia, e isso marca a sessão como realizada.
  const toReview = mySessions
    .filter((s) => !s.rating && ((s.status === 'agendada' && s.date < today) || s.status === 'concluida'))
    .sort((a, b) => b.date.localeCompare(a.date))
  const history = mySessions
    .filter((s) => (s.status === 'concluida' && !!s.rating) || s.status === 'cancelada')
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <PageHeader
        title="Mentoria"
        description="Agende sessões 1:1 com mentores e acompanhe suas mentorias. Para tirar dúvidas por chat, veja a página Dúvidas."
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
            {t.key === 'sessoes' && upcoming.length + toReview.length > 0 && (
              <span className="rounded-full bg-cta px-1.5 text-[11px] text-white">{upcoming.length + toReview.length}</span>
            )}
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
              aria-label="Buscar mentores"
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
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{priceLabel(mentor)}</span>
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
                  <Button onClick={handleConfirm} disabled={!selectedSlot || booking}>
                    {booking ? 'Agendando...' : 'Confirmar agendamento'}
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
                  Sua mentoria com <strong>{scheduling?.name}</strong> foi confirmada. Você pode acompanhar os detalhes na aba Minhas sessões.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Horários disponíveis</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {scheduling?.availability
                      .filter((a) => !a.booked)
                      .map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          aria-pressed={selectedSlot === slot.id}
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
                {bookError && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{bookError}</p>
                )}
              </div>
            )}
          </Modal>
        </>
      )}

      {tab === 'sessoes' && (
        <div className="space-y-8">
          {sessionError && !reviewing && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{sessionError}</p>
          )}

          <section>
            <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-50">Próximas mentorias</h2>
            <div className="space-y-3">
              {upcoming.map((session) => {
                const mentor = getMentorById(session.mentorId)
                return (
                  <Card key={session.id} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <Avatar name={mentor?.name ?? '?'} />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{mentor?.name ?? 'Mentor'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{session.topic}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-300">
                          <CalendarClock size={13} /> {formatDateBR(session.date)} · {session.start}–{session.end}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ButtonLink to={`/aluno/duvidas?with=${session.mentorId}`} size="sm" variant="secondary" icon={<MessageCircle size={14} />}>
                          Mensagem
                        </ButtonLink>
                      <Button size="sm" variant="danger" onClick={() => setCancelId(session.id)}>
                        Cancelar
                      </Button>
                    </div>
                  </Card>
                )
              })}
              {upcoming.length === 0 && (
                <EmptyState
                  icon={CalendarClock}
                  title="Nenhuma mentoria agendada"
                  description="Escolha um mentor e um horário disponível para agendar sua próxima sessão."
                  action={
                    <Button size="sm" onClick={() => setTab('buscar')}>
                      Buscar mentores
                    </Button>
                  }
                />
              )}
            </div>
          </section>

          {toReview.length > 0 && (
            <section>
              <h2 className="mb-1 text-lg font-bold text-slate-900 dark:text-slate-50">Avalie suas mentorias</h2>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                Sua avaliação confirma que a sessão aconteceu e ajuda outros alunos a escolher mentores.
              </p>
              <div className="space-y-3">
                {toReview.map((session) => {
                  const mentor = getMentorById(session.mentorId)
                  return (
                    <Card key={session.id} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <Avatar name={mentor?.name ?? '?'} />
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{mentor?.name ?? 'Mentor'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{session.topic}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDateBR(session.date)} · {session.start}–{session.end}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" icon={<Star size={14} />} onClick={() => openReview(session)}>
                        Avaliar
                      </Button>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-50">Histórico</h2>
              <Card padding="none" className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {history.map((session) => {
                  const mentor = getMentorById(session.mentorId)
                  return (
                    <div key={session.id} className="flex flex-col justify-between gap-2 px-5 py-4 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {session.topic} <span className="font-normal text-slate-400">com {mentor?.name ?? 'Mentor'}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatDateBR(session.date)} · {session.start}–{session.end}
                        </p>
                        {session.review && <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">“{session.review}”</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {!!session.rating && (
                          <span className="flex items-center gap-0.5" aria-label={`Nota ${session.rating} de 5`}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                size={13}
                                className={n <= session.rating! ? 'text-cta' : 'text-slate-200 dark:text-slate-600'}
                                fill="currentColor"
                              />
                            ))}
                          </span>
                        )}
                        <Badge status={session.status === 'cancelada' ? 'cancelada' : 'concluido'}>
                          {session.status === 'cancelada' ? 'Cancelada' : 'Realizada'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </Card>
            </section>
          )}

          <ConfirmDialog
            open={!!cancelId}
            onClose={() => setCancelId(null)}
            onConfirm={async () => {
              if (cancelId) await handleCancel(cancelId)
            }}
            title="Cancelar mentoria"
            description="O horário volta a ficar disponível na agenda do mentor."
            confirmLabel="Cancelar mentoria"
            danger
          />

          <Modal
            open={!!reviewing}
            onClose={() => setReviewing(null)}
            title="Avaliar mentoria"
            description={reviewing ? `${reviewing.topic} com ${getMentorById(reviewing.mentorId)?.name ?? 'seu mentor'}` : undefined}
            size="sm"
            footer={
              <>
                <Button variant="ghost" onClick={() => setReviewing(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleReview} disabled={rating === 0 || savingReview}>
                  {savingReview ? 'Enviando...' : 'Enviar avaliação'}
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Como foi a sessão?</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} estrela${n > 1 ? 's' : ''}`} aria-pressed={rating === n}>
                      <Star size={28} className={n <= rating ? 'text-cta' : 'text-slate-200 dark:text-slate-600'} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                label="Comentário (opcional)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="O que foi mais útil? O que poderia melhorar?"
              />
              {sessionError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{sessionError}</p>
              )}
            </div>
          </Modal>
        </div>
      )}
    </DashboardLayout>
  )
}
