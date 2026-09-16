import { supabase } from '../../supabaseClient'
import type { Program } from '../../../types'

interface ProgramRow {
  id: string
  company_id: string
  name: string
  start_date: string
  end_date: string
  description: string | null
  course_programs?: { course_id: string }[]
  mentor_programs?: { mentor_id: string }[]
  students?: { id: string }[]
}

function toProgram(row: ProgramRow): Program {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description ?? undefined,
    courseIds: (row.course_programs ?? []).map((cp) => cp.course_id),
    mentorIds: (row.mentor_programs ?? []).map((mp) => mp.mentor_id),
    studentIds: (row.students ?? []).map((s) => s.id),
  }
}

const SELECT = '*, course_programs(course_id), mentor_programs(mentor_id), students(id)'

export async function fetchPrograms(): Promise<Program[]> {
  const { data, error } = await supabase.from('programs').select(SELECT)
  if (error) throw error
  return (data ?? []).map(toProgram)
}

export async function insertProgramRow(input: Omit<Program, 'id'>): Promise<string> {
  const { data, error } = await supabase
    .from('programs')
    .insert({
      company_id: input.companyId,
      name: input.name,
      start_date: input.startDate,
      end_date: input.endDate,
      description: input.description ?? null,
    })
    .select()
    .single()
  if (error) throw error
  const programId = data.id as string
  if (input.courseIds.length) {
    await supabase.from('course_programs').insert(input.courseIds.map((cid) => ({ course_id: cid, program_id: programId })))
  }
  if (input.mentorIds.length) {
    await supabase.from('mentor_programs').insert(input.mentorIds.map((mid) => ({ mentor_id: mid, program_id: programId })))
  }
  if (input.studentIds.length) {
    await supabase.from('students').update({ company_id: input.companyId, program_id: programId }).in('id', input.studentIds)
  }
  return programId
}

export async function updateProgramRow(id: string, patch: Partial<Program>) {
  const fields: Record<string, unknown> = {}
  if (patch.name !== undefined) fields.name = patch.name
  if (patch.startDate !== undefined) fields.start_date = patch.startDate
  if (patch.endDate !== undefined) fields.end_date = patch.endDate
  if (patch.description !== undefined) fields.description = patch.description ?? null
  if (Object.keys(fields).length) {
    const { error } = await supabase.from('programs').update(fields).eq('id', id)
    if (error) throw error
  }
  if (patch.courseIds) {
    await supabase.from('course_programs').delete().eq('program_id', id)
    if (patch.courseIds.length) await supabase.from('course_programs').insert(patch.courseIds.map((cid) => ({ course_id: cid, program_id: id })))
  }
  if (patch.mentorIds) {
    await supabase.from('mentor_programs').delete().eq('program_id', id)
    if (patch.mentorIds.length) await supabase.from('mentor_programs').insert(patch.mentorIds.map((mid) => ({ mentor_id: mid, program_id: id })))
  }
}

/** Replace the full set of students linked to a program (mirrors the old mock's setProgramStudents). */
export async function setProgramStudentsRows(programId: string, companyId: string, studentIds: string[]) {
  await supabase.from('students').update({ company_id: null, program_id: null }).eq('program_id', programId)
  if (studentIds.length) {
    const { error } = await supabase.from('students').update({ company_id: companyId, program_id: programId }).in('id', studentIds)
    if (error) throw error
  }
}
