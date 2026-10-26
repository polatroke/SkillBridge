import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

/**
 * Criar o login de outra pessoa (mentor ou administrador da empresa) exige a chave de serviço,
 * então passa pela Edge Function `company-users`, que confere se quem chama é admin da empresa.
 */
type CompanyUsersAction =
  | { action: 'create_mentor'; name: string; email: string; password: string; bio: string; skills: string[]; programIds: string[] }
  | { action: 'create_admin'; name: string; email: string; password: string; role: string }
  | { action: 'remove_admin'; adminId: string }

const messages: Record<string, string> = {
  invalid_input: 'Preencha nome, e-mail e senha corretamente.',
  weak_password: 'A senha provisória precisa ter pelo menos 8 caracteres.',
  email_taken: 'Já existe uma conta com este e-mail na SkillBridge.',
  invalid_program: 'Um dos treinamentos selecionados não pertence à sua empresa.',
  not_company_admin: 'Só administradores da empresa podem fazer isso.',
  cannot_remove_self: 'Você não pode remover o seu próprio acesso.',
  not_found: 'Administrador não encontrado nesta empresa.',
}

export async function callCompanyUsers(body: CompanyUsersAction): Promise<void> {
  const { error } = await supabase.functions.invoke('company-users', { body })
  if (!error) return
  if (error instanceof FunctionsHttpError) {
    if (error.context.status === 404) {
      throw new Error('Este recurso depende da função "company-users" no servidor, que ainda não foi publicada.')
    }
    const payload = await error.context.json().catch(() => null)
    throw new Error(messages[payload?.error] ?? 'Não foi possível concluir. Tente novamente.')
  }
  // No navegador, função ainda não publicada aparece aqui (o preflight CORS recebe 404), não como 404.
  throw new Error('Não foi possível acessar o serviço de cadastro. Verifique sua conexão; se continuar, a função "company-users" ainda não foi publicada no servidor.')
}
