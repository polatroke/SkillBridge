import { supabase } from '../../supabaseClient'
import type { Availability, Mentor } from '../../../types'
import { userError } from '../../errors'

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

/**
 * Vitrine pública (tela inicial, inclusive para visitantes): só as colunas exibidas. O `*` também
 * trazia o e-mail de todos os mentores públicos para qualquer pessoa sem login.
 */
export async function fetchPublicMentors(): Promise<Mentor[]> {
  const { data, error } = await supabase
    .from('mentors')
    .select('id, name, avatar_url, bio, skills, price_per_session, rating, reviews_count, company_id')
    .is('company_id', null)
  if (error) throw error
  return (data ?? []).map((row) => toMentor({ ...row, email: '' }))
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

export async function insertAvailabilityRow(mentorId: string, slot: Pick<Availability, 'weekday' | 'start' | 'end'>) {
  const { error } = await supabase.from('availability').insert({ mentor_id: mentorId, weekday: slot.weekday, start_time: slot.start, end_time: slot.end })
  if (error) throw error
}

/** Só remove horário livre: um horário reservado pertence a uma sessão agendada. */
export async function deleteAvailabilityRow(id: string) {
  const { data, error } = await supabase.from('availability').delete().eq('id', id).eq('booked', false).select('id')
  if (error) throw error
  // Reservado entre o carregamento da tela e o clique: o filtro não apaga nada e antes isso passava como sucesso.
  if (!data?.length) throw userError('Esse horário acabou de ser reservado por um aluno e não pode mais ser removido.')
}
