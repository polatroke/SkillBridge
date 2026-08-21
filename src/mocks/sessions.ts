import type { Certificate, MentorSession, ActivityItem } from '../types'

export const mentorSessions: MentorSession[] = [
  {
    id: 'session-1',
    mentorId: 'mentor-1',
    studentId: 'student-1',
    date: '2026-08-25',
    start: '16:00',
    end: '17:00',
    status: 'agendada',
    topic: 'Revisão de portfólio de UX',
  },
  {
    id: 'session-2',
    mentorId: 'mentor-1',
    studentId: 'student-1',
    date: '2026-07-14',
    start: '10:00',
    end: '11:00',
    status: 'concluida',
    topic: 'Introdução à pesquisa com usuários',
    rating: 5,
    review: 'Mentoria excelente, a Beatriz é muito didática e trouxe exemplos reais do dia a dia.',
  },
  {
    id: 'session-3',
    mentorId: 'mentor-4',
    studentId: 'student-2',
    date: '2026-08-27',
    start: '10:00',
    end: '11:00',
    status: 'agendada',
    topic: 'Plano de carreira dentro da TechNova',
  },
  {
    id: 'session-4',
    mentorId: 'mentor-4',
    studentId: 'student-5',
    date: '2026-07-30',
    start: '11:00',
    end: '12:00',
    status: 'concluida',
    topic: 'Feedback de liderança técnica',
    rating: 4,
    review: 'Sessão muito boa, gostaria de mais tempo pra aprofundar no próximo encontro.',
    notes: 'Camila está evoluindo bem em comunicação. Recomendar curso de gestão de projetos.',
  },
  {
    id: 'session-5',
    mentorId: 'mentor-2',
    studentId: 'student-1',
    date: '2026-06-02',
    start: '18:00',
    end: '19:00',
    status: 'concluida',
    topic: 'Dúvidas sobre Pandas e análise exploratória',
    rating: 5,
    review: 'Carlos explicou tudo com muita paciência, recomendo bastante!',
  },
]

export const certificates: Certificate[] = [
  { id: 'cert-1', studentId: 'student-1', courseId: 'course-1', issuedAt: '2026-05-20' },
  { id: 'cert-2', studentId: 'student-2', courseId: 'course-6', issuedAt: '2026-06-30' },
]

export const activityItems: ActivityItem[] = [
  { id: 'act-1', studentId: 'student-1', type: 'certificado', description: 'Certificado emitido: Fundamentos de UX Design', date: '2026-05-20' },
  { id: 'act-2', studentId: 'student-1', type: 'mentoria', description: 'Mentoria concluída com Carlos Andrade', date: '2026-06-02' },
  { id: 'act-3', studentId: 'student-1', type: 'curso', description: 'Iniciou o curso Marketing Digital na Prática', date: '2026-07-01' },
  { id: 'act-4', studentId: 'student-1', type: 'mentoria', description: 'Mentoria concluída com Beatriz Lima', date: '2026-07-14' },
  { id: 'act-5', studentId: 'student-2', type: 'curso', description: 'Concluiu o curso Onboarding TechNova: Cultura e Processos', date: '2026-06-28' },
  { id: 'act-6', studentId: 'student-2', type: 'certificado', description: 'Certificado emitido: Onboarding TechNova', date: '2026-06-30' },
  { id: 'act-7', studentId: 'student-2', type: 'curso', description: 'Iniciou o curso Trilha de Liderança TechNova', date: '2026-07-05' },
]
