import { supabase } from '../../supabaseClient'
import type { Availability, Mentor } from '../../../types'

interface MentorRow {
  id: string
  name: string
  email: string
  avatar_url: string | null
  bio: string
  skills: string[]
  price_per_session: number | null
  rating: number
  reviews_count: number
  company_id: string | null
  mentor_programs?: { program_id: string }[]
  availability?: { id: string; weekday: Availability['weekday']; start_time: string; end_time: string; booked: boolean }[]
}

function toMentor(row: MentorRow): Mentor {
  return {
    id: row.id,
    type: 'mentor',
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio,
    skills: row.skills ?? [],
    pricePerSession: row.price_per_session ?? 0,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    companyId: row.company_id ?? undefined,
    programIds: (row.mentor_programs ?? []).map((mp) => mp.program_id),
    availability: (row.availability ?? []).map((a) => ({
      id: a.id,
      weekday: a.weekday,
      start: a.start_time.slice(0, 5),
      end: a.end_time.slice(0, 5),
      booked: a.booked,
    })),
  }
}

const SELECT = '*, mentor_programs(program_id), availability(*)'

export async function fetchMentors(): Promise<Mentor[]> {
  const { data, error } = await supabase.from('mentors').select(SELECT)
  if (error) throw error
  return (data ?? []).map(toMentor)
}

export async function fetchMentorById(id: string): Promise<Mentor | null> {
  const { data, error } = await supabase.from('mentors').select(SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? toMentor(data) : null
}

export async function insertMentorRow(
  id: string,
  input: { name: string; email: string; bio: string; skills: string[]; companyId?: string; pricePerSession?: number }
) {
  const { error } = await supabase.from('mentors').insert({
    id,
    name: input.name,
    email: input.email,
    bio: input.bio,
    skills: input.skills,
    company_id: input.companyId ?? null,
    price_per_session: input.pricePerSession ?? 0,
  })
  if (error) throw error
}

export async function updateMentorRow(
  id: string,
  patch: Partial<{ bio: string; skills: string[]; pricePerSession: number; companyId: string | null }>
) {
  const fields: Record<string, unknown> = {}
  if (patch.bio !== undefined) fields.bio = patch.bio
  if (patch.skills !== undefined) fields.skills = patch.skills
  if (patch.pricePerSession !== undefined) fields.price_per_session = patch.pricePerSession
  if (patch.companyId !== undefined) fields.company_id = patch.companyId
  if (Object.keys(fields).length === 0) return
  const { error } = await supabase.from('mentors').update(fields).eq('id', id)
  if (error) throw error
}

export async function deleteMentorRow(id: string) {
  const { error } = await supabase.from('mentors').delete().eq('id', id)
  if (error) throw error
}

export async function setMentorProgramsRows(mentorId: string, programIds: string[]) {
  await supabase.from('mentor_programs').delete().eq('mentor_id', mentorId)
  if (programIds.length === 0) return
  const { error } = await supabase.from('mentor_programs').insert(programIds.map((pid) => ({ mentor_id: mentorId, program_id: pid })))
  if (error) throw error
}

export async function replaceMentorAvailabilityRows(mentorId: string, slots: Availability[]) {
  await supabase.from('availability').delete().eq('mentor_id', mentorId)
  if (slots.length === 0) return
  const { error } = await supabase.from('availability').insert(
    slots.map((s) => ({ mentor_id: mentorId, weekday: s.weekday, start_time: s.start, end_time: s.end, booked: s.booked ?? false }))
  )
  if (error) throw error
}
