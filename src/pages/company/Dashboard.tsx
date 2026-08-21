import { Link } from 'react-router-dom'
import { Award, BookOpen, GraduationCap, TrendingUp, UserCheck, Users } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard } from '../../components/ui/StatCard'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'

export default function CompanyDashboard() {
  const authUser = useAuthStore((s) => s.user)
  const companyId = authUser?.id
  const students = useDataStore((s) => s.students)
  const requests = useDataStore((s) => s.enrollmentRequests)
  const mentors = useDataStore((s) => s.mentors)
  const courses = useDataStore((s) => s.courses)
  const sessions = useDataStore((s) => s.mentorSessions)
  const programs = useDataStore((s) => s.programs)

  const activeStudents = students.filter((s) => s.companyId === companyId)
  const pendingRequests = requests.filter((r) => r.companyId === companyId && r.status === 'pendente')
  const companyMentors = mentors.filter((m) => m.companyId === companyId)
  const companyCourses = courses.filter((c) => c.companyId === companyId)
  const companySessions = sessions.filter((s) => companyMentors.some((m) => m.id === s.mentorId))
  const avgProgress = activeStudents.length
    ? Math.round((activeStudents.filter((s) => s.completedCourseIds.length > 0).length / activeStudents.length) * 100)
    : 0

  return (
    <DashboardLayout sidebar={<CompanySidebar />} profileTitle="Painel da Empresa">
      <PageHeader
        title="Dashboard da Empresa"
        description="Visão geral dos treinamentos, alunos e mentores vinculados à sua empresa."
        actions={
          <Link to="/empresa/treinamentos">
            <Button icon={<TrendingUp size={16} />}>Gerenciar treinamentos</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Alunos ativos" value={activeStudents.length} tone="primary" />
        <StatCard icon={UserCheck} label="Solicitações pendentes" value={pendingRequests.length} tone="cta" />
        <StatCard icon={TrendingUp} label="Progresso médio" value={`${avgProgress}%`} tone="emerald" />
        <StatCard icon={GraduationCap} label="Mentorias realizadas" value={companySessions.filter((s) => s.status === 'concluida').length} tone="amber" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Solicitações recentes</CardTitle>
            <Link to="/empresa/alunos" className="text-sm font-semibold text-primary-600 hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {pendingRequests.slice(0, 5).map((req) => {
              const student = students.find((s) => s.id === req.studentId)
              return (
                <div key={req.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={student?.name ?? '?'} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{student?.name}</p>
                      <p className="text-xs text-slate-400">{student?.email}</p>
                    </div>
                  </div>
                  <Badge status="pendente" />
                </div>
              )
            })}
            {pendingRequests.length === 0 && <p className="text-sm text-slate-400">Nenhuma solicitação pendente.</p>}
          </div>

          <CardHeader className="mt-8">
            <CardTitle>Programas de treinamento</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {programs
              .filter((p) => p.companyId === companyId)
              .map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">
                      {p.studentIds.length} alunos · {p.courseIds.length} cursos · {p.mentorIds.length} mentores
                    </p>
                  </div>
                  <Badge status="ativo" />
                </div>
              ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mentores vinculados</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {companyMentors.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{m.name}</p>
                    <p className="truncate text-xs text-slate-400">{m.skills.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
              ))}
              {companyMentors.length === 0 && <p className="text-sm text-slate-400">Nenhum mentor vinculado ainda.</p>}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cursos publicados</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {companyCourses.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5 text-sm">
                  <BookOpen size={15} className="shrink-0 text-primary-500" />
                  <span className="truncate text-slate-700">{c.title}</span>
                </div>
              ))}
              {companyCourses.length === 0 && <p className="text-sm text-slate-400">Nenhum curso cadastrado ainda.</p>}
            </div>
          </Card>

          <Card className="bg-primary-50/60">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-600 shadow-soft">
                <Award size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-primary-800">Certificados emitidos</p>
                <p className="text-xs text-primary-600">via cursos da sua empresa</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
