import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { ChatThread } from '../../components/mentorship/ChatThread'
import { useAuthStore } from '../../store/authStore'
import { useCurrentStudent, useDataStore } from '../../store/dataStore'
import { cn } from '../../lib/cn'

export default function StudentDoubts() {
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const sessions = useDataStore((s) => s.mentorSessions)
  const mentors = useDataStore((s) => s.mentors)
  const messages = useDataStore((s) => s.mentorMessages)
  const sendMessage = useDataStore((s) => s.sendMessage)
  const markThreadRead = useDataStore((s) => s.markThreadRead)
  const getMentorById = (id?: string) => mentors.find((m) => m.id === id)

  const [searchParams] = useSearchParams()
  const [clicked, setClicked] = useState<string | null>(null)

  const mentorIds = useMemo(
    () => Array.from(new Set(sessions.filter((s) => s.studentId === student?.id).map((s) => s.mentorId))),
    [sessions, student?.id]
  )

  // Mentor selecionado: clicado > vindo de notificação (?with=) > primeiro da lista.
  const fromLink = searchParams.get('with')
  const selected: string | null = mentorIds.includes(clicked ?? '')
    ? (clicked as string)
    : mentorIds.includes(fromLink ?? '')
      ? (fromLink as string)
      : (mentorIds[0] ?? null)

  useEffect(() => {
    if (student?.id && selected) void markThreadRead(selected, student.id)
  }, [student?.id, selected, markThreadRead])

  if (!student) return null

  const threadFor = (mentorId: string) => messages.filter((m) => m.mentorId === mentorId && m.studentId === student.id)

  const selectedMentor = selected ? getMentorById(selected) : undefined
  const selectedThread = selected ? threadFor(selected) : []

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <PageHeader title="Dúvidas" description="Converse com seus mentores e tire dúvidas fora das sessões agendadas." />

      {mentorIds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-400">
          Agende uma sessão de mentoria para poder conversar com um mentor por aqui.
        </div>
      ) : (
        <Card padding="none" className="flex h-[36rem] overflow-hidden">
          <div className="w-72 shrink-0 overflow-y-auto border-r border-slate-100 dark:border-slate-700/60">
            {mentorIds.map((mentorId) => {
              const mentor = getMentorById(mentorId)
              const thread = threadFor(mentorId)
              const last = thread[thread.length - 1]
              const unread = thread.filter((m) => m.senderId !== student.id && !m.read).length
              return (
                <button
                  key={mentorId}
                  onClick={() => setClicked(mentorId)}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-slate-50 p-3.5 text-left transition-colors dark:border-slate-800',
                    selected === mentorId ? 'bg-primary-50 dark:bg-primary-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  )}
                >
                  <Avatar name={mentor?.name ?? '?'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{mentor?.name}</p>
                    <p className="truncate text-xs text-slate-400">{last ? last.body : 'Nenhuma mensagem ainda'}</p>
                  </div>
                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-cta px-1.5 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex-1">
            {selectedMentor ? (
              <ChatThread
                messages={selectedThread}
                currentUserId={student.id}
                otherName={selectedMentor.name}
                onSend={(body) => sendMessage(selectedMentor.id, student.id, body)}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <EmptyState icon={MessageCircle} title="Selecione um mentor" description="Escolha alguém na lista para ver a conversa." />
              </div>
            )}
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}
