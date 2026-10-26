import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type {
  ActivityItem,
  Availability,
  Certificate,
  Company,
  Course,
  EnrollmentRequest,
  Job,
  JobApplication,
  LessonProgress,
  Mentor,
  MentorActivity,
  MentorInvite,
  MentorMessage,
  MentorSession,
  Program,
  Student,
} from '../types'
import { fetchStudents, updateStudentRow } from '../lib/supabase/queries/students'
import { fetchMentors, updateMentorRow, insertAvailabilityRow, deleteAvailabilityRow } from '../lib/supabase/queries/mentors'
import { fetchCompanies, updateCompanyRow } from '../lib/supabase/queries/companies'
import { fetchCourses, insertCourseRow, updateCourseRow, deleteCourseRow } from '../lib/supabase/queries/courses'
import { fetchPrograms, insertProgramRow, updateProgramRow, setProgramStudentsRows } from '../lib/supabase/queries/programs'
import { fetchJobs, fetchJobApplications, insertJobRow, updateJobRow, deleteJobRow } from '../lib/supabase/queries/jobs'
import { fetchLessonProgress } from '../lib/supabase/queries/progress'
import {
  fetchEnrollmentRequests,
  updateEnrollmentRequestStatus,
  fetchMentorInvites,
  insertMentorInviteRow,
  touchMentorInviteRow,
  deleteMentorInviteRow,
} from '../lib/supabase/queries/requests'
import { fetchMentorSessions, upsertMentorSessionNotes, fetchCertificates, fetchActivityItems } from '../lib/supabase/queries/sessions'
import { fetchMentorActivities, insertActivityRow, updateActivityStatusRow, reviewActivityRow, deleteActivityRow } from '../lib/supabase/queries/activities'
import { fetchMentorMessages, insertMessageRow, markThreadReadRows } from '../lib/supabase/queries/messages'
import {
  bookMentorSession,
  inviteExistingStudent,
  enrollInCourse as enrollInCourseRequest,
  applyToJob as applyToJobRequest,
  completeLesson as completeLessonRequest,
  submitActivity as submitActivityRequest,
  cancelMentorSession,
  reviewMentorSession,
  unlinkCompanyMentor,
  releasePastSessionSlots,
} from '../lib/supabase/rpc'
import { callCompanyUsers } from '../lib/supabase/companyUsers'
import { nextDateForWeekday } from '../lib/date'
import { friendlyError, userError } from '../lib/errors'
import { useAuthStore } from './authStore'

interface DataState {
  students: Student[]
  mentors: Mentor[]
  companies: Company[]
  courses: Course[]
  programs: Program[]
  jobs: Job[]
  jobApplications: JobApplication[]
  lessonProgress: LessonProgress[]
  enrollmentRequests: EnrollmentRequest[]
  mentorInvites: MentorInvite[]
  mentorSessions: MentorSession[]
  certificates: Certificate[]
  activityItems: ActivityItem[]
  mentorActivities: MentorActivity[]
  mentorMessages: MentorMessage[]
  /** true depois que a primeira carga (pós-login) terminou. */
  dataLoaded: boolean
  /** Mensagem da última carga que falhou (as telas mostram "tentar novamente" em vez de ficar em branco). */
  loadError: string | null

  fetchAll: () => Promise<void>
  clear: () => void

  // -------- Aprovação de alunos (Empresa) --------------------------------
  approveRequest: (requestId: string) => Promise<void>
  rejectRequest: (requestId: string) => Promise<void>
  inviteStudentByEmail: (programId: string, email: string) => Promise<void>

  // -------- Perfil do aluno ----------------------------------------------------
  updateStudentProfile: (studentId: string, patch: { name?: string; bio?: string }) => Promise<void>

  // -------- Cursos (Empresa + Aluno) ---------------------------------------
  addCourse: (course: Omit<Course, 'id' | 'enrolledCount' | 'rating'>) => Promise<void>
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  enrollInCourse: (courseId: string) => Promise<void>
  /** Marca a aula como concluída. `courseCompleted` = essa foi a última aula e o certificado foi emitido. */
  completeLesson: (courseId: string, moduleIndex: number, lessonIndex: number) => Promise<{ courseCompleted: boolean }>

  // -------- Mentores (Empresa + Mentor) -------------------------------------
  /** Cria o login do mentor já vinculado à empresa (Edge Function company-users). */
  addMentorDirect: (input: { name: string; email: string; password: string; bio: string; skills: string[]; programIds: string[] }) => Promise<void>
  inviteMentorByEmail: (companyId: string, name: string, email: string) => Promise<void>
  resendMentorInvite: (inviteId: string) => Promise<void>
  removeMentor: (mentorId: string) => Promise<void>
  removeMentorInvite: (inviteId: string) => Promise<void>
  updateMentorProfile: (mentorId: string, patch: { bio?: string; pricePerSession?: number; skills?: string[] }) => Promise<void>

