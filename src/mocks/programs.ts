import type { Program } from '../types'

export const programs: Program[] = [
  {
    id: 'program-1',
    companyId: 'company-1',
    name: 'Trilha de Talentos TechNova 2026',
    startDate: '2026-02-01',
    endDate: '2026-12-15',
    description:
      'Programa de capacitação técnica e de liderança para desenvolvimento de talentos internos da TechNova, com cursos exclusivos, mentoria dedicada e vagas internas.',
    courseIds: ['course-6', 'course-7'],
    mentorIds: ['mentor-4', 'mentor-5'],
    studentIds: ['student-2', 'student-5'],
  },
  {
    id: 'program-2',
    companyId: 'company-1',
    name: 'Programa Trainee Dados 2027',
    startDate: '2027-01-15',
    endDate: '2027-07-15',
    description: 'Trilha voltada para formação de trainees na área de dados e analytics.',
    courseIds: [],
    mentorIds: ['mentor-5'],
    studentIds: [],
  },
]

export const getProgramById = (id?: string) => programs.find((p) => p.id === id)
export const getProgramsByCompany = (companyId: string) => programs.filter((p) => p.companyId === companyId)
