/**
 * Dados de contato institucionais. Os endereços abaixo são placeholders do protótipo
 * (domínio reservado example.com, nunca entrega e-mail): troque pelos reais antes de publicar.
 */
export const SUPPORT_EMAIL = 'contato@skillbridge.example.com'
export const PRESS_EMAIL = 'imprensa@skillbridge.example.com'
export const SALES_EMAIL = 'empresas@skillbridge.example.com'

/** Monta um link mailto: com assunto e corpo já preenchidos. */
export function mailtoLink(to: string, subject?: string, body?: string): string {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString().replace(/\+/g, '%20')
  return `mailto:${to}${query ? `?${query}` : ''}`
}
