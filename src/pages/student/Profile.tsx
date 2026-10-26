import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Building2, CalendarRange, Mail, SquarePen } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { ProgramStatusBadge } from '../../components/ui/ProgramStatusBadge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Field'
import { useAuthStore } from '../../store/authStore'
import { useDataStore, useCurrentStudent } from '../../store/dataStore'
import { isStudentInProgram } from '../../lib/access'
import { formatDateBR } from '../../lib/date'
import { friendlyError } from '../../lib/errors'
import { cleanName } from '../../lib/validation'
import type { Student } from '../../types'

function EditProfileModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const updateStudentProfile = useDataStore((s) => s.updateStudentProfile)
  const [name, setName] = useState(student.name)
  const [bio, setBio] = useState(student.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleanedName = cleanName(name)
    if (!cleanedName || cleanedName.length < 3) {
      setError('Informe seu nome completo.')
      return
    }
    setSaving(true)
    try {
      await updateStudentProfile(student.id, { name: cleanedName, bio: bio.trim() })
      onClose()
    } catch (err) {
      setError(friendlyError(err, 'Não foi possível salvar o perfil. Tente novamente.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={() => !saving && onClose()}
      title="Editar perfil"
      description="Seu nome e sua bio aparecem para mentores e para as empresas dos treinamentos em que você está."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-profile-form" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </Button>
        </>
      }
    >
      <form id="edit-profile-form" className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} maxLength={80} />
        <Input label="E-mail" value={student.email} disabled hint="O e-mail é o seu login e não pode ser alterado aqui." />
        <Textarea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          placeholder="Conte em poucas linhas o que você estuda e onde quer chegar"
          hint={`${bio.length}/280 caracteres`}
        />
        {error && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
      </form>
    </Modal>
  )
}

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
  const [editing, setEditing] = useState(false)

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
            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">{student.name}</h2>
            <p className="flex items-center justify-center gap-1.5 text-sm text-slate-400">
              <Mail size={13} /> {student.email}
            </p>
            {student.bio && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{student.bio}</p>}
            <Button variant="secondary" size="sm" fullWidth className="mt-5" icon={<SquarePen size={14} />} onClick={() => setEditing(true)}>
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
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{program.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarRange size={13} />
                  {formatDateBR(program.startDate)} – {formatDateBR(program.endDate)}
                </p>
                <ProgramStatusBadge program={program} className="mt-3" />
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
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
                    <Link
                      key={cert.id}
                      to={`/aluno/certificados/${cert.id}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:border-primary-200 dark:border-slate-700/60"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Award size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{course?.title ?? cert.courseTitle ?? 'Curso'}</p>
                        <p className="text-xs text-slate-400">Emitido em {formatDateBR(cert.issuedAt)} · Ver certificado</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Você ainda não tem certificados. Conclua um curso para receber o seu primeiro!</p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades recentes</CardTitle>
            </CardHeader>
            <ul className="space-y-4">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{a.description}</p>
                  <span className="shrink-0 text-xs text-slate-400">{formatDateBR(a.date)}</span>
                </li>
              ))}
              {activity.length === 0 && <p className="text-sm text-slate-400">Nenhuma atividade registrada ainda.</p>}
            </ul>
          </Card>
        </div>
      </div>

      {editing && <EditProfileModal student={student} onClose={() => setEditing(false)} />}
    </DashboardLayout>
  )
}
