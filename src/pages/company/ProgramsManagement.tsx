import { useState } from 'react'
import { CalendarRange, Plus, SquarePen, Users } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Field'
import { MultiSelect } from '../../components/ui/MultiSelect'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { formatDateBR } from '../../lib/date'
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
  const students = useDataStore((s) => s.students)
  const addProgram = useDataStore((s) => s.addProgram)
  const updateProgram = useDataStore((s) => s.updateProgram)
  const setProgramStudents = useDataStore((s) => s.setProgramStudents)
  const updateCourse = useDataStore((s) => s.updateCourse)
  const updateMentorPrograms = useDataStore((s) => s.updateMentorPrograms)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Program | null>(null)
  const [form, setForm] = useState(blankForm())

  const openCreate = () => {
    setEditing(null)
    setForm(blankForm())
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
    setFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let programId = editing?.id
    if (editing) {
      updateProgram(editing.id, {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
        courseIds: form.courseIds,
        mentorIds: form.mentorIds,
      })
    } else {
      addProgram({
        companyId,
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
        courseIds: form.courseIds,
        mentorIds: form.mentorIds,
        studentIds: [],
      })
      // acha o novo id (último criado) para sincronizar vínculos
      programId = useDataStore.getState().programs.find((p) => p.companyId === companyId && p.name === form.name)?.id
    }

    if (programId) {
      // sincroniza vínculo curso -> treinamento
      courses.forEach((c) => {
        const shouldHave = form.courseIds.includes(c.id)
        const has = c.programIds.includes(programId!)
        if (shouldHave && !has) updateCourse(c.id, { programIds: [...c.programIds, programId!] })
        if (!shouldHave && has) updateCourse(c.id, { programIds: c.programIds.filter((id) => id !== programId) })
      })
      // sincroniza vínculo mentor -> treinamento
      mentors.forEach((m) => {
        const shouldHave = form.mentorIds.includes(m.id)
        const has = m.programIds.includes(programId!)
        if (shouldHave && !has) updateMentorPrograms(m.id, [...m.programIds, programId!])
        if (!shouldHave && has) updateMentorPrograms(m.id, m.programIds.filter((id) => id !== programId))
      })
      setProgramStudents(programId, form.studentIds)
    }

    setFormOpen(false)
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
              <Badge status="ativo" />
            </CardHeader>
            {p.description && <p className="text-sm text-slate-500">{p.description}</p>}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-primary-50/60 py-2.5">
                <p className="text-lg font-extrabold text-primary-700">{p.courseIds.length}</p>
                <p className="text-xs text-primary-500">Cursos</p>
              </div>
              <div className="rounded-xl bg-cta-50/60 py-2.5">
                <p className="text-lg font-extrabold text-cta-700">{p.mentorIds.length}</p>
                <p className="text-xs text-cta-500">Mentores</p>
              </div>
              <div className="rounded-xl bg-emerald-50/60 py-2.5">
                <p className="text-lg font-extrabold text-emerald-700">{p.studentIds.length}</p>
                <p className="text-xs text-emerald-500">Alunos</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon={<SquarePen size={13} />} className="mt-4" onClick={() => openEdit(p)}>
              Editar treinamento
            </Button>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
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
            <Button onClick={handleSubmit}>{editing ? 'Salvar alterações' : 'Criar treinamento'}</Button>
          </>
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input label="Nome do treinamento" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
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
            options={students.map((s) => ({ id: s.id, label: `${s.name} (${s.email})` }))}
            selected={form.studentIds}
            onChange={(ids) => setForm((f) => ({ ...f, studentIds: ids }))}
          />
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={13} /> Alunos vinculados aqui têm acesso imediato — sem necessidade de aprovação manual.
          </p>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
