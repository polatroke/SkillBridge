/** Só os dígitos de um CNPJ digitado com ou sem máscara. */
export function cnpjDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Confere os dois dígitos verificadores do CNPJ. Sem isso o cadastro aceitava qualquer texto,
 * e como `companies.cnpj` é único, "123" de uma empresa travava o cadastro de outra.
 */
export function isValidCnpj(value: string): boolean {
  const digits = cnpjDigits(value)
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false
  const checkDigit = (base: string) => {
    const weights = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const sum = weights.reduce((acc, w, i) => acc + w * Number(base[i]), 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }
  const first = checkDigit(digits.slice(0, 12))
  const second = checkDigit(digits.slice(0, 12) + first)
  return digits.endsWith(`${first}${second}`)
}

/** Formata como 00.000.000/0000-00 (mesmo formato dos CNPJs já gravados no banco). */
export function formatCnpj(value: string): string {
  const d = cnpjDigits(value).slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

/**
 * Devolve a URL só se for http(s). Links enviados por outro usuário (entrega de atividade, capa,
 * logo) são renderizados como <a href>/<img src>: `javascript:` e afins nunca devem virar link.
 */
export function safeHttpUrl(value: string | null | undefined): string | null {
  const raw = value?.trim()
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

/** Nome de pessoa/empresa: sem espaços nas pontas e com pelo menos 2 letras de conteúdo. */
export function cleanName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, ' ')
  return name.length >= 2 ? name : null
}
