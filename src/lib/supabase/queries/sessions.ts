import { supabase } from '../../supabaseClient'
import type { ActivityItem, Certificate, MentorSession } from '../../../types'

interface SessionRow {
  id: string
  mentor_id: string
  student_id: string
  date: string
  start_time: string
  end_time: string
  status: MentorSession['status']
  topic: string
  rating: number | null
  review: string | null
  mentor_session_notes?: { notes: string }[]
}

function toSession(row: SessionRow): MentorSession {
  return {
    id: row.id,
    mentorId: row.mentor_id,
    studentId: row.student_id,
    date: row.date,
    start: row.start_time.slice(0, 5),
    end: row.end_time.slice(0, 5),
    status: row.status,
    topic: row.topic,
    rating: row.rating ?? undefined,
    review: row.review ?? undefined,
    notes: row.mentor_session_notes?.[0]?.notes ?? undefined,
  }
}

export async function fetchMentorSessions(): Promise<MentorSession[]> {
  const { data, error } = await supabase.from('mentor_sessions').select('*, mentor_session_notes(notes)')
  if (error) throw error
  return (data ?? []).map(toSession)
}

export async function updateMentorSessionRow(id: string, patch: Partial<{ status: MentorSession['status']; rating: number; review: string }>) {
  const fields: Record<string, unknown> = {}
  if (patch.status !== undefined) fields.status = patch.status
  if (patch.rating !== undefined) fields.rating = patch.rating
  if (patch.review !== undefined) fields.review = patch.review
  if (Object.keys(fields).length === 0) return
  const { error } = await supabase.from('mentor_sessions').update(fields).eq('id', id)
  if (error) throw error
}

export async function upsertMentorSessionNotes(sessionId: string, mentorId: string, notes: string) {
  const { error } = await supabase
    .from('mentor_session_notes')
    .upsert({ session_id: sessionId, mentor_id: mentorId, notes, updated_at: new Date().toISOString() })
  if (error) throw error
}

interface CertificateRow {
  id: string
  student_id: string
  course_id: string
  issued_at: string
}

function toCertificate(row: CertificateRow): Certificate {
  return { id: row.id, studentId: row.student_id, courseId: row.course_id, issuedAt: row.issued_at.slice(0, 10) }
}

export async function fetchCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase.from('certificates').select('*')
  if (error) throw error
  return (data ?? []).map(toCertificate)
}

interface ActivityRow {
  id: string
  student_id: string
  type: ActivityItem['type']
  description: string
  date: string
}

function toActivity(row: ActivityRow): ActivityItem {
  return { id: row.id, studentId: row.student_id, type: row.type, description: row.description, date: row.date }
}

export async function fetchActivityItems(): Promise<ActivityItem[]> {
  const { data, error } = await supabase.from('activity_items').select('*')
  if (error) throw error
  return (data ?? []).map(toActivity)
}
