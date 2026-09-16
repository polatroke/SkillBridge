import { supabase } from '../../supabaseClient'
import type { Student } from '../../../types'

interface StudentRow {
  id: string
  name: string
  email: string
  avatar_url: string | null
  bio: string | null
  company_id: string | null
  program_id: string | null
  study_hours: number
  enrollments?: { course_id: string; status: 'em_andamento' | 'concluido' }[]
  certificates?: { id: string }[]
}

function toStudent(row: StudentRow): Student {
  return {
    id: row.id,
    type: 'student',
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    companyId: row.company_id ?? undefined,
    programId: row.program_id ?? undefined,
    enrolledCourseIds: (row.enrollments ?? []).map((e) => e.course_id),
    completedCourseIds: (row.enrollments ?? []).filter((e) => e.status === 'concluido').map((e) => e.course_id),
    certificateIds: (row.certificates ?? []).map((c) => c.id),
    studyHours: row.study_hours,
  }
}

const SELECT = '*, enrollments(course_id, status), certificates(id)'

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from('students').select(SELECT)
  if (error) throw error
  return (data ?? []).map(toStudent)
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase.from('students').select(SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? toStudent(data) : null
}

export async function insertStudentRow(id: string, name: string, email: string) {
  const { error } = await supabase.from('students').insert({ id, name, email })
  if (error) throw error
}

export async function updateStudentRow(
  id: string,
  patch: Partial<{ companyId: string | null; programId: string | null; bio: string }>
) {
  const fields: Record<string, unknown> = {}
  if (patch.companyId !== undefined) fields.company_id = patch.companyId
  if (patch.programId !== undefined) fields.program_id = patch.programId
  if (patch.bio !== undefined) fields.bio = patch.bio
  if (Object.keys(fields).length === 0) return
  const { error } = await supabase.from('students').update(fields).eq('id', id)
  if (error) throw error
}
