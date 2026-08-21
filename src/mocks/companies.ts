import type { Company } from '../types'

export const companies: Company[] = [
  {
    id: 'company-1',
    type: 'company',
    name: 'TechNova Soluções',
    razaoSocial: 'TechNova Soluções em Tecnologia Ltda.',
    cnpj: '12.345.678/0001-90',
    email: 'contato@technova.com.br',
    sector: 'Tecnologia',
    logoUrl: '',
    avatarUrl: '',
    adminUsers: [
      { name: 'Patrícia Menezes', email: 'patricia.menezes@technova.com.br', role: 'Admin RH' },
      { name: 'Vitor Otávio', email: 'vitorotavio4@gmail.com', role: 'Admin Plataforma' },
    ],
  },
]

export const getCompanyById = (id?: string) => companies.find((c) => c.id === id)
