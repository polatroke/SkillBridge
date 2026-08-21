import { create } from 'zustand'
import type {
  Company,
  Course,
  EnrollmentRequest,
  Job,
  Mentor,
  MentorInvite,
  MentorSession,
  Program,
  Student,
} from '../types'
import { students as studentsSeed } from '../mocks/students'
import { mentors as mentorsSeed } from '../mocks/mentors'
import { courses as coursesSeed } from '../mocks/courses'
import { programs as programsSeed } from '../mocks/programs'
import { jobs as jobsSeed } from '../mocks/jobs'
import { companies as companiesSeed } from '../mocks/companies'
import { enrollmentRequests as requestsSeed, mentorInvites as invitesSeed } from '../mocks/requests'
import { mentorSessions as sessionsSeed, certificates as certificatesSeed, activityItems as activitySeed } from '../mocks/sessions'
import type { ActivityItem, Certificate } from '../types'
import { nextDateForWeekday } from '../lib/date'

let uid = 1000
const nextId = (prefix: string) => `${prefix}-${uid++}`

interface DataState {
  students: Student[]
  mentors: Mentor[]
  companies: Company[]
  courses: Course[]
  programs: Program[]
  jobs: Job[]
  enrollmentRequests: EnrollmentRequest[]
  mentorInvites: MentorInvite[]
  mentorSessions: MentorSession[]
  certificates: Certificate[]
  activityItems: ActivityItem[]

  // -------- Cadastro (Auth) -------------------------------------------------
  registerStudent: (name: string, email: string) => Student
  registerMentor: (name: string, email: string, bio: string, skills: string[]) => Mentor
  registerCompany: (data: { cnpj: string; razaoSocial: string; name: string; email: string; sector: string }) => Company

  // -------- Aprovação de alunos (Empresa) --------------------------------
  approveRequest: (requestId: string) => void
  rejectRequest: (requestId: string) => void
  inviteStudentByEmail: (companyId: string, programId: string, name: string, email: string) => void

  // -------- Cursos (Empresa) ----------------------------------------------
  addCourse: (course: Omit<Course, 'id' | 'enrolledCount' | 'rating'>) => void
  updateCourse: (id: string, course: Partial<Course>) => void
  deleteCourse: (id: string) => void

  // -------- Mentores (Empresa) --------------------------------------------
  addMentorDirect: (mentor: Omit<Mentor, 'id' | 'type' | 'rating' | 'reviewsCount' | 'availability'>) => void
  inviteMentorByEmail: (companyId: string, name: string, email: string) => void
  resendMentorInvite: (inviteId: string) => void
  removeMentor: (mentorId: string) => void
  removeMentorInvite: (inviteId: string) => void
  updateMentorPrograms: (mentorId: string, programIds: string[]) => void

  // -------- Treinamentos (Empresa) -----------------------------------------
  addProgram: (program: Omit<Program, 'id'>) => void
  updateProgram: (id: string, program: Partial<Program>) => void
  setProgramStudents: (programId: string, studentIds: string[]) => void

  // -------- Vagas (Empresa) -------------------------------------------------
  addJob: (job: Omit<Job, 'id' | 'applicationsCount' | 'createdAt'>) => void
  updateJob: (id: string, job: Partial<Job>) => void
  closeJob: (id: string) => void
  deleteJob: (id: string) => void

  // -------- Mentoria (Aluno + Mentor) ---------------------------------------
  bookSession: (mentorId: string, studentId: string, availabilityId: string, topic: string) => void
  setMentorAvailability: (mentorId: string, availability: Mentor['availability']) => void
  completeSessionFeedback: (sessionId: string, notes: string) => void
  addSessionReview: (sessionId: string, rating: number, review: string) => void
}

