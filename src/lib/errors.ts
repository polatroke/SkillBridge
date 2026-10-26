/** Formato comum dos erros do Supabase (PostgREST, Auth e Edge Functions). */
interface ErrorLike {
  code?: string
  message?: string
  name?: string
}

const byCode: Record<string, string> = {
  '42501': 'Você não tem permissão para fazer isso.',
  '23505': 'Já existe um registro com esses dados.',
  '23503': 'Esse item está ligado a outro registro que não existe mais. Recarregue a página e tente novamente.',
  PGRST202: 'Este recurso depende de uma atualização no servidor que ainda não foi aplicada.',
  PGRST301: 'Sua sessão expirou. Entre novamente.',
  // Supabase Auth
  email_not_confirmed: 'Confirme seu e-mail pelo link que enviamos antes de entrar.',
  weak_password: 'A senha é fraca demais. Use pelo menos 6 caracteres, misturando letras e números.',
  email_address_invalid: 'Esse endereço de e-mail não é válido.',
  validation_failed: 'Confira os dados informados e tente novamente.',
  over_email_send_rate_limit: 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.',
  over_request_rate_limit: 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.',
  signup_disabled: 'Novos cadastros estão desativados no momento.',
}

/**
 * Mensagem para mostrar na tela a partir de um erro qualquer. Mensagens já escritas para o usuário
 * (Error lançado pelo próprio app) passam direto; erros técnicos conhecidos viram texto em português;
 * o resto cai no `fallback`, para não exibir mensagens internas do banco em inglês.
 */
export function friendlyError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback
  const e = err as ErrorLike
  if (e.code && byCode[e.code]) return byCode[e.code]
  if (e.name === 'TypeError' && /fetch/i.test(e.message ?? '')) return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
  if (err instanceof Error && (err as Error & { userFacing?: boolean }).userFacing) return err.message
  return fallback
}

/** Erro com mensagem pronta para a tela (o `friendlyError` repassa o texto sem trocar). */
export function userError(message: string): Error {
  return Object.assign(new Error(message), { userFacing: true })
}

/** O erro é "função/RPC ainda não publicada no banco"? */
export function isMissingRpc(err: unknown): boolean {
  return !!err && typeof err === 'object' && (err as ErrorLike).code === 'PGRST202'
}