  // -------- Treinamentos (Empresa) -----------------------------------------
  /** Devolve o id do treinamento criado. */
  addProgram: (program: Omit<Program, 'id'>) => Promise<string>
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
  /** Cria o login de outro administrador da empresa logada (Edge Function company-users). */
  addCompanyAdmin: (input: { name: string; email: string; password: string; role: string }) => Promise<void>
  removeCompanyAdmin: (adminId: string) => Promise<void>

  // -------- Mentoria (Aluno + Mentor) ---------------------------------------
  bookSession: (mentorId: string, studentId: string, availabilityId: string, topic: string) => Promise<void>
  addAvailabilitySlot: (mentorId: string, slot: Pick<Availability, 'weekday' | 'start' | 'end'>) => Promise<void>
  removeAvailabilitySlot: (slotId: string) => Promise<void>
  completeSessionFeedback: (sessionId: string, notes: string) => Promise<void>
  addSessionReview: (sessionId: string, rating: number, review: string) => Promise<void>
  cancelSession: (sessionId: string) => Promise<void>

  // -------- Atividades do mentor (Mentor + Aluno) ----------------------------
  assignActivity: (studentId: string, title: string, description?: string, dueDate?: string) => Promise<void>
  updateActivityStatus: (activityId: string, status: MentorActivity['status']) => Promise<void>
  submitActivity: (activityId: string, answer: string, url?: string) => Promise<void>
  reviewActivity: (activityId: string, status: 'pendente' | 'concluida', feedback?: string) => Promise<void>
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
  jobApplications: fetchJobApplications,
  lessonProgress: fetchLessonProgress,
  enrollmentRequests: fetchEnrollmentRequests,
  mentorInvites: fetchMentorInvites,
  mentorSessions: fetchMentorSessions,
  certificates: fetchCertificates,
  activityItems: fetchActivityItems,
  mentorActivities: fetchMentorActivities,
  mentorMessages: fetchMentorMessages,
} as const

type SliceKey = keyof typeof fetchers

/**
 * Incrementado a cada carga completa e a cada `clear()` (logout). Respostas que chegam depois de
 * uma troca de conta são descartadas — senão os dados do usuário anterior voltavam para a tela.
 */
let dataSeq = 0
/** Carga completa em andamento: chamadas repetidas (restauração da sessão + evento INITIAL_SESSION) reaproveitam a mesma. */
let fetchAllInFlight: Promise<void> | null = null

async function loadSlices(keys: SliceKey[]) {
  return Object.fromEntries(await Promise.all(keys.map(async (k) => [k, await fetchers[k]()] as const)))
}

async function refetch(keys: SliceKey[]) {
  const seq = dataSeq
  const slices = await loadSlices(keys)
  if (seq === dataSeq) useDataStore.setState(slices)
}

/**
 * O usuário logado (authStore) é uma cópia carregada no login: depois de editar o próprio
 * perfil, atualiza essa cópia também, senão topo e telas que leem dela mostram o dado antigo.
 */
function syncAuthUser(fresh: Student | Company | undefined) {
  const current = useAuthStore.getState().user
  if (fresh && current && current.id === fresh.id && current.type === fresh.type) useAuthStore.setState({ user: fresh })
}

const MESSAGES_TOPIC_PREFIX = 'mentor-messages-'
let messagesChannel: RealtimeChannel | null = null
/** Quem o canal atual escuta (`coluna:usuário`): evita recriar o canal a cada evento de sessão. */
let messagesChannelKey: string | null = null
let channelSeq = 0

/**
 * Assina novas mensagens de chat em tempo real para o usuário logado
 * (mentor ou aluno). Chamada no login, na restauração da sessão e a cada evento
 * de sessão (inclusive renovação do token); `company` não tem chat.
 */
