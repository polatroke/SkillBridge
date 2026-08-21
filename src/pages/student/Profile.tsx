import { Award, Building2, CalendarRange, Mail, MapPin } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useDataStore, useCurrentStudent } from '../../store/dataStore'
import { isStudentInProgram } from '../../lib/access'
import { formatDateBR } from '../../lib/date'

export default function StudentProfile() {
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const certificates = useDataStore((s) => s.certificates)
  const activityItems = useDataStore((s) => s.activityItems)
  const courses = useDataStore((s) => s.courses)
  const programs = useDataStore((s) => s.programs)
  const companies = useDataStore((s) => s.companies)
  const getCourseById = (id?: string) => courses.find((c) => c.id === id)
  const getProgramById = (id?: string) => programs.find((p) => p.id === id)
  const getCompanyById = (id?: string) => companies.find((c) => c.id === id)

  if (!student) return null

  const inProgram = isStudentInProgram(student)
  const program = inProgram ? getProgramById(student.programId) : undefined
  const company = inProgram ? getCompanyById(student.companyId) : undefined
  const myCertificates = certificates.filter((c) => c.studentId === student.id)
  const activity = activityItems.filter((a) => a.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <PageHeader title="Meu Perfil" description="Seus dados, certificados e vínculo com treinamentos corporativos." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="text-center">
            <Avatar name={student.name} size="lg" className="mx-auto h-20 w-20 text-2xl" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">{student.name}</h2>
            <p className="flex items-center justify-center gap-1.5 text-sm text-slate-400">
              <Mail size={13} /> {student.email}
            </p>
            {student.bio && <p className="mt-3 text-sm text-slate-500">{student.bio}</p>}
            <Button variant="secondary" size="sm" fullWidth className="mt-5">
              Editar perfil
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treinamento / Empresa</CardTitle>
            </CardHeader>
            {inProgram && program && company ? (
              <div>
                <span className="flex items-center gap-1.5 text-sm font-bold text-primary-700">
                  <Building2 size={15} /> {company.name}
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-700">{program.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarRange size={13} />
                  {formatDateBR(program.startDate)} – {formatDateBR(program.endDate)}
                </p>
                <Badge status="ativo" className="mt-3">
                  Treinamento ativo
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Você não está vinculado a nenhum treinamento corporativo no momento. Ao ser aprovado(a) por uma empresa, seus dados aparecem aqui.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Certificados</CardTitle>
            </CardHeader>
            {myCertificates.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {myCertificates.map((cert) => {
                  const course = getCourseById(cert.courseId)
                  return (
                    <div key={cert.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Award size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">{course?.title}</p>
                        <p className="text-xs text-slate-400">Emitido em {formatDateBR(cert.issuedAt)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Você ainda não tem certificados. Conclua um curso para receber o seu primeiro!</p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades recentes</CardTitle>
            </CardHeader>
            <ul className="space-y-4">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm text-slate-600">{a.description}</p>
                  <span className="shrink-0 text-xs text-slate-400">{formatDateBR(a.date)}</span>
                </li>
              ))}
              {activity.length === 0 && <p className="text-sm text-slate-400">Nenhuma atividade registrada ainda.</p>}
            </ul>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin size={14} /> Brasil (preferências de localização não configuradas)
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
