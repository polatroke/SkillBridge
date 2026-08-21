// ---------------------------------------------------------------------------
// Tipos centrais do domínio SkillBridge
// ---------------------------------------------------------------------------

export type AccountType = 'student' | 'mentor' | 'company'

export type StudentStatus = 'pendente' | 'ativo' | 'recusado'
export type MentorStatus = 'pendente' | 'ativo'
export type CourseStatus = 'rascunho' | 'publicado'
export type JobType = 'Efetivo' | 'Estágio' | 'Trainee'
export type JobMode = 'Presencial' | 'Remoto' | 'Híbrido'
export type JobStatus = 'aberta' | 'encerrada'
export type SessionStatus = 'agendada' | 'concluida' | 'cancelada'

export interface BaseUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

/** Aluno da plataforma. companyId + programId ficam undefined se não estiver em nenhum treinamento. */
export interface Student extends BaseUser {
  type: 'student'
  bio?: string
  companyId?: string
  programId?: string
  enrolledCourseIds: string[]
  completedCourseIds: string[]
  certificateIds: string[]
  studyHours: number
}

export interface Mentor extends BaseUser {
  type: 'mentor'
  bio: string
  skills: string[]
  pricePerSession: number
  rating: number
  reviewsCount: number
  /** Empresas às quais este mentor está vinculado (undefined/[] = mentor geral da plataforma) */
  companyId?: string
  /** ids dos treinamentos aos quais foi vinculado por uma empresa */
  programIds: string[]
  availability: Availability[]
}

export interface Availability {
  id: string
  weekday: 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado'
  start: string // "09:00"
  end: string // "10:00"
  booked?: boolean
}

export interface Company extends BaseUser {
  type: 'company'
  cnpj: string
  razaoSocial: string
  logoUrl?: string
  sector: string
  adminUsers: { name: string; email: string; role: string }[]
}

export interface Module {
  id: string
  title: string
  duration: string // "2h30"
  lessons: string[]
}

export interface Course {
  id: string
  title: string
  summary: string
  category: string
  totalHours: number
  modules: Module[]
  instructor: string
  instructorMentorId?: string
  coverUrl: string
  status: CourseStatus
  /** undefined = curso público geral da SkillBridge. Definido = curso exclusivo da empresa. */
  companyId?: string
  /** treinamentos aos quais o curso está vinculado (só relevante se companyId estiver definido) */
  programIds: string[]
  enrolledCount: number
  rating: number
}

export interface Program {
  id: string
  companyId: string
  name: string
  startDate: string
  endDate: string
  courseIds: string[]
  mentorIds: string[]
  studentIds: string[]
  description?: string
}

export interface Job {
  id: string
  companyId: string
  title: string
  description: string
  requirements: string[]
  department: string
  type: JobType
  mode: JobMode
  location: string
  programIds: string[]
  status: JobStatus
  applicationsCount: number
  createdAt: string
}

export interface EnrollmentRequest {
  id: string
  studentId: string
  companyId: string
  programId: string
  status: StudentStatus
  requestedAt: string
}

export interface MentorInvite {
  id: string
  companyId: string
  name: string
  email: string
  status: 'pendente' | 'aceito'
  invitedAt: string
}

export interface MentorSession {
  id: string
  mentorId: string
  studentId: string
  date: string // "2026-08-25"
  start: string
  end: string
  status: SessionStatus
  topic: string
  rating?: number
  review?: string
  notes?: string
}

export interface Certificate {
  id: string
  studentId: string
  courseId: string
  issuedAt: string
}

export interface ActivityItem {
  id: string
  studentId: string
  type: 'curso' | 'mentoria' | 'certificado'
  description: string
  date: string
}

export type LoggedUser = Student | Mentor | Company
