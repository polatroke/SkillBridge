import { supabase } from '../../supabaseClient'
import type { Course, Module } from '../../../types'

interface ModuleRow {
  id: string
  title: string
  duration: string
  lessons: string[]
  position: number
}

interface CourseRow {
  id: string
  title: string
  summary: string
  category: string
  total_hours: number
  instructor: string
  instructor_mentor_id: string | null
  cover_url: string
  status: Course['status']
  company_id: string | null
  enrolled_count: number
  rating: number
  modules?: ModuleRow[]
  course_programs?: { program_id: string }[]
}

function toCourse(row: CourseRow): Course {
  const modules: Module[] = [...(row.modules ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((m) => ({ id: m.id, title: m.title, duration: m.duration, lessons: m.lessons ?? [] }))
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    category: row.category,
    totalHours: row.total_hours,
    modules,
    instructor: row.instructor,
    instructorMentorId: row.instructor_mentor_id ?? undefined,
    coverUrl: row.cover_url,
    status: row.status,
    companyId: row.company_id ?? undefined,
    programIds: (row.course_programs ?? []).map((cp) => cp.program_id),
    enrolledCount: row.enrolled_count,
    rating: row.rating,
  }
}

const SELECT = '*, modules(*), course_programs(program_id)'

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from('courses').select(SELECT)
  if (error) throw error
  return (data ?? []).map(toCourse)
}

export async function insertCourseRow(input: Omit<Course, 'id' | 'enrolledCount' | 'rating'>) {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: input.title,
      summary: input.summary,
      category: input.category,
      total_hours: input.totalHours,
      instructor: input.instructor,
      instructor_mentor_id: input.instructorMentorId ?? null,
      cover_url: input.coverUrl,
      status: input.status,
      company_id: input.companyId ?? null,
    })
    .select()
    .single()
  if (error) throw error
  const courseId = data.id as string
  if (input.modules.length) {
    const { error: modErr } = await supabase
      .from('modules')
      .insert(input.modules.map((m, i) => ({ course_id: courseId, title: m.title, duration: m.duration, lessons: m.lessons, position: i })))
    if (modErr) throw modErr
  }
  if (input.programIds.length) {
    const { error: cpErr } = await supabase.from('course_programs').insert(input.programIds.map((pid) => ({ course_id: courseId, program_id: pid })))
    if (cpErr) throw cpErr
  }
}

export async function updateCourseRow(id: string, patch: Partial<Course>) {
  const fields: Record<string, unknown> = {}
  if (patch.title !== undefined) fields.title = patch.title
  if (patch.summary !== undefined) fields.summary = patch.summary
  if (patch.category !== undefined) fields.category = patch.category
  if (patch.totalHours !== undefined) fields.total_hours = patch.totalHours
  if (patch.instructor !== undefined) fields.instructor = patch.instructor
  if (patch.instructorMentorId !== undefined) fields.instructor_mentor_id = patch.instructorMentorId ?? null
  if (patch.coverUrl !== undefined) fields.cover_url = patch.coverUrl
  if (patch.status !== undefined) fields.status = patch.status
  if (patch.companyId !== undefined) fields.company_id = patch.companyId ?? null
  if (Object.keys(fields).length) {
    const { error } = await supabase.from('courses').update(fields).eq('id', id)
    if (error) throw error
  }
  if (patch.modules) {
    await supabase.from('modules').delete().eq('course_id', id)
    if (patch.modules.length) {
      const { error } = await supabase
        .from('modules')
        .insert(patch.modules.map((m, i) => ({ course_id: id, title: m.title, duration: m.duration, lessons: m.lessons, position: i })))
      if (error) throw error
    }
  }
  if (patch.programIds) {
    await supabase.from('course_programs').delete().eq('course_id', id)
    if (patch.programIds.length) {
      const { error } = await supabase.from('course_programs').insert(patch.programIds.map((pid) => ({ course_id: id, program_id: pid })))
      if (error) throw error
    }
  }
}

export async function deleteCourseRow(id: string) {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}
