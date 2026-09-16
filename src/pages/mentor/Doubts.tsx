import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MentorSidebar } from '../../components/layout/MentorSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { ChatThread } from '../../components/mentorship/ChatThread'
import { useAuthStore } from '../../store/authStore'
import { useCurrentMentor, useDataStore } from '../../store/dataStore'
import { cn } from '../../lib/cn'
import { MessageCircle } from 'lucide-react'

export default function MentorDoubts() {
  const authUser = useAuthStore((s) => s.user)
  const mentor = useCurrentMentor(authUser?.id)
  const sessions = useDataStore((s) => s.mentorSessions)
  const students = useDataStore((s) => s.students)
  const messages = useDataStore((s) => s.mentorMessages)
  const sendMessage = useDataStore((s) => s.sendMessage)
  const markThreadRead = useDataStore((s) => s.markThreadRead)
  const getStudentById = (id?: string) => students.find((s) => s.id === id)

  const [searchParams] = useSearchParams()
  const [clicked, setClicked] = useState<string | null>(null)

  const studentIds = useMemo(
    () => Array.from(new Set(sessions.filter((s) => s.mentorId === mentor?.id).map((s) => s.studentId))),
    [sessions, mentor?.id]
  )

  // Mentorado selecionado: clicado > vindo de notificação (?with=) > primeiro da lista.
  const fromLink = searchParams.get('with')
  const selected: string | null = studentIds.includes(clicked ?? '')
    ? (clicked as string)
    : studentIds.includes(fromLink ?? '')
      ? (fromLink as string)
      : (studentIds[0] ?? null)

  useEffect(() => {
    if (mentor?.id && selected) void markThreadRead(mentor.id, selected)
  }, [mentor?.id, selected, markThreadRead])

  if (!mentor) return null

  const threadFor = (studentId: string) => messages.filter((m) => m.mentorId === mentor.id && m.studentId === studentId)

  const selectedStudent = selected ? getStudentById(selected) : undefined
  const selectedThread = selected ? threadFor(selected) : []

  return (
    <DashboardLayout sidebar={<MentorSidebar />} profileTitle="Painel do Mentor">
      <PageHeader title="Dúvidas" description="Converse com seus mentorados e tire as dúvidas deles fora das sessões agendadas." />

      {studentIds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-400">
          Você ainda não tem alunos mentorados. Assim que uma sessão for agendada, o aluno aparece aqui.
        </div>
      ) : (
        <Card padding="none" className="flex h-[36rem] overflow-hidden">
          <div className="w-72 shrink-0 overflow-y-auto border-r border-slate-100 dark:border-slate-700/60">
            {studentIds.map((studentId) => {
              const student = getStudentById(studentId)
              const thread = threadFor(studentId)
              const last = thread[thread.length - 1]
              const unread = thread.filter((m) => m.senderId !== mentor.id && !m.read).length
              return (
                <button
                  key={studentId}
                  onClick={() => setClicked(studentId)}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-slate-50 p-3.5 text-left transition-colors dark:border-slate-800',
                    selected === studentId ? 'bg-primary-50 dark:bg-primary-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  )}
                >
                  <Avatar name={student?.name ?? '?'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{student?.name}</p>
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
            {selectedStudent ? (
              <ChatThread
                messages={selectedThread}
                currentUserId={mentor.id}
                otherName={selectedStudent.name}
                onSend={(body) => sendMessage(mentor.id, selectedStudent.id, body)}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <EmptyState icon={MessageCircle} title="Selecione um mentorado" description="Escolha alguém na lista para ver a conversa." />
              </div>
            )}
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}
