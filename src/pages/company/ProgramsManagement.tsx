import { useState } from 'react'
import { CalendarRange, Plus, SquarePen, Users } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Field'
import { MultiSelect } from '../../components/ui/MultiSelect'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { ProgramStatusBadge } from '../../components/ui/ProgramStatusBadge'
import { formatDateBR } from '../../lib/date'
import { friendlyError } from '../../lib/errors'
import { cleanName } from '../../lib/validation'
import type { Program } from '../../types'

const blankForm = () => ({
  name: '',
  startDate: '',
  endDate: '',
  description: '',
  courseIds: [] as string[],
  mentorIds: [] as string[],
  studentIds: [] as string[],
})

export default function ProgramsManagement() {
  const authUser = useAuthStore((s) => s.user)
  const companyId = authUser?.id ?? ''
  const allPrograms = useDataStore((s) => s.programs)
  const programs = allPrograms.filter((p) => p.companyId === companyId)
  const allCourses = useDataStore((s) => s.courses)
  const courses = allCourses.filter((c) => c.companyId === companyId)
  const allMentors = useDataStore((s) => s.mentors)
  const mentors = allMentors.filter((m) => m.companyId === companyId)
  const allStudents = useDataStore((s) => s.students)
  const requests = useDataStore((s) => s.enrollmentRequests)
  const addProgram = useDataStore((s) => s.addProgram)
  const updateProgram = useDataStore((s) => s.updateProgram)
  const setProgramStudents = useDataStore((s) => s.setProgramStudents)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm] = useState(blankForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm(blankForm())
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (program: Program) => {
    setEditing(program)
    setForm({
      name: program.name,
      startDate: program.startDate,
      endDate: program.endDate,
      description: program.description ?? '',
      courseIds: program.courseIds,
      mentorIds: program.mentorIds,
      studentIds: program.studentIds,
    })
    setFormError(null)
    setFormOpen(true)
  }

  // Quem pode ser vinculado direto: alunos que já estão na empresa ou que pediram para entrar nela.
  // Antes a lista trazia todo aluno visível, inclusive os recusados.
  const linkableStudents = allStudents.filter(
    (s) =>
      s.companyId === companyId ||
      form.studentIds.includes(s.id) ||
      requests.some((r) => r.studentId === s.id && r.companyId === companyId && r.status !== 'recusado')
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = cleanName(form.name)
    if (!name) {
      setFormError('Dê um nome ao treinamento.')
      return
    }
    if (form.endDate < form.startDate) {
      setFormError('A data de término precisa ser igual ou posterior à data de início.')
      return
    }
    const details = {
      name,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description.trim(),
      courseIds: form.courseIds,
      mentorIds: form.mentorIds,
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        // updateProgram já substitui os vínculos curso↔treinamento e mentor↔treinamento deste programa;
        // gravar de novo por curso/mentor (como antes) concorria com isso e podia perder vínculos.
        await updateProgram(editing.id, details)
        await setProgramStudents(editing.id, form.studentIds)
      } else {
        await addProgram({ companyId, ...details, studentIds: form.studentIds })
      }
      setFormOpen(false)
    } catch (err) {
      setFormError(friendlyError(err, 'Não foi possível salvar o treinamento. Revise os dados e tente novamente.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout sidebar={<CompanySidebar />} profileTitle="Painel da Empresa">
      <PageHeader
        title="Gestão de Treinamentos"
        description="Crie programas com nome e período, e vincule cursos, mentores e alunos. Só quem está no treinamento enxerga esse conteúdo."
        actions={
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            Novo treinamento
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {programs.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex items-start justify-between">
              <div>
                <CardTitle>{p.name}</CardTitle>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarRange size={13} /> {formatDateBR(p.startDate)} – {formatDateBR(p.endDate)}
                </p>
              </div>
              <ProgramStatusBadge program={p} />
            </CardHeader>
            {p.description && <p className="text-sm text-slate-500 dark:text-slate-400">{p.description}</p>}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-primary-50/60 dark:bg-primary-500/10 py-2.5">
                <p className="text-lg font-extrabold text-primary-700">{p.courseIds.length}</p>
                <p className="text-xs text-primary-500">Cursos</p>
              </div>
              <div className="rounded-xl bg-cta-50/60 py-2.5">
                <p className="text-lg font-extrabold text-cta-700">{p.mentorIds.length}</p>
                <p className="text-xs text-cta-500">Mentores</p>
              </div>
              <div className="rounded-xl bg-emerald-50/60 py-2.5">
                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{p.studentIds.length}</p>
                <p className="text-xs text-emerald-500 dark:text-emerald-400">Alunos</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon={<SquarePen size={13} />} className="mt-4" onClick={() => openEdit(p)}>
              Editar treinamento
            </Button>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-400">
          Nenhum treinamento criado ainda. Clique em "Novo treinamento" para começar.
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar treinamento' : 'Novo treinamento'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="program-form" disabled={saving}>
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar treinamento'}
            </Button>
          </>
        }
      >
        <form id="program-form" className="space-y-5" onSubmit={handleSubmit}>
          <Input label="Nome do treinamento" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Data de início" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required />
            <Input label="Data de término" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} required />
          </div>
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

          <MultiSelect
            label="Cursos vinculados"
            options={courses.map((c) => ({ id: c.id, label: c.title }))}
            selected={form.courseIds}
            onChange={(ids) => setForm((f) => ({ ...f, courseIds: ids }))}
            emptyLabel="Cadastre cursos primeiro em Gestão de Cursos."
          />
          <MultiSelect
            label="Mentores vinculados"
            options={mentors.map((m) => ({ id: m.id, label: m.name }))}
            selected={form.mentorIds}
            onChange={(ids) => setForm((f) => ({ ...f, mentorIds: ids }))}
            emptyLabel="Cadastre mentores primeiro em Gestão de Mentores."
          />
          <MultiSelect
            label="Alunos vinculados"
            options={linkableStudents.map((s) => ({
              id: s.id,
              label: `${s.name} (${s.email})${s.companyId && s.companyId !== companyId ? ' · em treinamento de outra empresa' : ''}`,
            }))}
            emptyLabel="Nenhum aluno disponível. Convide alunos em Gestão de Alunos."
            selected={form.studentIds}
            onChange={(ids) => setForm((f) => ({ ...f, studentIds: ids }))}
          />
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={13} /> Alunos vinculados aqui têm acesso imediato. Cada aluno participa de um treinamento por vez: vincular aqui o tira do anterior.
          </p>
          {formError && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formError}</p>}
        </form>
      </Modal>
    </DashboardLayout>
  )
}