export function subscribeRealtime() {
  const { user, accountType } = useAuthStore.getState()
  if (!user || (accountType !== 'mentor' && accountType !== 'student')) {
    unsubscribeRealtime()
    return
  }

  const column = accountType === 'mentor' ? 'mentor_id' : 'student_id'
  const key = `${column}:${user.id}`
  if (messagesChannel && messagesChannelKey === key) return

  // Remove o canal anterior e também canais de mensagens que o cliente ainda tem mas este módulo não
  // conhece (ex: sobra do hot reload do Vite, que zera as variáveis daqui mas não o cliente Supabase).
  removeMessageChannels()

  try {
    // Nome único: supabase.channel() devolve o canal existente com o mesmo nome e, se ele ainda
    // estiver inscrito, .on() lança "cannot add `postgres_changes` callbacks ... after `subscribe()`".
    messagesChannel = supabase
      .channel(`${MESSAGES_TOPIC_PREFIX}${user.id}-${++channelSeq}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mentor_messages', filter: `${column}=eq.${user.id}` },
        () => void refetch(['mentorMessages'])
      )
      .subscribe()
    messagesChannelKey = key
  } catch (err) {
    // O chat em tempo real é um extra: falhar aqui não pode impedir o login nem a navegação.
    console.warn('Realtime indisponível; as mensagens novas aparecem ao recarregar.', err)
    messagesChannel = null
    messagesChannelKey = null
  }
}

function removeMessageChannels() {
  for (const channel of supabase.getChannels()) {
    const leaving = channel.state === 'leaving' || channel.state === 'closed'
    if (channel.topic.startsWith(`realtime:${MESSAGES_TOPIC_PREFIX}`) && !leaving) void supabase.removeChannel(channel)
  }
  messagesChannel = null
  messagesChannelKey = null
}

export function unsubscribeRealtime() {
  removeMessageChannels()
}

export const useDataStore = create<DataState>((set) => ({
  students: [],
  mentors: [],
  companies: [],
  courses: [],
  programs: [],
  jobs: [],
  jobApplications: [],
  lessonProgress: [],
  enrollmentRequests: [],
  mentorInvites: [],
  mentorSessions: [],
  certificates: [],
  activityItems: [],
  mentorActivities: [],
  mentorMessages: [],
  dataLoaded: false,
  loadError: null,

  fetchAll: () => {
    if (fetchAllInFlight) return fetchAllInFlight
    const seq = ++dataSeq
    set({ loadError: null })
    let run: Promise<void> | null = null
    run = (async () => {
      try {
        // Libera horários semanais presos por sessões que já passaram (RPC opcional no servidor).
        await releasePastSessionSlots()
        const slices = await loadSlices(Object.keys(fetchers) as SliceKey[])
        if (seq === dataSeq) set({ ...slices, dataLoaded: true, loadError: null })
      } catch (err) {
        // Antes a falha virava "unhandled rejection" e dataLoaded ficava false para sempre: tela em branco.
        console.error('Falha ao carregar os dados', err)
        if (seq === dataSeq) set({ loadError: friendlyError(err, 'Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.') })
      } finally {
        if (fetchAllInFlight === run) fetchAllInFlight = null
      }
    })()
    fetchAllInFlight = run
    return run
  },

  clear: () => {
    dataSeq++
    fetchAllInFlight = null
    set({
      students: [],
      mentors: [],
      companies: [],
      courses: [],
      programs: [],
      jobs: [],
      jobApplications: [],
      lessonProgress: [],
      enrollmentRequests: [],
      mentorInvites: [],
      mentorSessions: [],
      certificates: [],
      activityItems: [],
      mentorActivities: [],
      mentorMessages: [],
      dataLoaded: false,
      loadError: null,
    })
  },

  approveRequest: async (requestId) => {
    const req = useDataStore.getState().enrollmentRequests.find((r) => r.id === requestId)
    if (!req) throw userError('Solicitação não encontrada. Recarregue a página.')
    // Vincula o aluno primeiro: se isso falhar, a solicitação continua pendente e pode ser aprovada
    // de novo. Na ordem inversa ela ficava "ativa" com o aluno fora do treinamento.
    await updateStudentRow(req.studentId, { companyId: req.companyId, programId: req.programId })
    await updateEnrollmentRequestStatus(requestId, 'ativo')
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

  updateStudentProfile: async (studentId, patch) => {
    await updateStudentRow(studentId, patch)
    await refetch(['students'])
    syncAuthUser(useDataStore.getState().students.find((s) => s.id === studentId))
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

  completeLesson: async (courseId, moduleIndex, lessonIndex) => {
    const result = await completeLessonRequest(courseId, moduleIndex, lessonIndex)
    await refetch(result.course_completed ? ['lessonProgress', 'students', 'certificates', 'activityItems'] : ['lessonProgress'])
    return { courseCompleted: result.course_completed }
  },

  addMentorDirect: async (input) => {
    await callCompanyUsers({ action: 'create_mentor', ...input })
    await refetch(['mentors', 'programs', 'mentorInvites'])
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
    // Desvincula da empresa em vez de apagar: o DELETE em `mentors` excluía a conta do mentor e, em
    // cascata, horários, sessões (inclusive o histórico dos alunos), atividades e mensagens.
    await unlinkCompanyMentor(mentorId)
    await refetch(['mentors', 'programs'])
  },

  removeMentorInvite: async (inviteId) => {
    await deleteMentorInviteRow(inviteId)
    await refetch(['mentorInvites'])
  },

  updateMentorProfile: async (mentorId, patch) => {
    await updateMentorRow(mentorId, patch)
    await refetch(['mentors'])
  },

  addProgram: async (program) => {
    const programId = await insertProgramRow(program)
    await refetch(['programs', 'students', 'mentors', 'courses'])
    return programId
  },

  updateProgram: async (id, patch) => {
    await updateProgramRow(id, patch)
    await refetch(['programs', 'courses', 'mentors'])
  },

  setProgramStudents: async (programId, studentIds) => {
    const program = useDataStore.getState().programs.find((p) => p.id === programId)
    if (!program) throw userError('Treinamento não encontrado. Recarregue a página.')
    await setProgramStudentsRows(programId, program.companyId, studentIds, program.studentIds)
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
    await refetch(['jobs', 'jobApplications'])
  },

  updateCompanyProfile: async (companyId, patch) => {
    await updateCompanyRow(companyId, patch)
    await refetch(['companies'])
    syncAuthUser(useDataStore.getState().companies.find((c) => c.id === companyId))
  },

  addCompanyAdmin: async (input) => {
    await callCompanyUsers({ action: 'create_admin', ...input })
    await refetch(['companies'])
    syncAuthUser(useDataStore.getState().companies.find((c) => c.id === useAuthStore.getState().user?.id))
  },

  removeCompanyAdmin: async (adminId) => {
    await callCompanyUsers({ action: 'remove_admin', adminId })
    await refetch(['companies'])
    syncAuthUser(useDataStore.getState().companies.find((c) => c.id === useAuthStore.getState().user?.id))
  },

  bookSession: async (mentorId, _studentId, availabilityId, topic) => {
    const mentor = useDataStore.getState().mentors.find((m) => m.id === mentorId)
    const slot = mentor?.availability.find((a) => a.id === availabilityId)
    if (!slot) throw userError('Esse horário não está mais disponível. Escolha outro.')
    await bookMentorSession(availabilityId, nextDateForWeekday(slot.weekday), topic)
    await refetch(['mentorSessions', 'mentors'])
  },

  addAvailabilitySlot: async (mentorId, slot) => {
    await insertAvailabilityRow(mentorId, slot)
    await refetch(['mentors'])
  },

  removeAvailabilitySlot: async (slotId) => {
    await deleteAvailabilityRow(slotId)
    await refetch(['mentors'])
  },

  completeSessionFeedback: async (sessionId, notes) => {
    const mentorId = useAuthStore.getState().user?.id
    if (!mentorId) throw userError('Sua sessão expirou. Entre novamente.')
    await upsertMentorSessionNotes(sessionId, mentorId, notes)
    await refetch(['mentorSessions'])
  },

  addSessionReview: async (sessionId, rating, review) => {
    await reviewMentorSession(sessionId, rating, review)
    await refetch(['mentorSessions', 'mentors', 'activityItems'])
  },

  cancelSession: async (sessionId) => {
    await cancelMentorSession(sessionId)
    await refetch(['mentorSessions', 'mentors'])
  },

  assignActivity: async (studentId, title, description, dueDate) => {
    const mentorId = useAuthStore.getState().user?.id
    if (!mentorId) throw userError('Sua sessão expirou. Entre novamente.')
    await insertActivityRow({ mentorId, studentId, title, description, dueDate })
    await refetch(['mentorActivities'])
  },

  updateActivityStatus: async (activityId, status) => {
    await updateActivityStatusRow(activityId, status)
    await refetch(['mentorActivities'])
  },

  submitActivity: async (activityId, answer, url) => {
    await submitActivityRequest(activityId, answer, url)
    await refetch(['mentorActivities'])
  },

  reviewActivity: async (activityId, status, feedback) => {
    await reviewActivityRow(activityId, status, feedback)
    await refetch(['mentorActivities'])
  },

  deleteActivity: async (activityId) => {
    await deleteActivityRow(activityId)
    await refetch(['mentorActivities'])
  },

  sendMessage: async (mentorId, studentId, body) => {
    const senderId = useAuthStore.getState().user?.id
    if (!senderId) throw userError('Sua sessão expirou. Entre novamente.')
    if (!body.trim()) return
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
