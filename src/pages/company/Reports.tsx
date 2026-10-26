import { Award, GraduationCap, TrendingUp, Users } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { averageRating, programProgress } from '../../lib/catalog'

export default function Reports() {
  const authUser = useAuthStore((s) => s.user)
  const companyId = authUser?.id ?? ''
  const allStudents = useDataStore((s) => s.students)
  const students = allStudents.filter((st) => st.companyId === companyId)
  const allMentors = useDataStore((s) => s.mentors)
  const mentors = allMentors.filter((m) => m.companyId === companyId)
  const allMentorSessions = useDataStore((s) => s.mentorSessions)
  const sessions = allMentorSessions.filter((sess) => mentors.some((m) => m.id === sess.mentorId))
  const allPrograms = useDataStore((s) => s.programs)
  const programs = allPrograms.filter((p) => p.companyId === companyId)
  const allCourses = useDataStore((s) => s.courses)
  const courses = allCourses.filter((c) => c.companyId === companyId)
  // Certificados dos cursos da empresa, inclusive de quem já saiu do treinamento (antes eram descartados).
  const allCertificates = useDataStore((s) => s.certificates)
  const certificates = allCertificates.filter((c) => courses.some((course) => course.id === c.courseId))

  const completedSessions = sessions.filter((s) => s.status === 'concluida')
  // Antes: sessões concluídas sem nota faziam a conta dividir por zero e a tela mostrava "NaN".
  const avg = averageRating(completedSessions.map((s) => s.rating))
  const avgRating = avg === null ? '—' : avg.toFixed(1)

  return (
    <DashboardLayout sidebar={<CompanySidebar />} profileTitle="Painel da Empresa">
      <PageHeader title="Relatórios" description="Acompanhe mentorias, certificados e progresso agregado dos seus treinamentos." />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Mentorias realizadas" value={completedSessions.length} tone="primary" />
        <StatCard icon={Award} label="Certificados emitidos" value={certificates.length} tone="amber" />
        <StatCard icon={Users} label="Alunos em treinamento" value={students.length} tone="cta" />
        <StatCard icon={TrendingUp} label="Avaliação média mentoria" value={avgRating} tone="emerald" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progresso por treinamento</CardTitle>
            <p className="mt-1 text-xs text-slate-400">Média da parte dos cursos do treinamento que cada aluno já concluiu.</p>
          </CardHeader>
          <div className="space-y-4">
            {programs.map((p) => {
              const programStudents = students.filter((s) => s.programId === p.id)
              const pct = programProgress(p, students)
              return (
                <div key={p.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{p.name}</span>
                    <span className="shrink-0 text-slate-400">
                      {pct}% · {programStudents.length} aluno(s) · {p.courseIds.length} curso(s)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700/60">
                    <div className="h-2.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {programs.length === 0 && <p className="text-sm text-slate-400">Nenhum treinamento criado ainda.</p>}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificados por curso</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {courses.map((c) => {
              const count = certificates.filter((cert) => cert.courseId === c.id).length
              return (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{c.title}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{count}</span>
                </div>
              )
            })}
            {courses.length === 0 && <p className="text-sm text-slate-400">Nenhum curso cadastrado ainda.</p>}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
