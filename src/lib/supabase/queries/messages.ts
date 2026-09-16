import { supabase } from '../../supabaseClient'
import type { MentorMessage } from '../../../types'

interface MentorMessageRow {
  id: string
  mentor_id: string
  student_id: string
  sender_id: string
  body: string
  read: boolean
  created_at: string
}

function toMessage(row: MentorMessageRow): MentorMessage {
  return {
    id: row.id,
    mentorId: row.mentor_id,
    studentId: row.student_id,
    senderId: row.sender_id,
    body: row.body,
    read: row.read,
    createdAt: row.created_at,
  }
}

export async function fetchMentorMessages(): Promise<MentorMessage[]> {
  const { data, error } = await supabase.from('mentor_messages').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(toMessage)
}

export async function insertMessageRow(mentorId: string, studentId: string, senderId: string, body: string) {
  const { error } = await supabase.from('mentor_messages').insert({ mentor_id: mentorId, student_id: studentId, sender_id: senderId, body })
  if (error) throw error
}

/** Marca como lidas as mensagens da conversa que não foram enviadas por quem está lendo. */
export async function markThreadReadRows(mentorId: string, studentId: string, viewerId: string) {
  const { error } = await supabase
    .from('mentor_messages')
    .update({ read: true })
    .eq('mentor_id', mentorId)
    .eq('student_id', studentId)
    .neq('sender_id', viewerId)
    .eq('read', false)
  if (error) throw error
}
