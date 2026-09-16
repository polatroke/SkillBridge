import { supabase } from '../../supabaseClient'
import type { EnrollmentRequest, MentorInvite } from '../../../types'

interface RequestRow {
  id: string
  student_id: string
  company_id: string
  program_id: string
  status: EnrollmentRequest['status']
  requested_at: string
}

function toRequest(row: RequestRow): EnrollmentRequest {
  return {
    id: row.id,
    studentId: row.student_id,
    companyId: row.company_id,
    programId: row.program_id,
    status: row.status,
    requestedAt: row.requested_at.slice(0, 10),
  }
}

export async function fetchEnrollmentRequests(): Promise<EnrollmentRequest[]> {
  const { data, error } = await supabase.from('enrollment_requests').select('*')
  if (error) throw error
  return (data ?? []).map(toRequest)
}

export async function updateEnrollmentRequestStatus(id: string, status: EnrollmentRequest['status']) {
  const { error } = await supabase.from('enrollment_requests').update({ status }).eq('id', id)
  if (error) throw error
}

interface InviteRow {
  id: string
  company_id: string
  name: string
  email: string
  status: MentorInvite['status']
  invited_at: string
}

function toInvite(row: InviteRow): MentorInvite {
  return { id: row.id, companyId: row.company_id, name: row.name, email: row.email, status: row.status, invitedAt: row.invited_at.slice(0, 10) }
}

export async function fetchMentorInvites(): Promise<MentorInvite[]> {
  const { data, error } = await supabase.from('mentor_invites').select('*')
  if (error) throw error
  return (data ?? []).map(toInvite)
}

export async function insertMentorInviteRow(companyId: string, name: string, email: string) {
  const { error } = await supabase.from('mentor_invites').insert({ company_id: companyId, name, email })
  if (error) throw error
}

export async function touchMentorInviteRow(id: string) {
  const { error } = await supabase.from('mentor_invites').update({ invited_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function deleteMentorInviteRow(id: string) {
  const { error } = await supabase.from('mentor_invites').delete().eq('id', id)
  if (error) throw error
}
