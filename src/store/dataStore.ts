import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type {
  ActivityItem,
  Certificate,
  Company,
  Course,
  EnrollmentRequest,
  Job,
  Mentor,
  MentorActivity,
  MentorInvite,
  MentorMessage,
  MentorSession,
  Program,
  Student,
} from '../types'
import { fetchStudents, updateStudentRow } from '../lib/supabase/queries/students'
import { fetchMentors, updateMentorRow, deleteMentorRow, setMentorProgramsRows, replaceMentorAvailabilityRows } from '../lib/supabase/queries/mentors'
import { fetchCompanies, updateCompanyRow } from '../lib/supabase/queries/companies'
import { fetchCourses, insertCourseRow, updateCourseRow, deleteCourseRow } from '../lib/supabase/queries/courses'
import { fetchPrograms, insertProgramRow, updateProgramRow, setProgramStudentsRows } from '../lib/supabase/queries/programs'
import { fetchJobs, insertJobRow, updateJobRow, deleteJobRow } from '../lib/supabase/queries/jobs'
import {
  fetchEnrollmentRequests,
  updateEnrollmentRequestStatus,
  fetchMentorInvites,
  insertMentorInviteRow,
  touchMentorInviteRow,
  deleteMentorInviteRow,
} from '../lib/supabase/queries/requests'
import { fetchMentorSessions, updateMentorSessionRow, upsertMentorSessionNotes, fetchCertificates, fetchActivityItems } from '../lib/supabase/queries/sessions'
import { fetchMentorActivities, insertActivityRow, updateActivityStatusRow, deleteActivityRow } from '../lib/supabase/queries/activities'
import { fetchMentorMessages, insertMessageRow, markThreadReadRows } from '../lib/supabase/queries/messages'
import {
  bookMentorSession,
  inviteExistingStudent,
  enrollInCourse as enrollInCourseRequest,
  applyToJob as applyToJobRequest,
} from '../lib/supabase/rpc'
import { nextDateForWeekday } from '../lib/date'
import { useAuthStore } from './authStore'

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
  mentorActivities: MentorActivity[]
  mentorMessages: MentorMessage[]
  /** true depois que a primeira carga (pós-login) terminou. */
  dataLoaded: boolean

  fetchAll: () => Promise<void>
  clear: () => void

  // -------- Aprovação de alunos (Empresa) --------------------------------
  approveRequest: (requestId: string) => Promise<void>
  rejectRequest: (requestId: string) => Promise<void>
  inviteStudentByEmail: (programId: string, email: string) => Promise<void>

  // -------- Cursos (Empresa + Aluno) ---------------------------------------
  addCourse: (course: Omit<Course, 'id' | 'enrolledCount' | 'rating'>) => Promise<void>
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  enrollInCourse: (courseId: string) => Promise<void>

  // -------- Mentores (Empresa + Mentor) -------------------------------------
  addMentorDirect: (mentor: Omit<Mentor, 'id' | 'type' | 'rating' | 'reviewsCount' | 'availability'>) => Promise<void>
  inviteMentorByEmail: (companyId: string, name: string, email: string) => Promise<void>
  resendMentorInvite: (inviteId: string) => Promise<void>
  removeMentor: (mentorId: string) => Promise<void>
  removeMentorInvite: (inviteId: string) => Promise<void>
  updateMentorPrograms: (mentorId: string, programIds: string[]) => Promise<void>
  updateMentorProfile: (mentorId: string, patch: { bio?: string; pricePerSession?: number; skills?: string[] }) => Promise<void>

  // -------- Treinamentos (Empresa) -----------------------------------------
  addProgram: (program: Omit<Program, 'id'>) => Promise<void>
  updateProgram: (id: string, program: Partial<Program>) => Promise<void>
  setProgramStudents: (programId: string, studentIds: string[]) => Promise<void>

  // -------- Vagas (Empresa + Aluno) ------------------------------------------
  addJob: (job: Omit<Job, 'id' | 'applicationsCount' | 'createdAt'>) => Promise<void>
  updateJob: (id: string, job: Partial<Job>) => Promise<void>
  closeJob: (id: string) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  applyToJob: (jobId: string) => Promise<void>

  // -------- Empresa (Configurações) -----------------------------------------
  updateCompanyProfile: (
    companyId: string,
    patch: Partial<{ name: string; razaoSocial: string; sector: string; email: string; logoUrl: string }>
  ) => Promise<void>

  // -------- Mentoria (Aluno + Mentor) ---------------------------------------
  bookSession: (mentorId: string, studentId: string, availabilityId: string, topic: string) => Promise<void>
  setMentorAvailability: (mentorId: string, availability: Mentor['availability']) => Promise<void>
  completeSessionFeedback: (sessionId: string, notes: string) => Promise<void>
  addSessionReview: (sessionId: string, rating: number, review: string) => Promise<void>

  // -------- Atividades do mentor (Mentor + Aluno) ----------------------------
  assignActivity: (studentId: string, title: string, description?: string, dueDate?: string) => Promise<void>
  updateActivityStatus: (activityId: string, status: MentorActivity['status']) => Promise<void>
  deleteActivity: (activityId: string) => Promise<void>

  // -------- Dúvidas / chat (Mentor + Aluno) -----------------------------------
  sendMessage: (mentorId: string, studentId: string, body: string) => Promise<void>
  markThreadRead: (mentorId: string, studentId: string) => Promise<void>
}

