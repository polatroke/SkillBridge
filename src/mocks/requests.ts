import type { EnrollmentRequest, MentorInvite } from '../types'

export const enrollmentRequests: EnrollmentRequest[] = [
  {
    id: 'req-1',
    studentId: 'student-3',
    companyId: 'company-1',
    programId: 'program-1',
    status: 'pendente',
    requestedAt: '2026-08-10',
  },
  {
    id: 'req-2',
    studentId: 'student-6',
    companyId: 'company-1',
    programId: 'program-2',
    status: 'pendente',
    requestedAt: '2026-08-15',
  },
  {
    id: 'req-3',
    studentId: 'student-4',
    companyId: 'company-1',
    programId: 'program-1',
    status: 'recusado',
    requestedAt: '2026-07-28',
  },
  {
    id: 'req-4',
    studentId: 'student-2',
    companyId: 'company-1',
    programId: 'program-1',
    status: 'ativo',
    requestedAt: '2026-02-03',
  },
  {
    id: 'req-5',
    studentId: 'student-5',
    companyId: 'company-1',
    programId: 'program-1',
    status: 'ativo',
    requestedAt: '2026-02-05',
  },
]

export const mentorInvites: MentorInvite[] = [
  {
    id: 'invite-1',
    companyId: 'company-1',
    name: 'Rodrigo Tavares',
    email: 'rodrigo.tavares@email.com',
    status: 'pendente',
    invitedAt: '2026-08-12',
  },
]
