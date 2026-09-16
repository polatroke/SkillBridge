import { supabase } from '../../supabaseClient'
import type { Company } from '../../../types'

interface CompanyRow {
  id: string
  name: string
  razao_social: string
  cnpj: string
  email: string
  sector: string
  logo_url: string | null
  company_admins?: { name: string; email: string; role: string }[]
}

function toCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    type: 'company',
    name: row.name,
    email: row.email,
    cnpj: row.cnpj,
    razaoSocial: row.razao_social,
    logoUrl: row.logo_url ?? undefined,
    sector: row.sector,
    adminUsers: (row.company_admins ?? []).map((a) => ({ name: a.name, email: a.email, role: a.role })),
  }
}

const SELECT = '*, company_admins(name, email, role)'

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase.from('companies').select(SELECT)
  if (error) throw error
  return (data ?? []).map(toCompany)
}

export async function fetchCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase.from('companies').select(SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? toCompany(data) : null
}

export async function insertCompanyRow(
  id: string,
  input: { name: string; razaoSocial: string; cnpj: string; email: string; sector: string }
) {
  const { error } = await supabase.from('companies').insert({
    id,
    name: input.name,
    razao_social: input.razaoSocial,
    cnpj: input.cnpj,
    email: input.email,
    sector: input.sector,
  })
  if (error) throw error
}

export async function insertCompanyAdminRow(id: string, companyId: string, name: string, email: string, role = 'Admin Plataforma') {
  const { error } = await supabase.from('company_admins').insert({ id, company_id: companyId, name, email, role })
  if (error) throw error
}

export async function updateCompanyRow(
  id: string,
  patch: Partial<{ name: string; razaoSocial: string; sector: string; email: string; logoUrl: string }>
) {
  const fields: Record<string, unknown> = {}
  if (patch.name !== undefined) fields.name = patch.name
  if (patch.razaoSocial !== undefined) fields.razao_social = patch.razaoSocial
  if (patch.sector !== undefined) fields.sector = patch.sector
  if (patch.email !== undefined) fields.email = patch.email
  if (patch.logoUrl !== undefined) fields.logo_url = patch.logoUrl
  if (Object.keys(fields).length === 0) return
  const { error } = await supabase.from('companies').update(fields).eq('id', id)
  if (error) throw error
}
