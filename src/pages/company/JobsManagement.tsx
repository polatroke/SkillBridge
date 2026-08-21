import { useState } from 'react'
import { Briefcase, Lock, Plus, Search, SquarePen, Trash2, X } from 'lucide-react'
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

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)
  const [toDelete, setToDelete] = useState<Job | null>(null)
  const [form, setForm] = useState(blankForm())

  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => {
    setEditing(null)
    setForm(blankForm())
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
    setFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      companyId,
      title: form.title,
      description: form.description,
      requirements: form.requirements.filter((r) => r.trim() !== ''),
      department: form.department,
      type: form.type,
      mode: form.mode,
      location: form.location,
      programIds: form.programIds,
      status: form.status,
    }
    if (editing) updateJob(editing.id, payload)
    else addJob(payload)
    setFormOpen(false)
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
        <Card className="mb-6 flex items-center gap-3 border border-amber-200 bg-amber-50/60">
          <Lock size={18} className="shrink-0 text-amber-600" />
          <p className="text-sm text-amber-700">Crie um treinamento em Gestão de Treinamentos antes de publicar vagas — toda vaga precisa estar vinculada a um.</p>
        </Card>
      )}

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar vaga..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Vaga</th>
                <th className="px-5 py-3 font-semibold">Modalidade</th>
                <th className="px-5 py-3 font-semibold">Treinamento</th>
                <th className="px-5 py-3 font-semibold">Candidaturas</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((job) => (
                <tr key={job.id}>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{job.title}</p>
                    <p className="text-xs text-slate-400">
                      {job.department} · {job.type}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{job.mode}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {programs
                        .filter((p) => job.programIds.includes(p.id))
                        .map((p) => (
                          <span key={p.id} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-600">
                            {p.name}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 flex items-center gap-1.5 text-slate-600">
                    <Briefcase size={13} /> {job.applicationsCount}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={job.status === 'aberta' ? 'aberta' : 'encerrada'} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(job)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-50">
                        <SquarePen size={13} /> Editar
                      </button>
                      {job.status === 'aberta' && (
                        <button onClick={() => closeJob(job.id)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100">
                          <X size={13} /> Encerrar
                        </button>
                      )}
                      <button onClick={() => setToDelete(job)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50">
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
            <Button onClick={handleSubmit}>{editing ? 'Salvar alterações' : 'Publicar vaga'}</Button>
          </>
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input label="Título da vaga" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Textarea label="Descrição da vaga" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Requisitos</span>
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
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
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
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Área / departamento" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} required />
            <Input label="Localização" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Cidade, UF" />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteJob(toDelete.id)}
        title={`Remover "${toDelete?.title}"?`}
        confirmLabel="Remover"
        danger
      />
    </DashboardLayout>
  )
}
