import type { AuthError, User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'
import type { AccountType, LoggedUser } from '../../types'
import { fetchStudentById, insertStudentRow } from './queries/students'
import { fetchMentorById, insertMentorRow } from './queries/mentors'
import { fetchCompanyById, insertCompanyAdminRow, insertCompanyRow } from './queries/companies'
import { acceptMentorInvites } from './rpc'
import { friendlyError, userError } from '../errors'

interface SignUpOutcome {
  pendingConfirmation: boolean
}

/**
 * Falha ao criar a linha de detalhe no primeiro acesso. Guardada para o login explicar o motivo
 * (ex: CNPJ já cadastrado por outra empresa) em vez de responder "e-mail ou senha inválidos".
 */
let lastProvisionError: unknown = null

const accountTypeLabels: Record<AccountType, string> = { student: 'Aluno', mentor: 'Mentor', company: 'Empresa' }

/** Valor de profiles.account_type / user_metadata.account_type para cada tipo de conta do app. */
const metadataAccountType: Record<AccountType, string> = { student: 'student', mentor: 'mentor', company: 'company_admin' }

const INVALID_CREDENTIALS = 'E-mail ou senha inválidos.'
const EMAIL_TAKEN = 'Este e-mail já está cadastrado na plataforma. Entre com ele ou use outro e-mail.'

/**
 * Cria a linha de detalhe (students/mentors/companies+company_admins) a partir dos metadados
 * salvos no signUp. É a ÚNICA rotina que insere essas linhas — tanto o fluxo normal (sessão
 * criada na hora) quanto o fluxo de confirmação de e-mail pendente (linha criada no primeiro
 * login pós-confirmação) passam por aqui, evitando duas fontes de verdade.
 */
async function provisionFromMetadata(authUser: User, accountType: string) {
  lastProvisionError = null
  try {
    await provision(authUser, accountType)
  } catch (err) {
    lastProvisionError = err
    throw err
  }
}

async function provision(authUser: User, accountType: string) {
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
    // Mentor convidado por uma empresa (convite pendente no e-mail dele) é vinculado no primeiro login.
    if (mentor && !mentor.companyId) {
      const linkedCompany = await acceptMentorInvites().catch(() => null)
      if (linkedCompany) mentor = await fetchMentorById(authUser.id)
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

/**
 * Entra só se a conta for do tipo escolhido na tela de login. Se a senha estiver certa mas o tipo
 * não bater (ex.: conta de mentor na aba Empresa), a sessão recém-criada é encerrada na hora.
 */
export async function signIn(email: string, password: string, expectedType: AccountType): Promise<{ authUser: User; user: LoggedUser }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error || !data.user) {
    // Com a confirmação de e-mail ativa, quem ainda não confirmou recebia "senha inválida".
    if (error?.code === 'email_not_confirmed') throw userError(friendlyError(error, INVALID_CREDENTIALS))
    if (error?.code && error.code !== 'invalid_credentials') throw userError(friendlyError(error, 'Não foi possível entrar agora. Tente novamente.'))
    throw userError(INVALID_CREDENTIALS)
  }

  let user: LoggedUser | null
  try {
    user = await resolveSessionUser(data.user)
  } catch (err) {
    await supabase.auth.signOut()
    throw userError(friendlyError(err, 'Não foi possível carregar sua conta agora. Tente novamente em instantes.'))
  }
  if (!user || user.type !== expectedType) {
    await supabase.auth.signOut()
    if (user) throw userError(`Esta conta não é de ${accountTypeLabels[expectedType]}. Selecione o tipo de conta correto para entrar.`)
    const provisionError = lastProvisionError as { code?: string; message?: string } | null
    if (provisionError?.code === '23505' && /cnpj/i.test(provisionError.message ?? '')) {
      throw userError('Já existe uma empresa cadastrada com o CNPJ informado neste cadastro. Fale com o administrador dela ou com o suporte.')
    }
    if (provisionError) throw userError('Não foi possível concluir o seu cadastro. Tente novamente; se persistir, fale com o suporte.')
    throw userError(INVALID_CREDENTIALS)
  }
  return { authUser: data.user, user }
}

export async function signOut() {
  await supabase.auth.signOut()
}

/**
 * O Supabase nunca cria dois usuários com o mesmo e-mail, mas com a confirmação de e-mail ativa ele
 * responde ao cadastro repetido sem erro, com um usuário "fantasma" (identities vazio) — e a tela
 * mostrava "confirme seu e-mail" como se a conta tivesse sido criada. Se o e-mail ainda não foi
 * confirmado, ele devolve a conta existente com o tipo original nos metadados.
 */
function assertNewAccount(
  data: { user: User | null; session: unknown },
  error: AuthError | null,
  type: AccountType
): SignUpOutcome {
  if (error) {
    if (error.code === 'user_already_exists' || error.code === 'email_exists') throw userError(EMAIL_TAKEN)
    throw userError(friendlyError(error, 'Não foi possível criar a conta. Tente novamente.'))
  }
  const existing = data.user?.identities?.length === 0 || data.user?.user_metadata?.account_type !== metadataAccountType[type]
  if (data.user && existing) throw userError(EMAIL_TAKEN)
  return { pendingConfirmation: !data.session }
}

export async function signUpStudent(name: string, email: string, password: string): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { account_type: 'student', name: name.trim() } } })
  return assertNewAccount(data, error, 'student')
}

export async function signUpMentor(name: string, email: string, password: string, bio: string, skills: string[]): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { account_type: 'mentor', name: name.trim(), bio: bio.trim(), skills } },
  })
  return assertNewAccount(data, error, 'mentor')
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
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        account_type: 'company_admin',
        name: input.adminName,
        company_name: input.name,
        razao_social: input.razaoSocial,
        cnpj: input.cnpj,
        sector: input.sector,
        company_email: input.email.trim(),
      },
    },
  })
  return assertNewAccount(data, error, 'company')
}
