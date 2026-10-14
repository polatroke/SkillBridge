import { supabase } from '../../supabaseClient'
import type { MentorActivity } from '../../../types'

interface MentorActivityRow {
  id: string
  mentor_id: string
  student_id: string
  title: string
  description: string | null
  due_date: string | null
  status: MentorActivity['status']
  created_at: string
  submission: string | null
  submission_url: string | null
  submitted_at: string | null
  feedback: string | null
  reviewed_at: string | null
}

function toActivity(row: MentorActivityRow): MentorActivity {
  return {
    id: row.id,
    mentorId: row.mentor_id,
    studentId: row.student_id,
    title: row.title,
    description: row.description ?? undefined,
    dueDate: row.due_date ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    submission: row.submission ?? undefined,
    submissionUrl: row.submission_url ?? undefined,
    submittedAt: row.submitted_at ?? undefined,
    feedback: row.feedback ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
  }
}

export async function fetchMentorActivities(): Promise<MentorActivity[]> {
  const { data, error } = await supabase.from('mentor_activities').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toActivity)
}

export async function insertActivityRow(input: { mentorId: string; studentId: string; title: string; description?: string; dueDate?: string }) {
  const { error } = await supabase.from('mentor_activities').insert({
    mentor_id: input.mentorId,
    student_id: input.studentId,
    title: input.title,
    description: input.description || null,
    due_date: input.dueDate || null,
  })
  if (error) throw error
}

export async function updateActivityStatusRow(id: string, status: MentorActivity['status']) {
  const { error } = await supabase.from('mentor_activities').update({ status }).eq('id', id)
  if (error) throw error
}

/** Revisão do mentor: aprovar (concluida) ou pedir ajustes (pendente), com comentário opcional. */
export async function reviewActivityRow(id: string, status: Extract<MentorActivity['status'], 'pendente' | 'concluida'>, feedback?: string) {
  const { error } = await supabase
    .from('mentor_activities')
    .update({ status, feedback: feedback?.trim() || null, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteActivityRow(id: string) {
  const { error } = await supabase.from('mentor_activities').delete().eq('id', id)
  if (error) throw error
}