export const useDataStore = create<DataState>((set) => ({
  students: studentsSeed,
  mentors: mentorsSeed,
  companies: companiesSeed,
  courses: coursesSeed,
  programs: programsSeed,
  jobs: jobsSeed,
  enrollmentRequests: requestsSeed,
  mentorInvites: invitesSeed,
  mentorSessions: sessionsSeed,
  certificates: certificatesSeed,
  activityItems: activitySeed,

  registerStudent: (name, email) => {
    const student: Student = {
      id: nextId('student'),
      type: 'student',
      name,
      email,
      enrolledCourseIds: [],
      completedCourseIds: [],
      certificateIds: [],
      studyHours: 0,
    }
    set((state) => ({ students: [...state.students, student] }))
    return student
  },

  registerMentor: (name, email, bio, skills) => {
    const mentor: Mentor = {
      id: nextId('mentor'),
      type: 'mentor',
      name,
      email,
      bio,
      skills,
      pricePerSession: 150,
      rating: 0,
      reviewsCount: 0,
      programIds: [],
      availability: [],
    }
    set((state) => ({ mentors: [...state.mentors, mentor] }))
    return mentor
  },

  registerCompany: ({ cnpj, razaoSocial, name, email, sector }) => {
    const company: Company = {
      id: nextId('company'),
      type: 'company',
      name,
      razaoSocial,
      cnpj,
      email,
      sector,
      adminUsers: [{ name, email, role: 'Admin Plataforma' }],
    }
    set((state) => ({ companies: [...state.companies, company] }))
    return company
  },

  approveRequest: (requestId) =>
    set((state) => {
      const req = state.enrollmentRequests.find((r) => r.id === requestId)
      if (!req) return state
      return {
        enrollmentRequests: state.enrollmentRequests.map((r) => (r.id === requestId ? { ...r, status: 'ativo' } : r)),
        students: state.students.map((s) =>
          s.id === req.studentId ? { ...s, companyId: req.companyId, programId: req.programId } : s
        ),
        programs: state.programs.map((p) =>
          p.id === req.programId && !p.studentIds.includes(req.studentId)
            ? { ...p, studentIds: [...p.studentIds, req.studentId] }
            : p
        ),
      }
    }),

  rejectRequest: (requestId) =>
    set((state) => ({
      enrollmentRequests: state.enrollmentRequests.map((r) => (r.id === requestId ? { ...r, status: 'recusado' } : r)),
    })),

  inviteStudentByEmail: (companyId, programId, name, email) =>
    set((state) => {
      const existing = state.students.find((s) => s.email.toLowerCase() === email.toLowerCase())
      const student: Student = existing ?? {
        id: nextId('student'),
        type: 'student',
        name,
        email,
        enrolledCourseIds: [],
        completedCourseIds: [],
        certificateIds: [],
        studyHours: 0,
      }
      const request: EnrollmentRequest = {
        id: nextId('req'),
        studentId: student.id,
        companyId,
        programId,
        status: 'pendente',
        requestedAt: new Date().toISOString().slice(0, 10),
      }
      return {
        students: existing ? state.students : [...state.students, student],
        enrollmentRequests: [...state.enrollmentRequests, request],
      }
    }),

  addCourse: (course) =>
    set((state) => ({
      courses: [...state.courses, { ...course, id: nextId('course'), enrolledCount: 0, rating: 0 }],
    })),

  updateCourse: (id, patch) =>
    set((state) => ({
      courses: state.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  deleteCourse: (id) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.id !== id),
    })),

  addMentorDirect: (mentor) =>
    set((state) => ({
      mentors: [
        ...state.mentors,
        { ...mentor, id: nextId('mentor'), type: 'mentor', rating: 0, reviewsCount: 0, availability: [] },
      ],
    })),

  inviteMentorByEmail: (companyId, name, email) =>
    set((state) => ({
      mentorInvites: [
        ...state.mentorInvites,
        { id: nextId('invite'), companyId, name, email, status: 'pendente', invitedAt: new Date().toISOString().slice(0, 10) },
      ],
    })),

  resendMentorInvite: (inviteId) =>
    set((state) => ({
      mentorInvites: state.mentorInvites.map((i) => (i.id === inviteId ? { ...i, invitedAt: new Date().toISOString().slice(0, 10) } : i)),
    })),

  removeMentor: (mentorId) =>
    set((state) => ({
      mentors: state.mentors.filter((m) => m.id !== mentorId),
    })),

  removeMentorInvite: (inviteId) =>
    set((state) => ({
      mentorInvites: state.mentorInvites.filter((i) => i.id !== inviteId),
    })),

  updateMentorPrograms: (mentorId, programIds) =>
    set((state) => ({
      mentors: state.mentors.map((m) => (m.id === mentorId ? { ...m, programIds } : m)),
    })),

  addProgram: (program) =>
    set((state) => ({
      programs: [...state.programs, { ...program, id: nextId('program') }],
    })),

  updateProgram: (id, patch) =>
    set((state) => ({
      programs: state.programs.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  setProgramStudents: (programId, studentIds) =>
    set((state) => {
      const program = state.programs.find((p) => p.id === programId)
      if (!program) return state
      return {
        programs: state.programs.map((p) => (p.id === programId ? { ...p, studentIds } : p)),
        students: state.students.map((s) => {
          if (studentIds.includes(s.id)) return { ...s, companyId: program.companyId, programId }
          if (s.programId === programId) return { ...s, companyId: undefined, programId: undefined }
          return s
        }),
      }
    }),

  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, { ...job, id: nextId('job'), applicationsCount: 0, createdAt: new Date().toISOString().slice(0, 10) }],
    })),

  updateJob: (id, patch) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    })),

  closeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, status: 'encerrada' } : j)),
    })),

  deleteJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    })),

  bookSession: (mentorId, studentId, availabilityId, topic) =>
    set((state) => {
      const mentor = state.mentors.find((m) => m.id === mentorId)
      const slot = mentor?.availability.find((a) => a.id === availabilityId)
      if (!mentor || !slot) return state
      const session: MentorSession = {
        id: nextId('session'),
        mentorId,
        studentId,
        date: nextDateForWeekday(slot.weekday),
        start: slot.start,
        end: slot.end,
        status: 'agendada',
        topic,
      }
      return {
        mentorSessions: [...state.mentorSessions, session],
        mentors: state.mentors.map((m) =>
          m.id === mentorId
            ? { ...m, availability: m.availability.map((a) => (a.id === availabilityId ? { ...a, booked: true } : a)) }
            : m
        ),
      }
    }),

  setMentorAvailability: (mentorId, availability) =>
    set((state) => ({
      mentors: state.mentors.map((m) => (m.id === mentorId ? { ...m, availability } : m)),
    })),

  completeSessionFeedback: (sessionId, notes) =>
    set((state) => ({
      mentorSessions: state.mentorSessions.map((s) => (s.id === sessionId ? { ...s, notes } : s)),
    })),

  addSessionReview: (sessionId, rating, review) =>
    set((state) => ({
      mentorSessions: state.mentorSessions.map((s) => (s.id === sessionId ? { ...s, rating, review, status: 'concluida' } : s)),
    })),
}))

export const useCurrentStudent = (id?: string) => useDataStore((state) => state.students.find((s) => s.id === id))
export const useCurrentMentor = (id?: string) => useDataStore((state) => state.mentors.find((m) => m.id === id))