const fetchers = {
  students: fetchStudents,
  mentors: fetchMentors,
  companies: fetchCompanies,
  courses: fetchCourses,
  programs: fetchPrograms,
  jobs: fetchJobs,
  enrollmentRequests: fetchEnrollmentRequests,
  mentorInvites: fetchMentorInvites,
  mentorSessions: fetchMentorSessions,
  certificates: fetchCertificates,
  activityItems: fetchActivityItems,
  mentorActivities: fetchMentorActivities,
  mentorMessages: fetchMentorMessages,
} as const

type SliceKey = keyof typeof fetchers

async function refetch(keys: SliceKey[]) {
  const entries = await Promise.all(keys.map(async (k) => [k, await fetchers[k]()] as const))
  useDataStore.setState(Object.fromEntries(entries))
}

let messagesChannel: RealtimeChannel | null = null

/**
 * Assina novas mensagens de chat em tempo real para o usuário logado
 * (mentor ou aluno). Chamada depois de `fetchAll()` no login/refresh da
 * sessão; `company` não tem chat, então não assina nada.
 */
export function subscribeRealtime() {
  const { user, accountType } = useAuthStore.getState()
  // Sempre parte de um estado limpo: evita "cannot add callbacks after subscribe()"
  // caso essa função seja chamada mais de uma vez (ex: refresh + onAuthStateChange).
  unsubscribeRealtime()
  if (!user || (accountType !== 'mentor' && accountType !== 'student')) return

  const column = accountType === 'mentor' ? 'mentor_id' : 'student_id'
  messagesChannel = supabase
    .channel(`mentor-messages-${user.id}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'mentor_messages', filter: `${column}=eq.${user.id}` },
      () => void refetch(['mentorMessages'])
    )
    .subscribe()
}

export function unsubscribeRealtime() {
  if (!messagesChannel) return
  void supabase.removeChannel(messagesChannel)
  messagesChannel = null
}

export const useDataStore = create<DataState>((set) => ({
  students: [],
  mentors: [],
  companies: [],
  courses: [],
  programs: [],
  jobs: [],
  enrollmentRequests: [],
  mentorInvites: [],
  mentorSessions: [],
  certificates: [],
  activityItems: [],
  mentorActivities: [],
  mentorMessages: [],
  dataLoaded: false,

  fetchAll: async () => {
    const keys = Object.keys(fetchers) as SliceKey[]
    const entries = await Promise.all(keys.map(async (k) => [k, await fetchers[k]()] as const))
    set({ ...Object.fromEntries(entries), dataLoaded: true })
  },

  clear: () =>
    set({
      students: [],
      mentors: [],
      companies: [],
      courses: [],
      programs: [],
      jobs: [],
      enrollmentRequests: [],
      mentorInvites: [],
      mentorSessions: [],
      certificates: [],
      activityItems: [],
      mentorActivities: [],
      mentorMessages: [],
      dataLoaded: false,
    }),

  approveRequest: async (requestId) => {
    const req = useDataStore.getState().enrollmentRequests.find((r) => r.id === requestId)
    if (!req) return
    await updateEnrollmentRequestStatus(requestId, 'ativo')
    await updateStudentRow(req.studentId, { companyId: req.companyId, programId: req.programId })
    await refetch(['enrollmentRequests', 'students', 'programs'])
  },

  rejectRequest: async (requestId) => {
    await updateEnrollmentRequestStatus(requestId, 'recusado')
    await refetch(['enrollmentRequests'])
  },

  inviteStudentByEmail: async (programId, email) => {
    await inviteExistingStudent(programId, email)
    await refetch(['enrollmentRequests', 'students', 'programs'])
  },

  addCourse: async (course) => {
    await insertCourseRow(course)
    await refetch(['courses'])
  },

  updateCourse: async (id, patch) => {
    await updateCourseRow(id, patch)
    await refetch(['courses'])
  },

  deleteCourse: async (id) => {
    await deleteCourseRow(id)
    await refetch(['courses'])
  },

  enrollInCourse: async (courseId) => {
    await enrollInCourseRequest(courseId)
    await refetch(['courses', 'students', 'activityItems'])
  },

  addMentorDirect: async () => {
    throw new Error(
      'Cadastro direto de mentor não está disponível nesta versão: um login real só pode ser criado pela própria pessoa em /cadastro. Use "Convidar por e-mail" e peça para o mentor se cadastrar.'
    )
  },

  inviteMentorByEmail: async (companyId, name, email) => {
    await insertMentorInviteRow(companyId, name, email)
    await refetch(['mentorInvites'])
  },

  resendMentorInvite: async (inviteId) => {
    await touchMentorInviteRow(inviteId)
    await refetch(['mentorInvites'])
  },

  removeMentor: async (mentorId) => {
    await deleteMentorRow(mentorId)
    await refetch(['mentors'])
  },

  removeMentorInvite: async (inviteId) => {
    await deleteMentorInviteRow(inviteId)
    await refetch(['mentorInvites'])
  },

  updateMentorPrograms: async (mentorId, programIds) => {
    await setMentorProgramsRows(mentorId, programIds)
    await refetch(['mentors'])
  },

  updateMentorProfile: async (mentorId, patch) => {
    await updateMentorRow(mentorId, patch)
    await refetch(['mentors'])
  },

  addProgram: async (program) => {
    await insertProgramRow(program)
    await refetch(['programs', 'students', 'mentors'])
  },

  updateProgram: async (id, patch) => {
    await updateProgramRow(id, patch)
    await refetch(['programs', 'courses'])
  },

  setProgramStudents: async (programId, studentIds) => {
    const program = useDataStore.getState().programs.find((p) => p.id === programId)
    if (!program) return
    await setProgramStudentsRows(programId, program.companyId, studentIds)
    await refetch(['programs', 'students'])
  },

  addJob: async (job) => {
    await insertJobRow(job)
    await refetch(['jobs'])
  },

  updateJob: async (id, patch) => {
    await updateJobRow(id, patch)
    await refetch(['jobs'])
  },

  closeJob: async (id) => {
    await updateJobRow(id, { status: 'encerrada' })
    await refetch(['jobs'])
  },

  deleteJob: async (id) => {
    await deleteJobRow(id)
    await refetch(['jobs'])
  },

  applyToJob: async (jobId) => {
    await applyToJobRequest(jobId)
    await refetch(['jobs'])
  },

  updateCompanyProfile: async (companyId, patch) => {
    await updateCompanyRow(companyId, patch)
    await refetch(['companies'])
  },

  bookSession: async (mentorId, _studentId, availabilityId, topic) => {
    const mentor = useDataStore.getState().mentors.find((m) => m.id === mentorId)
    const slot = mentor?.availability.find((a) => a.id === availabilityId)
    if (!slot) return
    await bookMentorSession(availabilityId, nextDateForWeekday(slot.weekday), topic)
    await refetch(['mentorSessions', 'mentors'])
  },

  setMentorAvailability: async (mentorId, availability) => {
    await replaceMentorAvailabilityRows(mentorId, availability)
    await refetch(['mentors'])
  },

  completeSessionFeedback: async (sessionId, notes) => {
    const mentorId = useAuthStore.getState().user?.id
    if (!mentorId) return
    await upsertMentorSessionNotes(sessionId, mentorId, notes)
    await refetch(['mentorSessions'])
  },

  addSessionReview: async (sessionId, rating, review) => {
    await updateMentorSessionRow(sessionId, { rating, review, status: 'concluida' })
    await refetch(['mentorSessions'])
  },

  assignActivity: async (studentId, title, description, dueDate) => {
    const mentorId = useAuthStore.getState().user?.id
    if (!mentorId) return
    await insertActivityRow({ mentorId, studentId, title, description, dueDate })
    await refetch(['mentorActivities'])
  },

  updateActivityStatus: async (activityId, status) => {
    await updateActivityStatusRow(activityId, status)
    await refetch(['mentorActivities'])
  },

  deleteActivity: async (activityId) => {
    await deleteActivityRow(activityId)
    await refetch(['mentorActivities'])
  },

  sendMessage: async (mentorId, studentId, body) => {
    const senderId = useAuthStore.getState().user?.id
    if (!senderId || !body.trim()) return
    await insertMessageRow(mentorId, studentId, senderId, body.trim())
    await refetch(['mentorMessages'])
  },

  markThreadRead: async (mentorId, studentId) => {
    const viewerId = useAuthStore.getState().user?.id
    if (!viewerId) return
    await markThreadReadRows(mentorId, studentId, viewerId)
    await refetch(['mentorMessages'])
  },
}))

export const useCurrentStudent = (id?: string) => useDataStore((state) => state.students.find((s) => s.id === id))
export const useCurrentMentor = (id?: string) => useDataStore((state) => state.mentors.find((m) => m.id === id))
