import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'
import type { LoggedUser } from '../../types'
import { fetchStudentById, insertStudentRow } from './queries/students'
import { fetchMentorById, insertMentorRow } from './queries/mentors'
import { fetchCompanyById, insertCompanyAdminRow, insertCompanyRow } from './queries/companies'

interface SignUpOutcome {
  pendingConfirmation: boolean
}

/**
 * Cria a linha de detalhe (students/mentors/companies+company_admins) a partir dos metadados
 * salvos no signUp. É a ÚNICA rotina que insere essas linhas — tanto o fluxo normal (sessão
 * criada na hora) quanto o fluxo de confirmação de e-mail pendente (linha criada no primeiro
 * login pós-confirmação) passam por aqui, evitando duas fontes de verdade.
 */
async function provisionFromMetadata(authUser: User, accountType: string) {
  const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>
  const email = authUser.email ?? ''

  if (accountType === 'student') {
    await insertStudentRow(authUser.id, (meta.name as string) || email, email)
    return
  }
  if (accountType === 'mentor') {
    await insertMentorRow(authUser.id, {
      name: (meta.name as string) || email,
      email,
      bio: (meta.bio as string) || 'Mentor(a) na plataforma SkillBridge.',
      skills: (meta.skills as string[]) ?? [],
    })
    return
  }
  if (accountType === 'company_admin') {
    const companyId = crypto.randomUUID()
    await insertCompanyRow(companyId, {
      name: (meta.company_name as string) || 'Empresa',
      razaoSocial: (meta.razao_social as string) || (meta.company_name as string) || 'Empresa',
      cnpj: (meta.cnpj as string) || '',
      email: (meta.company_email as string) || email,
      sector: (meta.sector as string) || 'Outro',
    })
    await insertCompanyAdminRow(authUser.id, companyId, (meta.name as string) || email, email)
  }
}

/** Resolve uma sessão Supabase Auth para o LoggedUser do app, provisionando a linha de detalhe
 * na primeira vez que faltar (cobre o caso de confirmação de e-mail pendente no cadastro). */
export async function resolveSessionUser(authUser: User): Promise<LoggedUser | null> {
  const { data: profile } = await supabase.from('profiles').select('account_type').eq('id', authUser.id).maybeSingle()
  if (!profile) return null

  if (profile.account_type === 'student') {
    let student = await fetchStudentById(authUser.id)
    if (!student) {
      try {
        await provisionFromMetadata(authUser, 'student')
      } catch {
        /* pode já ter sido provisionado por uma chamada concorrente */
      }
      student = await fetchStudentById(authUser.id)
    }
    return student
  }

  if (profile.account_type === 'mentor') {
    let mentor = await fetchMentorById(authUser.id)
    if (!mentor) {
      try {
        await provisionFromMetadata(authUser, 'mentor')
      } catch {
        /* idem */
      }
      mentor = await fetchMentorById(authUser.id)
    }
    return mentor
  }

  if (profile.account_type === 'company_admin') {
    const { data: admin } = await supabase.from('company_admins').select('company_id').eq('id', authUser.id).maybeSingle()
    let companyId = admin?.company_id as string | undefined
    if (!companyId) {
      try {
        await provisionFromMetadata(authUser, 'company_admin')
      } catch {
        /* idem */
      }
      const { data: admin2 } = await supabase.from('company_admins').select('company_id').eq('id', authUser.id).maybeSingle()
      companyId = admin2?.company_id
    }
    return companyId ? fetchCompanyById(companyId) : null
  }

  return null
}

export async function signIn(email: string, password: string): Promise<LoggedUser | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.user) return null
  return resolveSessionUser(data.user)
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function signUpStudent(name: string, email: string, password: string): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { account_type: 'student', name } } })
  if (error) throw error
  return { pendingConfirmation: !data.session }
}

export async function signUpMentor(name: string, email: string, password: string, bio: string, skills: string[]): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { account_type: 'mentor', name, bio, skills } },
  })
  if (error) throw error
  return { pendingConfirmation: !data.session }
}

export async function signUpCompany(input: {
  cnpj: string
  razaoSocial: string
  name: string
  email: string
  sector: string
  adminName: string
  password: string
}): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        account_type: 'company_admin',
        name: input.adminName,
        company_name: input.name,
        razao_social: input.razaoSocial,
        cnpj: input.cnpj,
        sector: input.sector,
        company_email: input.email,
      },
    },
  })
  if (error) throw error
  return { pendingConfirmation: !data.session }
}
