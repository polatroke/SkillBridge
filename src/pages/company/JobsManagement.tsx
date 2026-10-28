import { useState } from 'react'
import { Briefcase, Lock, Plus, Search, SquarePen, Trash2, Users, X } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { MultiSelect } from '../../components/ui/MultiSelect'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { Avatar } from '../../components/ui/Avatar'
import { formatDateBR } from '../../lib/date'
import { friendlyError } from '../../lib/errors'
import type { Job, JobMode, JobStatus, JobType } from '../../types'

const jobTypes: JobType[] = ['Efetivo', 'Estágio', 'Trainee']
const jobModes: JobMode[] = ['Presencial', 'Remoto', 'Híbrido']

const blankForm = () => ({
  title: '',
  description: '',
  requirements: [''] as string[],
  department: '',
  type: jobTypes[0],
  mode: jobModes[0],
  location: '',
  programIds: [] as string[],
  status: 'aberta' as JobStatus,
})

export default function JobsManagement() {
  const authUser = useAuthStore((s) => s.user)
  const companyId = authUser?.id ?? ''
  const allJobs = useDataStore((s) => s.jobs)
  const jobs = allJobs.filter((j) => j.companyId === companyId)
  const allPrograms = useDataStore((s) => s.programs)
  const programs = allPrograms.filter((p) => p.companyId === companyId)
  const addJob = useDataStore((s) => s.addJob)
  const updateJob = useDataStore((s) => s.updateJob)
  const closeJob = useDataStore((s) => s.closeJob)
  const deleteJob = useDataStore((s) => s.deleteJob)
  const applications = useDataStore((s) => s.jobApplications)
  const students = useDataStore((s) => s.students)
  const [viewingApplicants, setViewingApplicants] = useState<Job | null>(null)
  // Só o id: o modal lê a vaga da store e reflete uma edição feita a partir dele.
  const [viewingId, setViewingId] = useState<string | null>(null)
  const viewing = viewingId ? jobs.find((j) => j.id === viewingId) : undefined

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)
  const [toDelete, setToDelete] = useState<Job | null>(null)
  const [form, setForm] = useState(blankForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(search.trim().toLowerCase()))
  const applicantsOf = (jobId: string) =>
    applications.filter((a) => a.jobId === jobId).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))

  const openCreate = () => {
    setEditing(null)
    setForm(blankForm())
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (job: Job) => {
    setEditing(job)
    setForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements.length ? job.requirements : [''],
      department: job.department,
      type: job.type,
      mode: job.mode,
      location: job.location,
      programIds: job.programIds,
      status: job.status,
    })
    setFormError(null)
    setFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // O MultiSelect não tem validação nativa: a vaga precisa de ao menos um treinamento para aparecer.
    if (form.programIds.length === 0) {
      setFormError('Selecione ao menos um treinamento: a vaga só aparece para alunos vinculados a ele.')
      return
    }
    if (!form.title.trim() || !form.description.trim() || !form.department.trim()) {
      setFormError('Preencha título, descrição e área da vaga.')
      return
    }
    const payload = {
      companyId,
      title: form.title.trim(),
      description: form.description.trim(),
      requirements: form.requirements.map((r) => r.trim()).filter(Boolean),
      department: form.department.trim(),
      type: form.type,
      mode: form.mode,
      location: form.location.trim(),
      programIds: form.programIds,
      status: form.status,
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editing) await updateJob(editing.id, payload)
      else await addJob(payload)
      setFormOpen(false)
    } catch (err) {
      setFormError(friendlyError(err, 'Não foi possível salvar a vaga. Revise os campos e tente novamente.'))
    } finally {
      setSaving(false)
    }
  }

  const handleClose = async (jobId: string) => {
    setActionError(null)
    try {
      await closeJob(jobId)
    } catch (err) {
      setActionError(friendlyError(err, 'Não foi possível encerrar a vaga. Tente novamente.'))
    }
  }

  return (
    <DashboardLayout sidebar={<CompanySidebar />} profileTitle="Painel da Empresa">
      <PageHeader
        title="Vagas Internas"
        description="Vagas sempre vinculadas a um treinamento específico — não existe vitrine pública de vagas na SkillBridge."
        actions={
          <Button icon={<Plus size={16} />} onClick={openCreate} disabled={programs.length === 0}>
            Nova vaga
          </Button>
        }
      />

      {programs.length === 0 && (
        <Card className="mb-6 flex items-center gap-3 border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10">
          <Lock size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">Crie um treinamento em Gestão de Treinamentos antes de publicar vagas — toda vaga precisa estar vinculada a um.</p>
        </Card>
      )}

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar vaga..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
        />
      </div>

      {actionError && <p className="mb-4 text-sm font-semibold text-red-600 dark:text-red-400">{actionError}</p>}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Vaga</th>
                <th className="px-5 py-3 font-semibold">Modalidade</th>
                <th className="px-5 py-3 font-semibold">Treinamento</th>
                <th className="px-5 py-3 font-semibold">Candidaturas</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filtered.map((job) => (
                <tr key={job.id}>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => setViewingId(job.id)}
                      className="text-left font-semibold text-slate-800 hover:text-primary-700 hover:underline dark:text-slate-100 dark:hover:text-primary-300"
                      title="Ver detalhes da vaga"
                    >
                      {job.title}
                    </button>
                    <p className="text-xs text-slate-400">
                      {job.department} · {job.type}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{job.mode}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {programs
                        .filter((p) => job.programIds.includes(p.id))
                        .map((p) => (
                          <span key={p.id} className="rounded-full bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 text-xs font-semibold text-primary-600">
                            {p.name}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {/* flex direto no <td> tirava a célula do layout da tabela e desalinhava a linha */}
                    <button
                      type="button"
                      onClick={() => setViewingApplicants(job)}
                      disabled={job.applicationsCount === 0}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold hover:bg-primary-50 hover:text-primary-700 disabled:pointer-events-none dark:hover:bg-primary-500/10 dark:hover:text-primary-300"
                      title={job.applicationsCount ? 'Ver candidatos' : 'Nenhuma candidatura ainda'}
                    >
                      <Briefcase size={13} /> {job.applicationsCount}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={job.status === 'aberta' ? 'aberta' : 'encerrada'} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(job)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-500/10">
                        <SquarePen size={13} /> Editar
                      </button>
                      {job.status === 'aberta' && (
                        <button onClick={() => handleClose(job.id)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60">
                          <X size={13} /> Encerrar
                        </button>
                      )}
                      <button onClick={() => setToDelete(job)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 size={13} /> Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-400">Nenhuma vaga cadastrada ainda.</p>}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar vaga' : 'Nova vaga interna'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="job-form" disabled={saving}>
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Publicar vaga'}
            </Button>
          </>
        }
      >
        <form id="job-form" className="space-y-5" onSubmit={handleSubmit}>
          <Input label="Título da vaga" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Textarea label="Descrição da vaga" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Requisitos</span>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, requirements: [...f.requirements, ''] }))}
                className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline"
              >
                <Plus size={13} /> Adicionar item
              </button>
            </div>
            <div className="space-y-2">
              {form.requirements.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
                    placeholder="Ex: Conhecimento em SQL"
                    value={r}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, requirements: f.requirements.map((req, i) => (i === idx ? e.target.value : req)) }))
                    }
                  />
                  {form.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, requirements: f.requirements.filter((_, i) => i !== idx) }))}
                      className="text-slate-300 hover:text-red-500"
                      aria-label={`Remover requisito ${idx + 1}`}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Área / departamento" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} required />
            <Input label="Localização" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Cidade, UF" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Tipo" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as JobType }))}>
              {jobTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Select label="Modalidade" value={form.mode} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as JobMode }))}>
              {jobModes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>

          <MultiSelect
            label="Treinamento vinculado"
            options={programs.map((p) => ({ id: p.id, label: p.name }))}
            selected={form.programIds}
            onChange={(ids) => setForm((f) => ({ ...f, programIds: ids }))}
            hint="Obrigatório — a vaga só aparece para alunos desse(s) treinamento(s)."
          />

          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as JobStatus }))}>
            <option value="aberta">Aberta</option>
            <option value="encerrada">Encerrada</option>
          </Select>
          {formError && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formError}</p>}
        </form>
      </Modal>

      <Modal
        open={!!viewing}
        onClose={() => setViewingId(null)}
        title={viewing?.title ?? ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewingId(null)}>
              Fechar
            </Button>
            <Button
              icon={<SquarePen size={14} />}
              onClick={() => {
                if (!viewing) return
                setViewingId(null)
                openEdit(viewing)
              }}
            >
              Editar vaga
            </Button>
          </>
        }
      >
        {viewing && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge status={viewing.status === 'aberta' ? 'aberta' : 'encerrada'} />
              <span className="rounded-full bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{viewing.type}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {[viewing.department, viewing.mode, viewing.location].filter(Boolean).join(' · ')}
              </span>
            </div>

            <section>
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Descrição</h4>
              <p className="mt-1.5 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{viewing.description}</p>
            </section>

            <section>
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Requisitos</h4>
              {viewing.requirements.length === 0 ? (
                <p className="mt-1.5 text-sm text-slate-400">Nenhum requisito cadastrado.</p>
              ) : (
                <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-slate-700 dark:text-slate-200">
                  {viewing.requirements.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Treinamentos vinculados</h4>
              <div className="mt-2 flex flex-wrap gap-1">
                {programs
                  .filter((p) => viewing.programIds.includes(p.id))
                  .map((p) => (
                    <span key={p.id} className="rounded-full bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 text-xs font-semibold text-primary-600">
                      {p.name}
                    </span>
                  ))}
              </div>
            </section>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await deleteJob(toDelete.id)
        }}
        title={`Remover "${toDelete?.title}"?`}
        description={
          toDelete?.applicationsCount
            ? `As ${toDelete.applicationsCount} candidatura(s) recebidas também serão apagadas. Para só parar de receber candidaturas, use "Encerrar".`
            : 'A vaga deixa de aparecer para os alunos dos treinamentos vinculados.'
        }
        confirmLabel="Remover"
        danger
      />

      <Modal
        open={!!viewingApplicants}
        onClose={() => setViewingApplicants(null)}
        title={`Candidatos: ${viewingApplicants?.title ?? ''}`}
        description="Alunos dos seus treinamentos que se candidataram a esta vaga."
        footer={<Button onClick={() => setViewingApplicants(null)}>Fechar</Button>}
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {viewingApplicants &&
            applicantsOf(viewingApplicants.id).map((a) => {
              const student = students.find((s) => s.id === a.studentId)
              return (
                <div key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={student?.name ?? '?'} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{student?.name ?? 'Aluno que saiu do treinamento'}</p>
                      {student?.email && (
                        <a href={`mailto:${student.email}`} className="truncate text-xs text-primary-600 hover:underline dark:text-primary-300">
                          {student.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">em {formatDateBR(a.appliedAt)}</span>
                </div>
              )
            })}
          {viewingApplicants && applicantsOf(viewingApplicants.id).length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">
              <Users size={16} className="mx-auto mb-2" />
              Nenhuma candidatura visível para esta vaga.
            </p>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  )
}
