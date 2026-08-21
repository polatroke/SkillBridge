import type { Job } from '../types'

export const jobs: Job[] = [
  {
    id: 'job-1',
    companyId: 'company-1',
    title: 'Analista de Dados Jr.',
    description:
      'Buscamos uma pessoa analista de dados júnior para integrar o time de Analytics, apoiando squads de produto com relatórios e dashboards.',
    requirements: [
      'Conhecimento em SQL e Python',
      'Vivência com Power BI ou ferramenta similar',
      'Perfil analítico e curioso',
      'Cursando ou formado em áreas exatas',
    ],
    department: 'Dados & Analytics',
    type: 'Efetivo',
    mode: 'Híbrido',
    location: 'São Paulo, SP',
    programIds: ['program-1'],
    status: 'aberta',
    applicationsCount: 12,
    createdAt: '2026-06-10',
  },
  {
    id: 'job-2',
    companyId: 'company-1',
    title: 'Estágio em Produto',
    description:
      'Vaga de estágio para apoiar squads de produto em pesquisa, priorização de backlog e acompanhamento de métricas.',
    requirements: ['Cursando Administração, Engenharia ou áreas correlatas', 'Boa comunicação escrita', 'Vontade de aprender sobre produto digital'],
    department: 'Produto',
    type: 'Estágio',
    mode: 'Remoto',
    location: 'Remoto (Brasil)',
    programIds: ['program-1'],
    status: 'aberta',
    applicationsCount: 27,
    createdAt: '2026-07-02',
  },
  {
    id: 'job-3',
    companyId: 'company-1',
    title: 'Trainee Engenharia de Software',
    description: 'Programa trainee de 12 meses para formação de novos talentos em engenharia de software.',
    requirements: ['Formado há no máximo 2 anos', 'Lógica de programação sólida', 'Disponibilidade para mudança de área a cada trimestre'],
    department: 'Engenharia',
    type: 'Trainee',
    mode: 'Presencial',
    location: 'São Paulo, SP',
    programIds: ['program-1'],
    status: 'encerrada',
    applicationsCount: 84,
    createdAt: '2026-03-20',
  },
]

export const getJobById = (id?: string) => jobs.find((j) => j.id === id)
export const getJobsByCompany = (companyId: string) => jobs.filter((j) => j.companyId === companyId)
