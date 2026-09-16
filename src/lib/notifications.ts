import type { LoggedUser, Mentor, MentorMessage, Student } from '../types'

/** Mensagens de chat ainda não lidas endereçadas ao usuário logado. */
export function getUnreadMessages(messages: MentorMessage[], user: LoggedUser | null): MentorMessage[] {
  if (!user || user.type === 'company') return []
  return messages.filter((m) => m.senderId !== user.id && !m.read && (m.mentorId === user.id || m.studentId === user.id))
}

/** Nome de quem mandou a mensagem, do ponto de vista de quem está logado. */
export function senderNameFor(message: MentorMessage, user: LoggedUser, mentors: Mentor[], students: Student[]): string {
  if (user.type === 'mentor') return students.find((s) => s.id === message.senderId)?.name ?? 'Aluno'
  return mentors.find((m) => m.id === message.senderId)?.name ?? 'Mentor'
}

/** Rota da conversa de uma mensagem, do ponto de vista de quem está logado. */
export function threadLinkFor(message: MentorMessage, user: LoggedUser): string {
  return user.type === 'mentor' ? `/mentor/duvidas?with=${message.studentId}` : `/aluno/duvidas?with=${message.mentorId}`
}
